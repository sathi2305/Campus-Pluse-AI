import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Settings, Shield, Sparkles, Bell } from 'lucide-react';
import { toast } from 'sonner';

export const AdminSettingsPage = () => {
  const [autoTriage, setAutoTriage] = useState(true);
  const [criticalSmsAlert, setCriticalSmsAlert] = useState(true);
  const [slaBufferHours, setSlaBufferHours] = useState('2');

  const handleSave = () => {
    toast.success('Campus operations settings updated');
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Campus Policy & AI Engine Configuration
          </h1>
          <p className="text-xs text-slate-500">
            Configure automated Gemini triage thresholds, emergency routing, and SLA governance
          </p>
        </div>

        <Card className="p-6 space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Automated AI Dispatch
            </h3>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Autonomous Gemini AI Triage</p>
                <p className="text-[11px] text-slate-400">Instantly route high-confidence incidents to departments without manual review</p>
              </div>
              <input
                type="checkbox"
                checked={autoTriage}
                onChange={e => setAutoTriage(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Critical Hazard SMS Broadcast</p>
                <p className="text-[11px] text-slate-400">Send emergency SMS to department heads when hazard score exceeds 8.5/10</p>
              </div>
              <input
                type="checkbox"
                checked={criticalSmsAlert}
                onChange={e => setCriticalSmsAlert(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              SLA Thresholds
            </h3>

            <Input
              label="Critical Issue Response Target (Hours)"
              type="number"
              value={slaBufferHours}
              onChange={e => setSlaBufferHours(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} size="sm">
              Save Campus Policy
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
