import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Textarea, Select } from '../../components/ui/Input.jsx';
import { LocationPicker } from '../../components/issues/LocationPicker.jsx';
import { issueService } from '../../services/issue.service.js';
import { CATEGORIES, CAMPUS_BUILDINGS } from '../../utils/constants.js';
import { Sparkles, MapPin, Camera, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const NewIssuePage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'Medium',
    impact: 'Department',
    building: 'Science & Technology Block A',
    block: 'Ground Floor',
    room: '',
    coordinates: { lat: 11.0168, lng: 76.9558 },
    images: []
  });

  const [aiPreview, setAiPreview] = useState(null);

  // Trigger Gemini AI preview analysis on blur or click
  const triggerAiAnalysis = async () => {
    if (!formData.title && !formData.description) return;
    setAnalyzing(true);
    try {
      const result = await issueService.analyzePreview({
        title: formData.title,
        description: formData.description,
        location: { building: formData.building, block: formData.block },
        urgency: formData.urgency
      });
      setAiPreview(result);
      if (!formData.category && result.category) {
        setFormData(prev => ({ ...prev, category: result.category }));
      }
    } catch {
      // Local fallback
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local object URL for preview
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, previewUrl]
      }));
      toast.success('Incident photo attached');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please enter an incident title and description');
      return;
    }

    setSubmitting(true);
    try {
      const created = await issueService.create({
        title: formData.title,
        description: formData.description,
        category: formData.category || aiPreview?.category || 'Infrastructure',
        urgency: formData.urgency || aiPreview?.urgency || 'Medium',
        impact: formData.impact,
        location: {
          building: formData.building,
          block: formData.block,
          room: formData.room,
          coordinates: formData.coordinates
        },
        images: formData.images
      });

      toast.success('Incident logged successfully! Assigned to response team.');
      navigate(`/issues/${created._id || created.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to submit issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Report New Campus Incident
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provide issue details. Our automated Gemini AI engine will evaluate hazard level, assign the responsible department, and plot the incident on the campus heatmap.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Core Fields */}
            <div className="md:col-span-2 space-y-4">
              <Card className="p-5 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Incident Information
                </h2>

                <Input
                  label="Incident Title"
                  placeholder="e.g. Water leak in Boys Hostel Washroom 2nd floor"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  onBlur={triggerAiAnalysis}
                  required
                />

                <Textarea
                  label="Detailed Description"
                  placeholder="Explain what happened, visible signs of damage, or active hazards..."
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  onBlur={triggerAiAnalysis}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Incident Category"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Auto-Detect via AI</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>

                  <Select
                    label="Reported Urgency"
                    value={formData.urgency}
                    onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option value="Low">Low — Minor cosmetic / non-urgent</option>
                    <option value="Medium">Medium — Standard prompt repair</option>
                    <option value="High">High — Immediate safety hazard</option>
                  </Select>
                </div>

                <Select
                  label="Scope of Impact"
                  value={formData.impact}
                  onChange={e => setFormData({ ...formData, impact: e.target.value })}
                >
                  <option value="Only me">Only me (Single individual)</option>
                  <option value="Few students">Few students (&lt; 10 people)</option>
                  <option value="Hostel block">Hostel wing / floor (~100 students)</option>
                  <option value="Department">Entire Department (~300 students)</option>
                  <option value="Entire campus">Widespread campus utility outage</option>
                </Select>
              </Card>

              {/* Location Details */}
              <Card className="p-5 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  Campus Location & Geolocation
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Building / Facility"
                    value={formData.building}
                    onChange={e => setFormData({ ...formData, building: e.target.value })}
                  >
                    {CAMPUS_BUILDINGS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Select>

                  <Input
                    label="Floor / Wing / Block"
                    placeholder="e.g. 2nd Floor, East Wing"
                    value={formData.block}
                    onChange={e => setFormData({ ...formData, block: e.target.value })}
                  />
                </div>

                <Input
                  label="Specific Room / Landmark"
                  placeholder="e.g. Lab 204 or Near Water Cooler"
                  value={formData.room}
                  onChange={e => setFormData({ ...formData, room: e.target.value })}
                />

                {/* Location Picker Map */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pinpoint Exact Location on Campus Map (Click to adjust pin)
                  </label>
                  <LocationPicker
                    value={formData.coordinates}
                    onChange={(coords) => setFormData(prev => ({ ...prev, coordinates: coords }))}
                    buildingName={formData.building}
                  />
                </div>
              </Card>

              {/* Photo Upload Card */}
              <Card className="p-5 space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  Attach Incident Photos (Optional)
                </h2>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 inline-flex items-center gap-2 transition-colors">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>Choose Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <span className="text-xs text-slate-400">Max 5MB (JPG, PNG, WebP)</span>
                </div>

                {formData.images.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                        <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column: AI Triage Panel & Submission */}
            <div className="space-y-4">
              <Card className="p-5 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 dark:from-slate-900 dark:to-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                    Gemini AI Triage
                  </span>
                  <button
                    type="button"
                    onClick={triggerAiAnalysis}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                {analyzing ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
                    <p className="text-xs text-slate-500">Gemini evaluating safety risk...</p>
                  </div>
                ) : aiPreview ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Predicted Category</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {aiPreview.category}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Department</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {aiPreview.department}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Severity Score</span>
                        <span className="text-base font-black text-indigo-600">{aiPreview.severity} / 10</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">SLA Target</span>
                        <span className="text-base font-black text-emerald-600">{aiPreview.slaTargetHours} Hours</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-slate-300 italic">
                      "{aiPreview.summary}"
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Live Triage Ready</p>
                    <p>Enter your title and description to preview automated AI classification, priority scoring, and SLA routing.</p>
                  </div>
                )}
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full shadow-md py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting Incident...' : 'Confirm & Dispatch Report'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
