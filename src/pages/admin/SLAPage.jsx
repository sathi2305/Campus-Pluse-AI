import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Clock, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export const SLAPage = () => {
  const slaPolicies = [
    { priority: 'CRITICAL', target: '2 Hours', compliance: '96.2%', status: 'Within Target', desc: 'Life safety hazard, power blackout, active flooding' },
    { priority: 'HIGH', target: '6 Hours', compliance: '91.8%', status: 'Within Target', desc: 'Classroom equipment failure, partial water disruption' },
    { priority: 'MEDIUM', target: '24 Hours', compliance: '94.5%', status: 'Within Target', desc: 'Minor repair, corridor light replacement' },
    { priority: 'LOW', target: '72 Hours', compliance: '98.1%', status: 'Within Target', desc: 'Cosmetic touch-up, general suggestions' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Service Level Agreement (SLA) Governance
          </h1>
          <p className="text-xs text-slate-500">
            Automated compliance tracking against institutional resolution deadlines
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {slaPolicies.map((p, idx) => (
            <Card key={idx} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                  p.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                  p.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                  p.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {p.priority}
                </span>

                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {p.compliance}
                </span>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{p.target}</p>
                <p className="text-xs text-slate-400">Target Resolution Time</p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                {p.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
