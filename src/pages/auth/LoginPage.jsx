import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Sparkles, Mail, Lock, Shield, User, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';

export const LoginPage = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const u = await login(email, password);
      if (['CAMPUS_ADMIN', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN'].includes(u.role)) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (role) => {
    loginAsDemo(role);
    if (role === 'student') {
      navigate('/dashboard');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        {/* Logo Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              Campus<span className="text-indigo-600">Pulse</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500">Sign in to report incidents or manage campus operations</p>
        </div>

        {/* 1-Click Quick Demo Access Card */}
        <Card className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 space-y-2.5">
          <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Instant One-Click Demo Personas
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSelect('student')}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-all text-center"
            >
              <User className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
              Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('dept')}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-all text-center"
            >
              <Shield className="w-4 h-4 mx-auto mb-1 text-amber-600" />
              Dept Lead
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('admin')}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-all text-center"
            >
              <Shield className="w-4 h-4 mx-auto mb-1 text-purple-600" />
              Executive
            </button>
          </div>
        </Card>

        {/* Standard Login Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Campus Email Address"
              type="email"
              placeholder="e.g. saravanan@college.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
