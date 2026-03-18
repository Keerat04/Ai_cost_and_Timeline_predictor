import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { House } from 'phosphor-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testOtp, setTestOtp] = useState(''); // For testing when email not configured

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess(response.data.message);
      
      // If OTP returned (testing mode), show it
      if (response.data.otp) {
        setTestOtp(response.data.otp);
      }
      
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!otp || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        otp,
        new_password: newPassword
      });
      setSuccess('Password reset successful! You can now login with your new password.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 noise-bg flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" data-testid="forgot-password-container">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3">
            <Link to="/" className="text-slate-900 hover:text-teal-600 transition-colors" data-testid="home-icon" aria-label="Home">
              <House size={24} weight="regular" />
            </Link>
            <Link to="/" className="font-clash font-semibold text-2xl text-slate-900">ProjectPredict</Link>
          </div>
          
          <h1 className="font-clash font-semibold text-3xl text-slate-900 mb-2">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h1>
          <p className="font-general text-slate-600 mb-8">
            {step === 1 
              ? 'Enter your email to receive a password reset OTP' 
              : 'Enter the OTP sent to your email and your new password'
            }
          </p>
          
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="forgot-password-email-input"
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-general text-sm" data-testid="error-message">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-sm font-general text-sm" data-testid="success-message">
                  {success}
                </div>
              )}
              
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
                data-testid="send-otp-button"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {testOtp && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-sm font-general text-sm" data-testid="test-otp-display">
                  <strong>Testing Mode:</strong> Your OTP is <strong className="text-xl">{testOtp}</strong>
                </div>
              )}
              
              <Input
                label="OTP Code"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                data-testid="otp-input"
              />
              
              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="new-password-input"
              />
              
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="confirm-password-input"
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-general text-sm" data-testid="error-message">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-sm font-general text-sm" data-testid="success-message">
                  {success}
                </div>
              )}
              
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
                data-testid="reset-password-button"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setStep(1)}
                data-testid="back-button"
              >
                Back
              </Button>
            </form>
          )}
          
          <p className="text-center mt-8 font-general text-sm text-slate-600">
            Remember your password?{' '}
            <Link to="/login" className="text-slate-900 font-semibold hover:underline" data-testid="back-to-login-link">
              Back to login
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
              "Security is not a product, but a process."
            </p>
            <p className="font-general text-slate-300">— Bruce Schneier</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;