import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.jsx';
import {
  LayoutDashboard,
  Flame,
  ListOrdered,
  MapPin,
  BarChart3,
  TrendingUp,
  Sparkles,
  Clock,
  Building2,
  Users,
  Settings,
  ArrowLeft
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const loc = useLocation();

  const nav = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/priority', label: 'Priority Triage Queue', icon: Flame },
    { to: '/admin/issues', label: 'Issue Management', icon: ListOrdered },
    { to: '/admin/map', label: 'Heatmap & Geospatial', icon: MapPin },
    { to: '/admin/analytics', label: 'Analytics & KPIs', icon: BarChart3 },
    { to: '/admin/trends', label: 'Predictive Trends', icon: TrendingUp },
    { to: '/admin/ai-insights', label: 'Gemini AI Insights', icon: Sparkles },
    { to: '/admin/sla', label: 'SLA Monitoring', icon: Clock },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/settings', label: 'Campus Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6">
        {/* Admin Sidebar */}
        <aside className="hidden md:flex flex-col w-60 py-6 gap-1 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin">
          <div className="px-3 pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Administrative Suite
            </span>
            <p className="text-xs text-slate-500">Campus Facilities Operations</p>
          </div>

          {nav.map(n => {
            const active = loc.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <n.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{n.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Switch to Student View
            </Link>
          </div>
        </aside>

        {/* Admin Main Content */}
        <main className="flex-1 py-6 pb-20 md:pb-6 min-w-0">{children}</main>
      </div>

      {/* Mobile Bottom Bar for Admin */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-2 z-40">
        {nav.slice(0, 5).map(n => (
          <Link
            key={n.to}
            to={n.to}
            className={`p-2 rounded-xl ${loc.pathname === n.to ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}
          >
            <n.icon className="w-5 h-5" />
          </Link>
        ))}
      </div>
    </div>
  );
};
