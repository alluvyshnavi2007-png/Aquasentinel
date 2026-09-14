import React from 'react';
import { Activity, BatteryCharging, Gauge, Navigation2, Radio, Waves } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import { ProvenanceBadge } from './common/ProvenanceBadge';

export const StatusBar: React.FC = () => {
  const { auvState, activeRegion } = useMission();

  return (
    <footer
      id="aquasentinel-bottom-status-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 border-t border-sky-500/20 px-4 py-2.5 backdrop-blur-xl text-xs text-slate-300 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: SIMULATION MODE badge & AUV Identifier */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            SIMULATION TELEMETRY
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-[11px] font-bold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{auvState.id}</span>
            <span className="text-slate-400 text-[10px] font-normal hidden sm:inline">({auvState.status})</span>
          </div>

          <span className="text-slate-600 hidden md:inline">•</span>

          {/* Real-time Telemetry Metrics */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5" title="Subsea Depth">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Depth: <strong className="text-white">{(auvState?.depth != null ? auvState.depth : 0).toFixed(1)}m</strong></span>
            </div>
            <div className="flex items-center gap-1.5" title="Altitude Above Seafloor">
              <Waves className="w-3.5 h-3.5 text-blue-400" />
              <span>Alt: <strong className="text-white">{(auvState?.altitude != null ? auvState.altitude : 0).toFixed(1)}m</strong></span>
            </div>
            <div className="flex items-center gap-1.5" title="Heading">
              <Navigation2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hdg: <strong className="text-white">{auvState?.heading ?? 0}°</strong></span>
            </div>
            <div className="flex items-center gap-1.5" title="Chirp Acoustic Frequency">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acoustic Chirp: <strong className="text-emerald-300">{auvState?.frequency ?? '120 kHz'}</strong></span>
            </div>
          </div>
        </div>

        {/* Center/Right: Survey Progress & System Status */}
        <div className="flex items-center gap-4 flex-wrap ml-auto">
          {/* Survey Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">Survey:</span>
            <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-900 border border-sky-500/30 overflow-hidden relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                style={{ width: `${auvState?.surveyProgress ?? 0}%` }}
              />
            </div>
            <span className="text-xs font-bold text-cyan-300 font-mono min-w-[34px]">
              {(auvState?.surveyProgress != null ? auvState.surveyProgress : 0).toFixed(0)}%
            </span>
          </div>

          {/* Battery Status */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">{(auvState?.batteryPercent != null ? auvState.batteryPercent : 100).toFixed(0)}%</span>
          </div>

          {/* System Status message */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-900/90 px-3 py-0.5 rounded-full border border-sky-500/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{auvState.systemStatus}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
