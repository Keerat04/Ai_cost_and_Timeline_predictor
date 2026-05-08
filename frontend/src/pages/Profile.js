import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import axios from 'axios';
import { ArrowLeft, User, Envelope, Lock, Check } from 'phosphor-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    
    if (!profileData.name.trim()) {
      setProfileError('Name is required');
      return;
    }
    
    if (!profileData.email.trim()) {
      setProfileError('Email is required');
      return;
    }
    
    setProfileLoading(true);
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, {
        name: profileData.name,
        email: profileData.email
      });
      setProfileSuccess('Profile updated successfully!');
      // Update local state
      setProfileData({
        name: response.data.name,
        email: response.data.email
      });
      // Update AuthContext so other pages reflect the change
      updateUser(response.data);
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    setPasswordLoading(true);
    try {
      await axios.put(`${API_URL}/auth/change-password`, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 noise-bg" data-testid="profile-page">
      {/* Header */}
      <header className="glass-nav border-b border-slate-200/50">
        <div className="px-6 md:px-12 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-general text-sm"
              data-testid="back-to-dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={20} weight="bold" />
              Back
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <h1 className="font-clash font-semibold text-2xl text-slate-900">Profile Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 md:px-12 lg:px-24 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Profile Information */}
          <Card data-testid="profile-info-card">
            <div className="flex items-center gap-3 mb-6">
              <User size={24} weight="regular" className="text-teal-600" />
              <h2 className="font-clash font-semibold text-xl text-slate-900">Profile Information</h2>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                placeholder="Your full name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                data-testid="profile-name-input"
              />
              
              <div className="relative">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your.email@example.com"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  data-testid="profile-email-input"
                />
                <Envelope size={20} className="absolute right-4 top-10 text-slate-400" />
              </div>
              
              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-general text-sm" data-testid="profile-error">
                  {profileError}
                </div>
              )}
              
              {profileSuccess && (
                <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-sm font-general text-sm flex items-center gap-2" data-testid="profile-success">
                  <Check size={18} weight="bold" />
                  {profileSuccess}
                </div>
              )}
              
              <Button
                type="submit"
                variant="primary"
                disabled={profileLoading}
                data-testid="update-profile-button"
              >
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Card>
          
          {/* Change Password */}
          <Card data-testid="change-password-card">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} weight="regular" className="text-orange-500" />
              <h2 className="font-clash font-semibold text-xl text-slate-900">Change Password</h2>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter your current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                data-testid="current-password-input"
              />
              
              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                data-testid="new-password-input"
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                data-testid="confirm-new-password-input"
              />
              
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-general text-sm" data-testid="password-error">
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-sm font-general text-sm flex items-center gap-2" data-testid="password-success">
                  <Check size={18} weight="bold" />
                  {passwordSuccess}
                </div>
              )}
              
              <Button
                type="submit"
                variant="accent"
                disabled={passwordLoading}
                data-testid="change-password-button"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </Card>
          
          {/* Account Info */}
          <Card className="bg-slate-100" data-testid="account-info-card">
            <p className="font-general text-sm text-slate-600">
              <span className="font-semibold">Account created:</span>{' '}
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </p>
          </Card>
          
        </div>
      </main>
    </div>
  );
};

export default Profile;
