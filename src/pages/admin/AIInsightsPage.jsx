import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { adminService } from '../../services/admin.service.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Sparkles, Cpu, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const AIInsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await adminService.aiInsights();
      setInsights(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              Gemini AI Strategic Diagnostics
            </h1>
            <p className="text-xs text-slate-500">
              Autonomous reasoning over campus incidents, root-cause clustering, and preventative guidance
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => { loadInsights(); toast.success('Diagnostics re-evaluated'); }}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-Analyze Campus
          </Button>
        </div>

        {/* Primary AI Advisory Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-violet-950 text-white space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4 animate-pulse" /> Gemini Real-time Assessment
          </div>
          <h2 className="text-xl font-bold">
            Campus Infrastructure Risk: <span className="text-amber-400">{insights?.riskLevel || 'Moderate'}</span>
          </h2>
          <p className="text-sm text-indigo-100/90 leading-relaxed max-w-3xl">
            {insights?.primaryThreat || 'Evaluating current utility loads and critical infrastructure reports across campus facilities.'}
          </p>
        </div>

        {/* AI Recommendations */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            AI Prescribed Action Items
          </h3>

          <div className="space-y-3">
            {(insights?.recommendations || []).map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
