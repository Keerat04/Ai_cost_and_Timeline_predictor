import requests
import sys
import json
from datetime import datetime

class APITester:
    def __init__(self, base_url="https://ai-cost-predictor.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Error: {response.text[:200]}")

            self.test_results.append({
                'name': name,
                'endpoint': endpoint,
                'method': method,
                'status_code': response.status_code,
                'expected_status': expected_status,
                'success': success,
                'response_text': response.text[:500] if not success else "OK"
            })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                'name': name,
                'endpoint': endpoint,
                'method': method,
                'status_code': 'ERROR',
                'expected_status': expected_status,
                'success': False,
                'response_text': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_signup(self, name, email, password):
        """Test user signup"""
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data={"name": name, "email": email, "password": password}
        )
        if success and 'token' in response and 'user' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Token received: {self.token[:20]}...")
            print(f"   User ID: {self.user_id}")
            return True
        return False

    def test_signup_duplicate_email(self, email, password):
        """Test signup with duplicate email (should fail)"""
        success, response = self.run_test(
            "Duplicate Email Signup (Should Fail)",
            "POST",
            "auth/signup",
            400,
            data={"name": "Test User 2", "email": email, "password": password}
        )
        return success

    def test_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   New token: {self.token[:20]}...")
            return True
        return False

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials (should fail)"""
        success, response = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"}
        )
        return success

    def test_get_me(self):
        """Test get current user info"""
        if not self.token:
            print("❌ No token available for authentication test")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_get_me_without_token(self):
        """Test get current user without token (should fail)"""
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Get User Without Token (Should Fail)",
            "GET",
            "auth/me",
            403  # FastAPI returns 403 for missing credentials
        )
        
        self.token = original_token
        return success

    def test_predict_project(self, prompt):
        """Test project prediction"""
        if not self.token:
            print("❌ No token available for prediction test")
            return False, None
            
        print(f"   Testing with prompt: {prompt[:50]}...")
        success, response = self.run_test(
            "Project Prediction",
            "POST",
            "predict",
            200,
            data={"prompt": prompt}
        )
        
        # Validate response structure if successful
        if success and response:
            required_fields = ['id', 'duration_months', 'cost_lakhs', 'team', 'phases', 'tools', 'project_type']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️ Warning: Missing fields in response: {missing_fields}")
            else:
                print(f"   Duration: {response.get('duration_months')} months")
                print(f"   Cost: ₹{response.get('cost_lakhs')} lakhs")
                print(f"   Project Type: {response.get('project_type')}")
                print(f"   Team Size: {len(response.get('team', []))} roles")
        
        return success, response

    def test_predict_without_token(self):
        """Test prediction without token (should fail)"""
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Prediction Without Token (Should Fail)",
            "POST",
            "predict",
            403,
            data={"prompt": "Build a simple website"}
        )
        
        self.token = original_token
        return success

    def test_predict_empty_prompt(self):
        """Test prediction with empty prompt"""
        if not self.token:
            print("❌ No token available for prediction test")
            return False
            
        success, response = self.run_test(
            "Prediction with Empty Prompt",
            "POST",
            "predict",
            200,  # Backend should handle this gracefully
            data={"prompt": ""}
        )
        return success

    def test_get_projects(self):
        """Test get user's project history"""
        if not self.token:
            print("❌ No token available for projects test")
            return False
            
        success, response = self.run_test(
            "Get User Projects",
            "GET",
            "projects",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} projects in history")
        
        return success

    def print_summary(self):
        """Print test summary"""
        print(f"\n📊 Test Summary")
        print(f"="*50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   • {test['name']} - {test['status_code']} (expected {test['expected_status']})")
                if test['response_text'] != "OK":
                    print(f"     Error: {test['response_text'][:100]}...")

def main():
    """Main test execution"""
    print("🚀 Starting AI Project Cost Predictor API Tests")
    print("="*60)
    
    # Setup
    tester = APITester()
    timestamp = datetime.now().strftime('%H%M%S')
    test_email = f"test_user_{timestamp}@test.com"
    test_password = "TestPass123!"
    test_name = f"Test User {timestamp}"
    
    # Test execution
    print(f"\n📝 Test Configuration:")
    print(f"   Base URL: {tester.base_url}")
    print(f"   Test Email: {test_email}")
    print(f"   Test Name: {test_name}")
    
    # 1. Test root endpoint
    if not tester.test_root_endpoint():
        print("❌ Root endpoint failed - API might be down")
        tester.print_summary()
        return 1
    
    # 2. Test user signup
    if not tester.test_signup(test_name, test_email, test_password):
        print("❌ Signup failed - cannot proceed with authenticated tests")
        tester.print_summary()
        return 1
    
    # 3. Test duplicate signup (should fail)
    tester.test_signup_duplicate_email(test_email, test_password)
    
    # 4. Test login
    if not tester.test_login(test_email, test_password):
        print("❌ Login failed")
    
    # 5. Test invalid login
    tester.test_login_invalid_credentials()
    
    # 6. Test get current user
    tester.test_get_me()
    
    # 7. Test get user without token
    tester.test_get_me_without_token()
    
    # 8. Test project prediction with different types
    test_prompts = [
        "Build a mobile app for food delivery with real-time tracking, user authentication, and payment integration",
        "Create a solar power plant with 100MW capacity including grid connection and monitoring systems",
        "Develop an industrial automation system for a manufacturing plant with robotics and IoT sensors",
        "Construct a 20-story commercial office building with modern amenities and parking garage"
    ]
    
    prediction_results = []
    for i, prompt in enumerate(test_prompts):
        success, result = tester.test_predict_project(prompt)
        if success and result:
            prediction_results.append(result)
    
    # 9. Test prediction without token
    tester.test_predict_without_token()
    
    # 10. Test prediction with empty prompt
    tester.test_predict_empty_prompt()
    
    # 11. Test get projects history
    tester.test_get_projects()
    
    # Print final summary
    tester.print_summary()
    
    # Additional analysis
    if prediction_results:
        print(f"\n📈 Prediction Results Analysis:")
        print(f"   Generated {len(prediction_results)} predictions")
        avg_duration = sum(p['duration_months'] for p in prediction_results) / len(prediction_results)
        avg_cost = sum(p['cost_lakhs'] for p in prediction_results) / len(prediction_results)
        project_types = [p['project_type'] for p in prediction_results]
        
        print(f"   Average Duration: {avg_duration:.1f} months")
        print(f"   Average Cost: ₹{avg_cost:.1f} lakhs")
        print(f"   Project Types: {', '.join(set(project_types))}")
    
    # Return success/failure status
    success_rate = (tester.tests_passed / tester.tests_run) * 100
    if success_rate >= 80:
        print(f"\n✅ Backend tests completed successfully ({success_rate:.1f}% success rate)")
        return 0
    else:
        print(f"\n❌ Backend tests completed with issues ({success_rate:.1f}% success rate)")
        return 1

if __name__ == "__main__":
    sys.exit(main())