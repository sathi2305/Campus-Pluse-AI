import React, { useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ShieldAlert, MapPin, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const RoleRoute = ({ roles, children }) => {
  const { user, loading, login } = useContext(AuthContext);
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You are signed in as <strong className="text-indigo-600">{user.role}</strong> ({user.email}). This view requires an Administrator role ({roles.join(', ')}).
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-left space-y-1.5 border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Looking for the Campus Map?</p>
            <p className="text-slate-500 dark:text-slate-400">
              The public <strong>Campus Incident Map</strong> is accessible to all students and visitors without administrative permissions.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link to="/map" className="w-full">
              <Button className="w-full flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                Open Student Campus Map
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await login('admin@campuspulse.demo', 'Admin@123');
                  window.location.reload();
                } catch (e) {
                  console.error(e);
                }
              }}
              className="w-full text-xs"
            >
              Switch to Admin Demo (admin@campuspulse.demo)
            </Button>

            <Link to="/dashboard" className="w-full">
              <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return children;
};

