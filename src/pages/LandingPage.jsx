import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Sparkles,
  MapPin,
  Shield,
  Zap,
  Activity,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Flame,
  Users
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export const LandingPage = () => {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleLaunch = (role) => {
    loginAsDemo(role);
    if (role === 'student') {
      navigate('/dashboard');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Campus<span className="text-indigo-600 dark:text-indigo-400">Pulse</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-1">
              AI Issue Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/map">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-500" />
              Public Map
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Button size="sm" onClick={() => handleLaunch('student')} className="shadow-xs">
            Try Demo
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20 flex flex-col items-center text-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini AI Triage & Geolocation Intelligence
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 dark:text-white max-w-4xl leading-[1.12]">
          Resolve Campus Incidents Before They Disrupt Academic Life.
        </h1>

        {/* Subhead */}
        <p className="mt-5 text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Real-time incident reporting with automated Gemini AI categorization, SLA priority triage, and interactive geospatial heatmap intelligence for universities.
        </p>

        {/* 1-Click Launch Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => handleLaunch('student')} className="px-6 py-3 shadow-md">
            <span>Explore as Student</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button size="lg" variant="secondary" onClick={() => handleLaunch('campusAdmin')} className="px-6 py-3">
            <Shield className="w-4 h-4 mr-2 text-indigo-600" />
            <span>Launch Campus Admin Suite</span>
          </Button>

          <Link to="/map">
            <Button size="lg" variant="outline" className="px-6 py-3">
              <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
              <span>Interactive Campus Map</span>
            </Button>
          </Link>
        </div>

        {/* Quick Demo Credentials Reminder */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Test Accounts:</span>
          <span className="bg-slate-100 dark:bg-slate-800/70 px-2 py-0.5 rounded-md font-mono">student@campuspulse.demo</span>
          <span className="bg-slate-100 dark:bg-slate-800/70 px-2 py-0.5 rounded-md font-mono">admin@campuspulse.demo</span>
          <span className="bg-slate-100 dark:bg-slate-800/70 px-2 py-0.5 rounded-md font-mono">dept@campuspulse.demo</span>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 w-full grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-left shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mb-2">
              <Activity className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">94.8%</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Campus Health Index</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-left shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">&lt; 15m</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Mean Time to Triage</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-left shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-2">
              <Flame className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">92.4%</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">SLA Deadline Adherence</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-left shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 flex items-center justify-center mb-2">
              <Cpu className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">100%</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">AI Auto-Dispatch</p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 w-full grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Instant AI Triage & Analysis
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Gemini reads student incident titles and photos, auto-detects categories, assesses safety hazard levels, and suggests responsible departments.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Leaflet Heatmap & Campus Zones
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Geospatial density heatmap visualizes problem hotspots across hostel blocks, science wings, libraries, and cafeteria grounds in real time.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Role-Based SLA Governance
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Department leads and campus directors track resolution countdown timers, assign emergency technicians, and resolve issues collaboratively.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>CampusPulse — AI-Powered Campus Issue Intelligence Platform. All-in-one unified build.</p>
      </footer>
    </div>
  );
};
