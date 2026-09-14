import React, { useState } from 'react';
import {
  ShieldCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Anchor,
  Clock,
  Waves,
  Wind,
  Thermometer,
  ArrowRight,
  ShieldAlert,
  Compass,
  FileText,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export const MissionView: React.FC = () => {
  const {
    anomalies,
    selectedTargetId,
    selectTarget,
    selectedTarget,
    updateTargetStatus,
    whatIf,
    setWhatIf,
    setCurrentMode,
    addLogMessage,
  } = useMission();

  // Cleanup Mission Steps
  const [missionStep, setMissionStep] = useState<number>(1);
  const [isSimulatingExecution, setIsSimulatingExecution] = useState<boolean>(false);
  const [execStep, setExecStep] = useState<number>(0);

  const plannableTargets = anomalies.filter((a) => a.category === 'Artificial');
  const target = selectedTarget || plannableTargets[0] || anomalies[0] || null;

  // Simulated Execution Steps
  const EXECUTION_STAGES = [
    { title: 'Launch ROV', desc: 'Work-Class ROV deployed from crane down into water column.' },
    { title: 'Navigate to Target', desc: target ? `Acoustic transponder homing toward ${target.id} at ${(target.depth != null ? target.depth : 42).toFixed(1)}m depth.` : 'Standby for target homing.' },
    { title: 'Cut & Disentangle', desc: 'Hydraulic shear cutters severing anchor lines and snag points.' },
    { title: 'Rig Subsea Lift Bags', desc: 'Parachute lift bags attached to main synthetic groundline; pneumatic inflation.' },
    { title: 'Controlled Ascent', desc: 'Controlled buoyancy ascent monitoring stand-off distance of 50m.' },
    { title: 'Secure on Vessel Deck', desc: 'Derelict gear recovered into sealed biological containment skip.' },
    { title: 'Recovery Complete', desc: target ? `Target ${target.id} successfully decommissioned and habitat secured.` : 'Recovery procedure completed.' },
  ];

  const handleStartSimulation = async () => {
    if (!target) return;
    setIsSimulatingExecution(true);
    setExecStep(0);

    for (let i = 0; i < EXECUTION_STAGES.length; i++) {
      setExecStep(i);
      addLogMessage(`[MISSION ${target.id}] Stage ${i + 1}: ${EXECUTION_STAGES[i].title}`, 'info');
      await new Promise((r) => setTimeout(r, 1500));
    }

    setIsSimulatingExecution(false);
    updateTargetStatus(target.id, 'Recovered');
    addLogMessage(`Target ${target.id} marked as RECOVERED in mission log.`, 'success');
  };

  // What-If Drift & Risk Escalation Calculation
  const driftDistanceMeters = Math.round(whatIf.currentKnots * 1.852 * whatIf.delayHours * 10);
  const riskEscalationPercentage = Math.min(
    100,
    Math.round(whatIf.delayHours * 1.5 + whatIf.waveHeightMeters * 8 + whatIf.windSpeedKmh * 0.4)
  );

  if (!target) {
    return (
      <div id="mission-planner-view" className="space-y-6 max-w-7xl mx-auto pb-16">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">No Target Selected for Cleanup</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Please analyze a sonar image or select an anomaly from the Targets Catalog to initiate subsea cleanup mission planning.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="mission-planner-view" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Subsea Cleanup Mission Planner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational planning, ROV deployment procedures, and environmental containment modeling.
          </p>
        </div>

        {/* Target Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Target:</span>
          <select
            value={target.id}
            onChange={(e) => selectTarget(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500 shadow-xs"
          >
            {plannableTargets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} - {t.classification} ({t.riskLevel} Risk)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Operational Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900">{target.id}</span>
              <span className="text-xs font-semibold text-slate-700">• {target.classification}</span>
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
            <p className="text-xs text-slate-600 mt-1">{target.ecologicalImpact?.summary ?? ''}</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
              <span>Depth: <strong className="text-slate-700">{(target.depth != null ? target.depth : 42).toFixed(1)}m</strong></span>
              <span>•</span>
              <span>Dimensions: <strong className="text-slate-700">{target.dimensions?.length ?? '--'}m × {target.dimensions?.width ?? '--'}m</strong></span>
              <span>•</span>
              <span>Status: <strong className="text-sky-700">{target.status}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartSimulation}
          disabled={isSimulatingExecution || target.status === 'Recovered'}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-2"
        >
          {isSimulatingExecution ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              <span>Executing Stage {execStep + 1}...</span>
            </>
          ) : target.status === 'Recovered' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Decommissioned</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Recovery Sequence</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Execution Stages & What-If Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Operational Stages (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Standard Recovery Protocol (SOP-OCN-44)
            </h2>
            <span className="text-[11px] text-slate-400">
              Work-Class ROV with Hydraulic Cutters
            </span>
          </div>

          <div className="space-y-2.5">
            {EXECUTION_STAGES.map((stage, idx) => {
              const isActive = isSimulatingExecution && execStep === idx;
              const isPast = isSimulatingExecution && execStep > idx;
              const isDone = target.status === 'Recovered';

              return (
                <div
                  key={stage.title}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    isActive
                      ? 'bg-sky-50 border-sky-300 ring-1 ring-sky-200'
                      : isPast || isDone
                      ? 'bg-slate-50/80 border-slate-200 text-slate-700'
                      : 'bg-white border-slate-200/70 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          isDone || isPast
                            ? 'bg-emerald-100 text-emerald-700'
                            : isActive
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-900">{stage.title}</span>
                    </div>

                    {isActive && (
                      <span className="text-[10px] font-bold text-sky-700 animate-pulse uppercase">
                        In Progress
                      </span>
                    )}
                    {(isPast || isDone) && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-8.5">{stage.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: What-If Environmental Modeling (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-600" />
              Environmental Drift &amp; What-If Model
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Forecast spatial displacement if recovery is delayed.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Delay Slider */}
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Operational Delay:</span>
                <span className="font-bold text-slate-900 font-mono">{whatIf.delayHours} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="72"
                value={whatIf.delayHours}
                onChange={(e) =>
                  setWhatIf((prev) => ({ ...prev, delayHours: parseInt(e.target.value) }))
                }
                className="w-full accent-sky-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            {/* Current Slider */}
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Subsea Current Speed:</span>
                <span className="font-bold text-slate-900 font-mono">{whatIf.currentKnots} kts</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.5"
                step="0.1"
                value={whatIf.currentKnots}
                onChange={(e) =>
                  setWhatIf((prev) => ({ ...prev, currentKnots: parseFloat(e.target.value) }))
                }
                className="w-full accent-sky-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            {/* Wave Height Slider */}
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Surface Wave Height:</span>
                <span className="font-bold text-slate-900 font-mono">{whatIf.waveHeightMeters}m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.2"
                value={whatIf.waveHeightMeters}
                onChange={(e) =>
                  setWhatIf((prev) => ({ ...prev, waveHeightMeters: parseFloat(e.target.value) }))
                }
                className="w-full accent-sky-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Modeling Output Cards */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Gear Drift:</span>
              <span className="font-bold text-sky-700 font-mono">~{driftDistanceMeters} meters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fauna Entanglement Escalation:</span>
              <span className="font-bold text-rose-600 font-mono">+{riskEscalationPercentage}%</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              Delaying recovery by {whatIf.delayHours}h in {whatIf.currentKnots}kt currents expands the seabed search footprint and increases marine mammal risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
