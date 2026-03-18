import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { House } from 'phosphor-react';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError('');
    
    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.name);
      navigate('/dashboard');
    } catch (error) {
      setApiError(error.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 noise-bg flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" data-testid="signup-form-container">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3">
            <Link to="/" className="text-slate-900 hover:text-teal-600 transition-colors" data-testid="home-icon" aria-label="Home">
              <House size={24} weight="regular" />
            </Link>
            <Link to="/" className="font-clash font-semibold text-2xl text-slate-900">ProjectPredict</Link>
          </div>
          
          <h1 className="font-clash font-semibold text-3xl text-slate-900 mb-2">Create Account</h1>
          <p className="font-general text-slate-600 mb-8">Start predicting your project costs and timelines</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              data-testid="signup-name-input"
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              data-testid="signup-email-input"
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              data-testid="signup-password-input"
            />
            
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-general text-sm" data-testid="signup-error-message">
                {apiError}
              </div>
            )}
            
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
              data-testid="signup-submit-button"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <p className="text-center mt-8 font-general text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-slate-900 font-semibold hover:underline" data-testid="signup-login-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1640696085101-12085802bcf3?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Technology"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-12">
          <div className="text-white text-center">
            <p className="font-clash text-2xl font-semibold mb-4">
              "The best way to predict the future is to create it."
            </p>
            <p className="font-general text-slate-300">— Peter Drucker</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;