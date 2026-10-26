import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { User, Mail, Phone, Shield, Building, Award, LogOut } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98401 23456');

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name, phone });
    setEditing(false);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" />
            Member Profile
          </h1>

          <Button variant="outline" size="sm" onClick={logout} className="text-red-500 border-red-200 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/20"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200">
                  {user?.role}
                </span>
                <span className="text-xs text-slate-500">{user?.department || 'Student Body'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Input
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={!editing}
            />

            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Institutional email is bound to university directory."
            />

            <Input
              label="Contact Phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={!editing}
            />

            <div className="flex justify-end gap-2 pt-2">
              {editing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};
