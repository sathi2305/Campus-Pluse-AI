import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { DEPARTMENTS } from '../../utils/constants.js';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    studentId: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              Campus<span className="text-indigo-600">Pulse</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500">Register a new campus member account</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              placeholder="e.g. Saravanan Sathiyamoorthi"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />

            <Input
              label="Campus Email"
              type="email"
              placeholder="e.g. saravanan@college.edu"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />

            <Input
              label="Student / Employee ID"
              placeholder="e.g. 2026-CS-412"
              value={form.studentId}
              onChange={e => setForm({ ...form, studentId: e.target.value })}
              required
            />

            <Select
              label="Primary Department"
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
            >
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </Select>

            <Input
              label="Create Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
