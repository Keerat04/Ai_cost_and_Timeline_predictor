import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import Card from '../components/Card';
import axios from 'axios';
import { SignOut, Clock, CurrencyDollar, Users, ListChecks, Wrench, House } from 'phosphor-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCost = (minLakhs, maxLakhs) => {
    // If max value exceeds 99 lakhs, convert to crores
    if (maxLakhs > 99) {
      const minCrores = (minLakhs / 100).toFixed(2);
      const maxCrores = (maxLakhs / 100).toFixed(2);
      return {
        display: `₹${minCrores} - ${maxCrores}`,
        unit: 'Crores'
      };
    }
    return {
      display: `₹${minLakhs} - ${maxLakhs}`,
      unit: 'Lakhs'
    };
  };

  const handlePredict = async () => {
    if (!prompt.trim()) {
      setError('Please describe your project');
      return;
    }
    
    setError('');
    setLoading(true);
    setPrediction(null);
    
    try {
      const response = await axios.post(`${API_URL}/predict`, { prompt });
      setPrediction(response.data);
      setPrompt('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 noise-bg" data-testid="dashboard-page">
      {/* Header */}
      <header className="glass-nav border-b border-slate-200/50">
        <div className="px-6 md:px-12 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-900 hover:text-teal-600 transition-colors"
              data-testid="home-icon"
              aria-label="Home"
            >
              <House size={24} weight="regular" />
            </button>
            <h1 className="font-clash font-semibold text-2xl text-slate-900">ProjectPredict</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-general text-sm text-slate-600" data-testid="user-greeting">
              Welcome, {user?.name}
            </span>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="flex items-center gap-2"
              data-testid="logout-button"
            >
              <SignOut size={18} weight="regular" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 md:px-12 lg:px-24 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-12">
            <h2 className="font-clash font-semibold text-4xl text-slate-900 mb-4">
              AI Project Cost & Timeline Predictor
            </h2>
            <p className="font-general text-lg text-slate-600">
              Describe your project and get intelligent predictions for cost, timeline, team structure, and more.
            </p>
          </div>

          {/* Input Section */}
          <Card className="mb-8" data-testid="prediction-input-card">
            <Textarea
              label="Project Description"
              placeholder="Describe your project in detail. For example: 'Build a solar power plant with 100MW capacity' or 'Create a mobile app for food delivery with real-time tracking'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              data-testid="project-description-input"
            />
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-general text-sm" data-testid="prediction-error-message">
                {error}
              </div>
            )}
            
            <div className="mt-6">
              <Button
                variant="accent"
                onClick={handlePredict}
                disabled={loading}
                className="w-full md:w-auto text-base"
                data-testid="predict-button"
              >
                {loading ? 'Analyzing Project...' : 'Predict Project Plan'}
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          {prediction && (
            <div className="space-y-6" data-testid="prediction-results">
              <h3 className="font-clash font-semibold text-2xl text-slate-900 mb-6">
                Prediction Results
              </h3>
              
              {/* Key Metrics */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card tracing className="count-up" data-testid="result-duration">
                  <div className="flex items-start gap-4">
                    <Clock size={32} weight="regular" className="text-teal-600 flex-shrink-0" />
                    <div>
                      <p className="uppercase text-xs font-bold text-slate-500 mb-1 font-general">Estimated Duration</p>
                      <p className="font-clash font-bold text-4xl text-slate-900 tabular-nums">
                        {prediction.duration_months}
                      </p>
                      <p className="font-general text-sm text-slate-600 mt-1">Months</p>
                    </div>
                  </div>
                </Card>
                
                <Card tracing className="count-up" data-testid="result-cost">
                  <div className="flex items-start gap-4">
                    <CurrencyDollar size={32} weight="regular" className="text-orange-500 flex-shrink-0" />
                    <div>
                      <p className="uppercase text-xs font-bold text-slate-500 mb-1 font-general">Estimated Cost Range</p>
                      <p className="font-clash font-bold text-4xl text-slate-900 tabular-nums">
                        {formatCost(prediction.cost_min_lakhs, prediction.cost_max_lakhs).display}
                      </p>
                      <p className="font-general text-sm text-slate-600 mt-1">
                        {formatCost(prediction.cost_min_lakhs, prediction.cost_max_lakhs).unit}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Project Type */}
              <Card data-testid="result-project-type">
                <p className="uppercase text-xs font-bold text-slate-500 mb-2 font-general">Project Type</p>
                <p className="font-general text-lg text-slate-900 capitalize">{prediction.project_type}</p>
              </Card>
              
              {/* Team Composition */}
              <Card data-testid="result-team">
                <div className="flex items-center gap-3 mb-4">
                  <Users size={24} weight="regular" className="text-teal-600" />
                  <h4 className="font-clash font-semibold text-xl text-slate-900">Required Team Roles</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prediction.team.map((role, index) => (
                    <span
                      key={index}
                      className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-sm font-general text-sm text-slate-700"
                      data-testid={`team-role-${index}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </Card>
              
              {/* Development Phases */}
              <Card data-testid="result-phases">
                <div className="flex items-center gap-3 mb-4">
                  <ListChecks size={24} weight="regular" className="text-orange-500" />
                  <h4 className="font-clash font-semibold text-xl text-slate-900">Project Development Phases</h4>
                </div>
                <ol className="space-y-2">
                  {prediction.phases.map((phase, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 font-general text-slate-700"
                      data-testid={`phase-${index}`}
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      {phase}
                    </li>
                  ))}
                </ol>
              </Card>
              
              {/* Recommended Tools */}
              <Card data-testid="result-tools">
                <div className="flex items-center gap-3 mb-4">
                  <Wrench size={24} weight="regular" className="text-teal-600" />
                  <h4 className="font-clash font-semibold text-xl text-slate-900">Recommended Tools & Technologies</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prediction.tools.map((tool, index) => (
                    <span
                      key={index}
                      className="bg-teal-50 border border-teal-200 px-4 py-2 rounded-sm font-general text-sm text-teal-900"
                      data-testid={`tool-${index}`}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;