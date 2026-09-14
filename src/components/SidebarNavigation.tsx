import React from 'react';
import {
  Compass,
  Radio,
  Crosshair,
  Globe,
  ShieldCheck,
  FileText,
  Sliders,
  Waves,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { useMission, AppMode } from '../context/MissionContext';

interface SidebarNavigationProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  mobileOpen = false,
  setMobileOpen,
}) => {
  const { currentMode, setCurrentMode, anomalies, auvState } = useMission();

  const criticalCount = anomalies.filter(
    (a) => a.riskLevel === 'Critical' || a.priority === 'Immediate'
  ).length;

  const navItems: {
    id: AppMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'sonar', label: 'Sonar Intelligence', icon: Radio },
    { id: 'targets', label: 'Targets', icon: Crosshair, count: criticalCount > 0 ? criticalCount : undefined },
    { id: 'map', label: 'Marine Map', icon: Globe },
    { id: 'mission', label: 'Mission', icon: ShieldCheck },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Data Sources', icon: Sliders },
  ];

  const handleNavClick = (mode: AppMode) => {
    setCurrentMode(mode);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside
      id="aquasentinel-sidebar"
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 block leading-none">
                Aqua<span className="text-sky-600">Sentinel</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Marine Intelligence
              </span>
            </div>
          </button>
        </div>

        {/* Quiet, Elegant Nav Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel as requested:
          SIMULATION MODE
          AUV-01
          Survey 68%
          System Ready
      */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              SIMULATION MODE
            </span>
            <span className="text-[11px] font-semibold text-slate-700 font-mono">
              {auvState?.id ?? 'AUV-01'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Survey</span>
              <span className="font-semibold text-slate-800">
                {(auvState?.surveyProgress != null ? auvState.surveyProgress : 0).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${auvState?.surveyProgress ?? 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">System Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
