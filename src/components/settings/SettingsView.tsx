import React, { useState } from 'react';
import {
  Sliders,
  Radio,
  Layers,
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export const SettingsView: React.FC = () => {
  const { auvState, setAuvState, activeRegion } = useMission();

  const [frequency, setFrequency] = useState<string>('450 kHz Side-Scan Chirp');
  const [swathWidth, setSwathWidth] = useState<number>(75);
  const [enableAIModel, setEnableAIModel] = useState<boolean>(true);
  const [tvgGain, setTvgGain] = useState<number>(14);

  return (
    <div id="settings-view-container" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Data Sources &amp; Telemetry Setup
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acoustic sensor calibration, transducer frequencies, and ML inference weights.
          </p>
        </div>

        <ProvenanceBadge type="EXTERNAL DATA" size="xs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sensor Calibration */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 text-xs shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold">
            <Radio className="w-4 h-4 text-sky-600" />
            <span>Transducer Acoustic Configuration</span>
          </div>

          <div className="space-y-2">
            <label className="text-slate-600 block font-medium">Operating Chirp Frequency:</label>
            <select
              value={frequency}
              onChange={(e) => {
                setFrequency(e.target.value);
                setAuvState((prev) => ({ ...prev, frequency: e.target.value }));
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:border-sky-500 focus:outline-none"
            >
              <option value="450 kHz Side-Scan Chirp">450 kHz High-Resolution Swath (Shelf &amp; Wrecks)</option>
              <option value="900 kHz Ultra-Def Chirp">900 kHz Micro-Bathymetry (Nets &amp; Small Targets)</option>
              <option value="120 kHz Deep Sea Chirp">120 kHz Abyssal Long-Range (Trench Corridors)</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Swath Half-Width Range:</span>
              <span className="font-bold text-slate-900 font-mono">{swathWidth}m</span>
            </div>
            <input
              type="range"
              min="25"
              max="150"
              value={swathWidth}
              onChange={(e) => setSwathWidth(parseInt(e.target.value))}
              className="w-full accent-sky-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Time-Varying Gain (TVG Slope):</span>
              <span className="font-bold text-slate-900 font-mono">{tvgGain} dB/100m</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={tvgGain}
              onChange={(e) => setTvgGain(parseInt(e.target.value))}
              className="w-full accent-sky-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Inference Model & ML Weights */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 text-xs shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold">
            <Cpu className="w-4 h-4 text-sky-600" />
            <span>AI Acoustic Inference Core</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Real-time Anomaly Classification</span>
              <span className="text-[11px] text-slate-500">
                Acoustic edge neural network processing
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableAIModel}
              onChange={(e) => setEnableAIModel(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
            />
          </div>

          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>Edge Model Version:</span>
              <span className="font-mono text-slate-900 font-semibold">SonarVision-v4.2-Chirp</span>
            </div>
            <div className="flex justify-between">
              <span>Active Reference Signatures:</span>
              <span className="font-mono text-slate-900 font-semibold">6 Verified Categories</span>
            </div>
            <div className="flex justify-between">
              <span>Inference Latency:</span>
              <span className="font-mono text-emerald-600 font-semibold">14ms (GPU accelerated)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
