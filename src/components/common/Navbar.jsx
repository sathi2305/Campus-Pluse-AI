import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Sparkles,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  MapPin,
  Shield,
  Layers,
  ChevronDown,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export const Navbar = () => {
  const { user, loginAsDemo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user && ['CAMPUS_ADMIN', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN'].includes(user.role);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Campus<span className="text-indigo-600 dark:text-indigo-400">Pulse</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-1">
                AI Intelligence
              </span>
            </div>
          </Link>

          {/* Quick Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 ml-4 text-sm font-semibold">
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/issues"
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Issues
            </Link>
            <Link
              to="/map"
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              Campus Map
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1 font-bold"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Admin Suite
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Icons & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Report Button */}
          <Link to="/issues/new" className="hidden sm:inline-flex">
            <Button size="sm" className="shadow-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Report Issue
            </Button>
          </Link>

          {/* Quick Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Switch demo persona"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="hidden sm:inline">Role:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {user?.role === 'CAMPUS_ADMIN' ? 'Campus Admin' : user?.role === 'DEPARTMENT_ADMIN' ? 'Dept Admin' : 'Student'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 text-xs space-y-1 animate-fadeIn"
                onClick={() => setRoleMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Demo Account
                </div>
                <button
                  type="button"
                  onClick={() => loginAsDemo('student')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between font-medium ${
                    user?.role === 'STUDENT' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <p>Student Persona</p>
                    <p className="text-[10px] text-slate-400 font-normal">Report & track issues</p>
                  </div>
                  {user?.role === 'STUDENT' && <span className="text-indigo-600 text-xs font-bold">Active</span>}
                </button>
                <button
                  type="button"
                  onClick={() => loginAsDemo('departmentAdmin')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between font-medium ${
                    user?.role === 'DEPARTMENT_ADMIN' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <p>Department Admin</p>
                    <p className="text-[10px] text-slate-400 font-normal">Electrical & Power lead</p>
                  </div>
                  {user?.role === 'DEPARTMENT_ADMIN' && <span className="text-indigo-600 text-xs font-bold">Active</span>}
                </button>
                <button
                  type="button"
                  onClick={() => loginAsDemo('campusAdmin')}
                  className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between font-medium ${
                    user?.role === 'CAMPUS_ADMIN' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <p>Campus Admin</p>
                    <p className="text-[10px] text-slate-400 font-normal">Full executive access</p>
                  </div>
                  {user?.role === 'CAMPUS_ADMIN' && <span className="text-indigo-600 text-xs font-bold">Active</span>}
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
          </Link>

          {/* Profile & Logout */}
          <div className="flex items-center gap-2">
            <Link to="/profile">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 animate-fadeIn">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <Link
            to="/issues"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            All Issues
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Interactive Campus Map
          </Link>
          <Link
            to="/issues/new"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
          >
            + Report New Issue
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-violet-600 bg-violet-50 dark:bg-violet-950/40"
            >
              🛡️ Admin Suite
            </Link>
          )}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>Signed in as: <strong>{user?.name}</strong></span>
            <button onClick={logout} className="text-red-500 font-semibold flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
