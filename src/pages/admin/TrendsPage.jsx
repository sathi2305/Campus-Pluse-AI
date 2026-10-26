import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { TrendingUp, AlertTriangle, ShieldCheck, Flame, Cpu } from 'lucide-react';

export const TrendsPage = () => {
  const recurringTrends = [
    {
      title: 'Science Block Electrical Surges',
      pattern: 'Occurs primarily on Thursdays and Fridays between 2 PM - 5 PM during concurrent chemistry lab heating equipment usage.',
      severity: 'High',
      recommendation: 'Dedicated line filtration and capacitor bank installation in Substation 2.',
      trend: '+18% this month'
    },
    {
      title: 'Hostel Block 1 Drainage Overflows',
      pattern: 'Peak occurrences recorded on Saturday mornings between 7 AM - 9 AM.',
      severity: 'Medium',
      recommendation: 'Schedule Friday evening preventive vacuum flushing on main interceptor line.',
      trend: '-5% this month'
    },
    {
      title: 'Digital Library Wi-Fi AP Roaming Drops',
      pattern: 'Concentrated in 2nd Floor Quiet Study Hall during exam revision weeks.',
      severity: 'Low',
      recommendation: 'Upgrade to Wi-Fi 6 multi-user MIMO access point.',
      trend: 'Stable'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Predictive Infrastructure Trend Analysis
          </h1>
          <p className="text-xs text-slate-500">
            Algorithmic pattern detection identifying repeated failure cycles and proactive maintenance requirements
          </p>
        </div>

        <div className="space-y-4">
          {recurringTrends.map((t, idx) => (
            <Card key={idx} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    t.severity === 'High' ? 'bg-red-100 text-red-700' :
                    t.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {t.severity} Severity Trend
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{t.trend}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t.pattern}</p>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                <strong className="text-indigo-700 dark:text-indigo-300">Preventive Action:</strong>{' '}
                <span className="text-slate-700 dark:text-slate-300">{t.recommendation}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
