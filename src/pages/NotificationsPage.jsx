import React, { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Bell, CheckCircle2, AlertTriangle, Sparkles, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Power Panel Hazard Assigned to Rapid Response',
      desc: 'Er. Senthil Nathan dispatched team with isolation gear to Science Block A.',
      time: '12m ago',
      type: 'critical',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Hostel Flood Main Supply Isolated',
      desc: 'Ground floor main valve closed by Plumbing dept. Repair underway.',
      time: '35m ago',
      type: 'warning',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Biotech Seminar Hall AC Successfully Restored',
      desc: 'Condenser replaced and room temperature regulated at 21°C.',
      time: '2h ago',
      type: 'success',
      read: true
    },
    {
      id: 'notif-4',
      title: 'Gemini AI Auto-Triage Completed',
      desc: 'Your reported Wi-Fi outage in Library Hall was triaged to IT department.',
      time: '3h ago',
      type: 'info',
      read: true
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-6 h-6 text-indigo-600" />
              Campus Alerts & Notifications
            </h1>
            <p className="text-xs text-slate-500">
              Live updates regarding status changes, emergency dispatches, and SLA milestones
            </p>
          </div>

          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
            <Check className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        </div>

        <div className="space-y-2.5">
          {notifications.map(n => (
            <Card
              key={n.id}
              className={`p-4 transition-all ${!n.read ? 'border-l-4 border-l-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'critical' ? 'bg-red-100 text-red-600' :
                  n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                  n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  {n.type === 'critical' && <AlertTriangle className="w-4 h-4" />}
                  {n.type === 'warning' && <Clock className="w-4 h-4" />}
                  {n.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {n.type === 'info' && <Sparkles className="w-4 h-4" />}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{n.title}</h3>
                    <span className="text-[11px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{n.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
