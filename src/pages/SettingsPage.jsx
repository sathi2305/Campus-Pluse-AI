import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Settings, Sun, Moon, Bell, Shield, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsCritical, setSmsCritical] = useState(true);
  const [heatmapRadius, setHeatmapRadius] = useState('30');

  const handleSave = () => {
    toast.success('Preferences saved');
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Preferences & Settings
          </h1>
          <p className="text-xs text-slate-500">Configure visual themes, notification alerts, and campus radius</p>
        </div>

        <Card className="p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              Appearance
            </h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Dark Interface Theme</p>
                  <p className="text-[11px] text-slate-400">Current theme: {theme === 'dark' ? 'Dark' : 'Light'}</p>
                </div>
              </div>
              <Button variant="outline" size="xs" onClick={toggleTheme}>
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              Notification Dispatch
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Email Status Updates</p>
                  <p className="text-[11px] text-slate-400">Receive an email when technician is dispatched or issue resolves</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Critical Hazard SMS</p>
                  <p className="text-[11px] text-slate-400">Instant SMS for electrical, gas, or flooding evacuations</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsCritical}
                  onChange={e => setSmsCritical(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button onClick={handleSave} size="sm">
              Save Preferences
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
