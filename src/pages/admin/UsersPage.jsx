import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { DEMO_USERS } from '../../data/seedData.js';
import { Users, Shield, User, Mail, CheckCircle2 } from 'lucide-react';

export const UsersPage = () => {
  const usersList = [
    { name: 'Dr. Ramesh Kumar', email: 'admin@campuspulse.demo', role: 'CAMPUS_ADMIN', dept: 'Administration', status: 'Active' },
    { name: 'Er. Senthil Nathan', email: 'dept@campuspulse.demo', role: 'DEPARTMENT_ADMIN', dept: 'Electrical Engineering', status: 'Active' },
    { name: 'Prof. Anitha Raj', email: 'anitha.warden@campuspulse.edu', role: 'DEPARTMENT_ADMIN', dept: 'Hostels', status: 'Active' },
    { name: 'Saravanan S.', email: 'student@campuspulse.demo', role: 'STUDENT', dept: 'Computer Science', status: 'Active' },
    { name: 'Kavitha Raman', email: 'kavitha.cs@campuspulse.edu', role: 'STUDENT', dept: 'Computer Science', status: 'Active' },
    { name: 'Aditya Verma', email: 'aditya.mech@campuspulse.edu', role: 'STUDENT', dept: 'Mechanical Engineering', status: 'Active' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Institutional User Directory
          </h1>
          <p className="text-xs text-slate-500">
            Role-based access privileges and authorization tiers
          </p>
        </div>

        <Card className="overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Role Authorization</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usersList.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{u.name}</td>
                  <td className="p-3.5 text-slate-500">{u.email}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{u.dept}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'CAMPUS_ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'DEPARTMENT_ADMIN' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  );
};
