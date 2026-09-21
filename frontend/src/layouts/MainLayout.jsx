import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar.jsx';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, Bell, User, Menu, MapPin } from 'lucide-react';

export const MainLayout = ({ children }) => {
  const loc = useLocation();
  const [drawer, setDrawer] = useState(false);
  const nav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/issues', label: 'All Issues', icon: FileText },
    { to: '/map', label: 'Campus Map', icon: MapPin },
    { to: '/issues/new', label: 'Report Issue', icon: Plus },
    { to: '/my-issues', label: 'My Issues', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ];
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 flex gap-6">
        <aside className="hidden md:flex flex-col w-56 py-6 gap-1 sticky top-16 h-[calc(100vh-4rem)]">
          {nav.map(n=> (
            <Link key={n.to} to={n.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${loc.pathname===n.to?'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30':'text-slate-600 hover:bg-white dark:hover:bg-slate-900'}`}>
              <n.icon className="w-5 h-5"/>{n.label}
            </Link>
          ))}
        </aside>
        <main className="flex-1 py-6 pb-20 md:pb-6">{children}</main>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-2">
        {nav.slice(0,4).map(n=> <Link key={n.to} to={n.to} className={`p-2.5 rounded-xl ${loc.pathname===n.to?'bg-indigo-50 text-indigo-600':'text-slate-500'}`}><n.icon className="w-5 h-5"/></Link>)}
      </div>
    </div>
  );
};
