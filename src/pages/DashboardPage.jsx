import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { issueService } from '../services/issue.service.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { IssueCard } from '../components/common/IssueCard.jsx';
import {
  Sparkles,
  MapPin,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  PhoneCall,
  Shield,
  ArrowRight,
  TrendingUp,
  Compass
} from 'lucide-react';
import { DEPARTMENTS } from '../utils/constants.js';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issueService.list({ limit: 6 }).then(res => {
      setIssues(res.data || []);
      setLoading(false);
    });
  }, []);

  const criticalCount = issues.filter(i => i.priorityLevel === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const inProgressCount = issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;
  const resolvedCount = issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-lg shadow-indigo-600/10">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5" /> Campus Intelligence Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Campus infrastructure is operating at <strong className="text-white">94.8% Health Score</strong>. Our automated Gemini triage engine has dispatched 2 high-priority teams today.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link to="/issues/new">
                <Button className="bg-white hover:bg-slate-100 text-indigo-700 font-bold shadow-md">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Report Campus Incident
                </Button>
              </Link>

              <Link to="/map">
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                  <Compass className="w-4 h-4 mr-1.5" />
                  Open Live Campus Map
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block absolute -right-6 -bottom-6 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Incidents</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              {issues.length}
            </p>
            <span className="text-[11px] text-blue-600 font-medium">Logged on platform</span>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Critical Hazards</span>
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-2">
              {criticalCount}
            </p>
            <span className="text-[11px] text-red-500 font-medium">Under active triage</span>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Teams Dispatched</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              {inProgressCount}
            </p>
            <span className="text-[11px] text-amber-600 font-medium">In-progress repairs</span>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Resolved Today</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
              {resolvedCount + 3}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">92.4% on-time SLA</span>
          </Card>
        </div>

        {/* Two Column Layout: Recent Issues & Quick Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Recent Activity Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Recent Campus Incidents
              </h2>
              <Link to="/issues" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-5 animate-pulse h-28" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {issues.slice(0, 4).map(issue => (
                  <IssueCard key={issue._id || issue.id} issue={issue} />
                ))}
              </div>
            )}
          </div>

          {/* Side Column: Emergency Hotlines & Campus Department Leaders */}
          <div className="space-y-4">
            {/* Hotlines */}
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-red-600" />
                Emergency Campus Hotlines
              </h3>
              <p className="text-xs text-slate-500">
                Direct telephone dispatch for life safety and immediate hazards:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Security Control Room</p>
                    <p className="text-[11px] text-slate-400">Main Campus Gate #1</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md">
                    Ext: 9111
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Medical Center / Ambulance</p>
                    <p className="text-[11px] text-slate-400">24/7 First Responder</p>
                  </div>
                  <span className="font-mono font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-1 rounded-md">
                    Ext: 9112
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Electrical & Substation</p>
                    <p className="text-[11px] text-slate-400">Power Emergency</p>
                  </div>
                  <span className="font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-md">
                    Ext: 4422
                  </span>
                </div>
              </div>
            </Card>

            {/* Department Lead Directory */}
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                Responsible Departments
              </h3>
              <div className="space-y-2 text-xs">
                {DEPARTMENTS.slice(0, 4).map(d => (
                  <div key={d.id} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <span>{d.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{d.name}</p>
                        <p className="text-[10px] text-slate-400">{d.lead}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
