import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Cube, Lightning, Users, ChartBar, House } from 'phosphor-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 noise-bg">
      {/* Header */}
      <header className="glass-nav border-b border-slate-200/50 fixed top-0 left-0 right-0 z-50">
        <div className="px-6 md:px-12 lg:px-24 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-slate-900 hover:text-teal-600 transition-colors"
              data-testid="home-icon"
              aria-label="Home"
            >
              <House size={24} weight="regular" />
            </button>
            <h1 className="font-clash font-semibold text-2xl text-slate-900">ProjectPredict</h1>
          </div>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/login')}
              data-testid="header-login-button"
            >
              Login
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/signup')}
              data-testid="header-signup-button"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="font-clash font-semibold tracking-tight text-slate-900 text-4xl sm:text-5xl lg:text-6xl mb-6">
              Predict the Future of Your Build
            </h1>
            <p className="font-general text-lg text-slate-600 max-w-2xl mx-auto mb-12">
              AI-driven cost and timeline estimation for the modern era. Get accurate predictions for software, construction, industrial, and energy projects.
            </p>
            <Button
              variant="accent"
              onClick={() => navigate('/signup')}
              className="text-lg px-12 py-4"
              data-testid="hero-get-started-button"
            >
              Start Predicting Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-sm hover:border-slate-400 group" data-testid="feature-cost-accuracy">
              <ChartBar size={40} weight="regular" className="text-teal-600 mb-4" />
              <h3 className="font-clash font-semibold text-xl text-slate-900 mb-2">Cost Accuracy</h3>
              <p className="font-general text-sm text-slate-600">Get precise cost estimates in lakhs based on project scope and complexity.</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-sm hover:border-slate-400 group" data-testid="feature-timeline-prediction">
              <Lightning size={40} weight="regular" className="text-orange-500 mb-4" />
              <h3 className="font-clash font-semibold text-xl text-slate-900 mb-2">Timeline Prediction</h3>
              <p className="font-general text-sm text-slate-600">Accurate project duration estimates to plan your roadmap effectively.</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-sm hover:border-slate-400 group" data-testid="feature-team-composition">
              <Users size={40} weight="regular" className="text-teal-600 mb-4" />
              <h3 className="font-clash font-semibold text-xl text-slate-900 mb-2">Team Composition</h3>
              <p className="font-general text-sm text-slate-600">AI-recommended team roles and structure for optimal project execution.</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-sm hover:border-slate-400 group" data-testid="feature-multi-industry">
              <Cube size={40} weight="regular" className="text-orange-500 mb-4" />
              <h3 className="font-clash font-semibold text-xl text-slate-900 mb-2">Multi-Industry</h3>
              <p className="font-general text-sm text-slate-600">Support for software, construction, industrial, and energy projects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-clash font-semibold text-3xl md:text-4xl text-slate-900 mb-6">
            Ready to predict your project's success?
          </h2>
          <p className="font-general text-lg text-slate-600 mb-12">
            Join hundreds of project managers making data-driven decisions.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/signup')}
            className="text-lg px-12 py-4"
            data-testid="cta-signup-button"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-general text-sm text-slate-500">
            © 2026 ProjectPredict. AI-powered project estimation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;