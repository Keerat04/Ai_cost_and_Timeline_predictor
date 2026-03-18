from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import random
import asyncio
import resend
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT config
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = timedelta(days=7)

# Resend config
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
if RESEND_API_KEY and RESEND_API_KEY != 'placeholder_add_your_key_here':
    resend.api_key = RESEND_API_KEY

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    user: User

class ProjectPrediction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    prompt: str
    duration_months: float
    cost_min_lakhs: float
    cost_max_lakhs: float
    team: List[str]
    phases: List[str]
    tools: List[str]
    project_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PredictionRequest(BaseModel):
    prompt: str

class PredictionResponse(BaseModel):
    id: str
    duration_months: float
    cost_min_lakhs: float
    cost_max_lakhs: float
    team: List[str]
    phases: List[str]
    tools: List[str]
    project_type: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    otp: Optional[str] = None  # Only for testing when email not configured

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + JWT_EXPIRATION
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    return verify_token(token)

def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

async def send_otp_email(email: str, otp: str) -> bool:
    """Send OTP via email"""
    if not RESEND_API_KEY or RESEND_API_KEY == 'placeholder_add_your_key_here':
        logging.warning(f"Email not configured. OTP for {email}: {otp}")
        return False
    
    try:
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0F172A;">Password Reset OTP</h2>
                <p>You requested to reset your password for ProjectPredict.</p>
                <div style="background-color: #F8FAFC; border: 2px solid #0D9488; padding: 20px; margin: 20px 0; text-align: center;">
                    <h1 style="color: #0F172A; font-size: 36px; margin: 0; letter-spacing: 8px;">{otp}</h1>
                </div>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p style="color: #64748B; font-size: 12px; margin-top: 30px;">ProjectPredict - AI Project Cost & Timeline Predictor</p>
            </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": "Password Reset OTP - ProjectPredict",
            "html": html_content
        }
        
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        logging.error(f"Failed to send OTP email: {str(e)}")
        return False

# Auth endpoints
@api_router.post("/auth/signup", response_model=AuthResponse)
async def signup(input: UserSignup):
    # Check if user exists
    existing_user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(email=input.email, name=input.name)
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['password'] = hash_password(input.password)
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_token(user.id)
    
    return AuthResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(input: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(input.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Convert timestamp
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    token = create_token(user.id)
    
    return AuthResponse(token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.post("/auth/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(input: ForgotPasswordRequest):
    # Check if user exists
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc:
        # Don't reveal if email exists for security
        return ForgotPasswordResponse(message="If this email exists, an OTP has been sent")
    
    # Generate OTP
    otp = generate_otp()
    otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Store OTP in database
    await db.password_resets.delete_many({"email": input.email})  # Remove old OTPs
    await db.password_resets.insert_one({
        "email": input.email,
        "otp": otp,
        "expiry": otp_expiry.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Send OTP via email
    email_sent = await send_otp_email(input.email, otp)
    
    # For testing: if email not configured, return OTP in response
    if not email_sent:
        return ForgotPasswordResponse(
            message="Email not configured. OTP generated for testing.",
            otp=otp
        )
    
    return ForgotPasswordResponse(message="OTP sent to your email")

@api_router.post("/auth/reset-password")
async def reset_password(input: VerifyOTPRequest):
    # Find OTP record
    otp_doc = await db.password_resets.find_one({"email": input.email}, {"_id": 0})
    if not otp_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Check if OTP matches
    if otp_doc['otp'] != input.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Check if OTP expired
    expiry = datetime.fromisoformat(otp_doc['expiry'])
    if datetime.now(timezone.utc) > expiry:
        await db.password_resets.delete_one({"email": input.email})
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    # Update user password
    hashed_password = hash_password(input.new_password)
    result = await db.users.update_one(
        {"email": input.email},
        {"$set": {"password": hashed_password}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete used OTP
    await db.password_resets.delete_one({"email": input.email})
    
    return {"message": "Password reset successful"}

# Prediction endpoint
@api_router.post("/predict", response_model=PredictionResponse)
async def predict(input: PredictionRequest, user_id: str = Depends(get_current_user)):
    try:
        # Initialize LLM chat
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=f"prediction_{user_id}_{uuid.uuid4()}",
            system_message="""You are an expert project estimation AI. You analyze project descriptions and provide accurate estimates for duration, cost, team composition, phases, and tools.

You must respond with ONLY valid JSON in this exact format:
{
  "duration_months": <number>,
  "cost_min_lakhs": <number>,
  "cost_max_lakhs": <number>,
  "team": ["role1", "role2", ...],
  "phases": ["phase1", "phase2", ...],
  "tools": ["tool1", "tool2", ...],
  "project_type": "software|construction|industrial|energy"
}

IMPORTANT COST REQUIREMENTS:
- Always provide cost as a RANGE (cost_min_lakhs and cost_max_lakhs)
- The range should reflect uncertainty and risk factors (typically 20-30% variance)
- cost_min_lakhs should be the lower bound estimate
- cost_max_lakhs should be the upper bound estimate
- Both values should be in Indian Lakhs (1 Lakh = 100,000)

Consider:
- Project scale and complexity
- Team size requirements
- Technology stack
- Industry standards
- Risk factors and contingencies
- Market rates for resources

Provide realistic estimates based on project description."""
        ).with_model("openai", "gpt-5.2")
        
        # Send message
        user_message = UserMessage(text=f"Project Description: {input.prompt}")
        response_text = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        prediction_data = json.loads(response_text.strip())
        
        # Create prediction record
        prediction = ProjectPrediction(
            user_id=user_id,
            prompt=input.prompt,
            duration_months=prediction_data['duration_months'],
            cost_min_lakhs=prediction_data['cost_min_lakhs'],
            cost_max_lakhs=prediction_data['cost_max_lakhs'],
            team=prediction_data['team'],
            phases=prediction_data['phases'],
            tools=prediction_data['tools'],
            project_type=prediction_data['project_type']
        )
        
        # Save to database
        pred_doc = prediction.model_dump()
        pred_doc['created_at'] = pred_doc['created_at'].isoformat()
        await db.predictions.insert_one(pred_doc)
        
        return PredictionResponse(
            id=prediction.id,
            duration_months=prediction.duration_months,
            cost_min_lakhs=prediction.cost_min_lakhs,
            cost_max_lakhs=prediction.cost_max_lakhs,
            team=prediction.team,
            phases=prediction.phases,
            tools=prediction.tools,
            project_type=prediction.project_type
        )
    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Get user's prediction history
@api_router.get("/projects")
async def get_projects(user_id: str = Depends(get_current_user)):
    predictions = await db.predictions.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Handle backward compatibility for old predictions
    for pred in predictions:
        if isinstance(pred['created_at'], str):
            pred['created_at'] = datetime.fromisoformat(pred['created_at'])
        
        # Convert old format to new format
        if 'cost_lakhs' in pred and 'cost_min_lakhs' not in pred:
            cost = pred.pop('cost_lakhs')
            pred['cost_min_lakhs'] = cost * 0.85  # -15% for min
            pred['cost_max_lakhs'] = cost * 1.15  # +15% for max
    
    return predictions

@api_router.get("/")
async def root():
    return {"message": "AI Project Cost & Timeline Predictor API"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()