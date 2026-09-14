import React, { useState } from 'react';
import {
  Compass,
  Radio,
  Crosshair,
  Globe,
  Waves,
  ShieldCheck,
  FileText,
  Sliders,
  Search,
  MapPin,
  ChevronDown,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useMission, AppMode } from '../context/MissionContext';
import { ProvenanceBadge } from './common/ProvenanceBadge';

export const Navigation: React.FC = () => {
  const {
    currentMode,
    setCurrentMode,
    anomalies,
    activeRegion,
    setActiveRegion,
    surveyRegions,
    searchRegion,
  } = useMission();

  const [searchQuery, setSearchQuery] = useState('');
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

  const criticalCount = anomalies.filter(
    (a) => a.riskLevel === 'Critical' || a.priority === 'Immediate'
  ).length;

  const navItems: {
    id: AppMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accentClass: string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: Compass, accentClass: 'text-sky-400' },
    { id: 'sonar', label: 'Sonar AI Vision', icon: Radio, accentClass: 'text-cyan-400' },
    { id: 'targets', label: 'Targets & Registry', icon: Crosshair, accentClass: 'text-amber-400' },
    { id: 'map', label: 'Satellite Earth 3D', icon: Globe, accentClass: 'text-blue-400' },
    { id: 'underwater3d', label: 'Subsea 3D World', icon: Waves, accentClass: 'text-teal-400' },
    { id: 'mission', label: 'Cleanup Missions', icon: ShieldCheck, accentClass: 'text-emerald-400' },
    { id: 'reports', label: 'Scientific Dossier', icon: FileText, accentClass: 'text-purple-400' },
    { id: 'settings', label: 'Data Sources', icon: Sliders, accentClass: 'text-slate-400' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const found = searchRegion(searchQuery);
      if (found) {
        setSearchQuery('');
        setRegionDropdownOpen(false);
      }
    }
  };

  return (
    <header
      id="aquasentinel-top-nav"
      className="sticky top-0 z-40 w-full border-b border-sky-500/20 bg-slate-950/85 backdrop-blur-xl px-4 lg:px-8 py-3 transition-all shadow-xl shadow-slate-950/40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Mission Logo */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-btn"
            onClick={() => setCurrentMode('overview')}
            className="flex items-center gap-3 group text-left focus:outline-none cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/40 group-hover:scale-105 transition-all">
              <Waves className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                  AQUA<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">SENTINEL</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
                AI Underwater Marine Intelligence &amp; Cleanup System
              </p>
            </div>
          </button>
        </div>

        {/* Global Navigation Tabs */}
        <nav id="main-nav-links" className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setCurrentMode(item.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-sky-600/60 via-cyan-600/50 to-blue-600/60 border border-cyan-400/60 shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : item.accentClass}`} />
                <span>{item.label}</span>
                {item.id === 'targets' && criticalCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {criticalCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Survey Region Selector & Search */}
        <div className="flex items-center gap-2.5 relative">
          <div className="relative">
            <button
              id="region-selector-btn"
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 hover:border-cyan-400 text-xs text-slate-200 transition-all max-w-[210px] sm:max-w-[270px] shadow-md"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="truncate text-left">
                <span className="block text-[9px] uppercase tracking-wider text-sky-400 font-bold">
                  Region: {activeRegion.type}
                </span>
                <span className="truncate block font-bold text-white">{activeRegion.name}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
            </button>

            {/* Dropdown Menu */}
            {regionDropdownOpen && (
              <div
                id="region-dropdown-popover"
                className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-sky-500/40 shadow-2xl p-3 z-50 text-xs backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <form onSubmit={handleSearchSubmit} className="mb-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search water body..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </form>

                <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-slate-800/60">
                  <div className="text-[10px] uppercase font-bold text-sky-400 px-2 py-1">
                    Active Water Bodies
                  </div>
                  {surveyRegions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => {
                        setActiveRegion(region);
                        setRegionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl flex flex-col transition-all pt-2 ${
                        activeRegion.id === region.id
                          ? 'bg-sky-950/80 border border-cyan-500/40 text-cyan-200 shadow'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{region.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {region.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate mt-0.5">
                        Depth: {region.depthRange} • {region.currentAnomalyCount} registered anomalies
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ProvenanceBadge type="SIMULATED PROTOTYPE DATA" size="xs" className="hidden xl:inline-flex" />
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1.5 pt-2.5 pb-1 border-t border-slate-800/80 mt-2 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentMode(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap shrink-0 font-medium ${
                isActive
                  ? 'text-white bg-gradient-to-r from-sky-600 to-cyan-600 font-bold shadow'
                  : 'text-slate-300 hover:text-white bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
