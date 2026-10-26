import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DEPARTMENTS } from '../../utils/constants.js';
import { Building2, Mail, User, Phone, CheckCircle2 } from 'lucide-react';

export const DepartmentsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Campus Facilities Departments
          </h1>
          <p className="text-xs text-slate-500">
            Administrative overview of campus operational units, leadership contacts, and assigned tickets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEPARTMENTS.map(d => (
            <Card key={d.id} className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{d.icon}</span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{d.name}</h3>
                  <p className="text-xs text-slate-400">Head of Operations: {d.lead}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {d.email}
                </span>

                <span className="font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
