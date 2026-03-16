import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError('');
    
    // Validation
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setApiError(error.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 noise-bg flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" data-testid="login-form-container">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <Link to="/" className="font-clash font-semibold text-2xl text-slate-900">ProjectPredict</Link>
          </div>
          
          <h1 className="font-clash font-semibold text-3xl text-slate-900 mb-2">Welcome Back</h1>
          <p className="font-general text-slate-600 mb-8">Log in to access your project predictions</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              data-testid="login-email-input"
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              data-testid="login-password-input"
            />
            
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-general text-sm" data-testid="login-error-message">
                {apiError}
              </div>
            )}
            
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          
          <p className="text-center mt-8 font-general text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-slate-900 font-semibold hover:underline" data-testid="login-signup-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1761227390482-bccb032eeea6?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Construction"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-12">
          <div className="text-white text-center">
            <p className="font-clash text-2xl font-semibold mb-4">
              "Planning is bringing the future into the present so that you can do something about it now."
            </p>
            <p className="font-general text-slate-300">— Alan Lakein</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;