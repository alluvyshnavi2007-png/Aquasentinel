import React from 'react';
import {
  Compass,
  AlertTriangle,
  Radio,
  Crosshair,
  ShieldAlert,
  ArrowRight,
  Waves,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Globe,
  MapPin,
  ExternalLink,
  ChevronRight,
  Activity,
  Gauge,
  Droplets,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { OceanDigitalEarth } from '../gis/OceanDigitalEarth';

export const OverviewView: React.FC = () => {
  const {
    anomalies,
    activeRegion,
    auvState,
    setCurrentMode,
    selectTarget,
    setSonarSubTab,
    missionLog,
    addToCleanupMission,
  } = useMission();

  // 4 Primary Compact Statistics as requested:
  // "12 Targets", "3 High Risk", "68% Surveyed", "5 Cleanup Candidates"
  const totalAnomalies = anomalies.length;
  const highRiskCount = anomalies.filter(
    (a) => a.riskLevel === 'Critical' || a.riskLevel === 'High'
  ).length;
  const surveyPercent = Math.round(auvState.surveyProgress);
  const cleanupCandidates = anomalies.filter(
    (a) => a.category === 'Artificial' && a.classification !== 'Coral Reef'
  ).length;

  // "What Needs Attention? One or two important targets. That's enough."
  const attentionTargets = anomalies
    .filter((a) => a.riskLevel === 'Critical' || a.priority === 'Immediate' || a.priority === 'Urgent')
    .slice(0, 2);

  return (
    <div id="overview-view-container" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Marine Intelligence Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time autonomous acoustic bathymetry, target classification, and subsea stewardship.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSonarSubTab('image-analysis');
              setCurrentMode('sonar');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Analyze Sonar</span>
          </button>
          <button
            onClick={() => setCurrentMode('map')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>Full GIS Map</span>
          </button>
        </div>
      </div>

      {/* HERO SECTION: The 3D Earth with Left and Right Panels
          LEFT: short mission summary
          CENTER: large beautiful 3D Earth (HERO)
          RIGHT: small Mission Intelligence panel
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT: Short Mission Summary (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active Reconnaissance
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900">
              {activeRegion.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {activeRegion.description || 'Autonomous side-scan survey corridor over the continental shelf.'}
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Water Clarity</span>
              <span className="font-semibold text-slate-800">{activeRegion.waterClarity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Depth Range</span>
              <span className="font-semibold text-slate-800">{activeRegion.depthRange}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">AUV Unit</span>
              <span className="font-semibold text-sky-700 font-mono">{auvState.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Acoustic Chirp</span>
              <span className="font-semibold text-emerald-600 font-mono">{auvState.frequency}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setCurrentMode('mission')}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Mission Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CENTER: Large Beautiful 3D Earth (Hero Element) (6 cols) */}
        <div className="lg:col-span-6 relative flex flex-col">
          <OceanDigitalEarth
            heightClass="h-[400px] sm:h-[450px] lg:h-[480px]"
            showSearch={true}
            showLayerControls={true}
          />
        </div>

        {/* RIGHT: Small Mission Intelligence Panel (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Mission Intelligence
              </h3>
              <span className="text-[10px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                Live Feed
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Recent subsea telemetry events and contact triggers.
            </p>

            <div className="space-y-2.5">
              {missionLog.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{log.time}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        log.type === 'alert'
                          ? 'bg-amber-500'
                          : log.type === 'success'
                          ? 'bg-emerald-500'
                          : 'bg-sky-500'
                      }`}
                    />
                  </div>
                  <p className="text-slate-700 text-[11px] leading-snug">{log.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentMode('reports')}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Scientific Dossier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM: Four Compact Statistics
          Example from prompt:
          12 Targets
          3 High Risk
          68% Surveyed
          5 Cleanup Candidates
      */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Targets */}
        <div
          onClick={() => setCurrentMode('targets')}
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Targets
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{totalAnomalies}</span>
            <span className="text-xs text-slate-500">registered</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Classified sonar contacts</p>
        </div>

        {/* Stat 2: High Risk */}
        <div
          onClick={() => setCurrentMode('targets')}
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="text-[11px] font-medium text-amber-700 uppercase tracking-wider">
            High Risk
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 font-mono">{highRiskCount}</span>
            <span className="text-xs text-slate-500">critical / urgent</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Entanglement &amp; hazard alert</p>
        </div>

        {/* Stat 3: Surveyed */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="text-[11px] font-medium text-sky-700 uppercase tracking-wider">
            Surveyed Area
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-600 font-mono">{surveyPercent}%</span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">AUV swath corridor line 04</p>
        </div>

        {/* Stat 4: Cleanup Candidates */}
        <div
          onClick={() => setCurrentMode('mission')}
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
            Cleanup Candidates
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 font-mono">{cleanupCandidates}</span>
            <span className="text-xs text-slate-500">removable objects</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for ROV recovery</p>
        </div>
      </div>

      {/* "What Needs Attention? One or two important targets. That's enough." */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              What Needs Attention?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Priority targets requiring immediate verification or environmental containment.
            </p>
          </div>

          <button
            onClick={() => setCurrentMode('targets')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View All ({anomalies.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attentionTargets.map((target) => (
            <div
              key={target.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {target.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {target.classification}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      target.riskLevel === 'Critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {target.riskLevel} Risk
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {target.ecologicalImpact?.summary ?? ''}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>Depth: <strong className="text-slate-700">{(target.depth != null ? target.depth : 0).toFixed(1)}m</strong></span>
                  <span>•</span>
                  <span>Confidence: <strong className="text-sky-700">{target.confidence}%</strong></span>
                  <span>•</span>
                  <span>Action: <strong className="text-slate-700">{target.priority}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/60">
                <button
                  onClick={() => {
                    selectTarget(target.id);
                    setCurrentMode('targets');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  View Dossier
                </button>
                {target.category === 'Artificial' && (
                  <button
                    onClick={() => {
                      addToCleanupMission(target.id);
                      setCurrentMode('mission');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-colors"
                  >
                    Mark for Recovery
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
