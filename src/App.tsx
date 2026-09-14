import React, { useState } from 'react';
import { Menu, X, Waves, Radio, Globe } from 'lucide-react';
import { MissionProvider, useMission } from './context/MissionContext';
import { SidebarNavigation } from './components/SidebarNavigation';
import { OverviewView } from './components/overview/OverviewView';
import { SonarIntelligenceView } from './components/sonar/SonarIntelligenceView';
import { TargetsView } from './components/targets/TargetsView';
import { Globe3DView } from './components/gis/Globe3DView';
import { Underwater3DView } from './components/underwater/Underwater3DView';
import { MissionView } from './components/mission/MissionView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

function AppContent() {
  const { currentMode, setCurrentMode, activeRegion, auvState } = useMission();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans selection:bg-sky-500/20 selection:text-sky-900 relative">
      {/* Clean Slim Sidebar */}
      <SidebarNavigation
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header for Mobile & Quick Status */}
        <header className="h-16 px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
              <span className="text-xs font-semibold text-slate-700">
                {activeRegion.name}
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                {activeRegion.depthRange}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
              <Radio className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-mono">{auvState?.id ?? 'AUV-01'}</span>
            </span>

            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-medium">
              <span>Survey:</span>
              <strong className="font-mono">{(auvState?.surveyProgress != null ? auvState.surveyProgress : 0).toFixed(0)}%</strong>
            </span>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentMode === 'overview' && <OverviewView />}
          {currentMode === 'sonar' && <SonarIntelligenceView />}
          {currentMode === 'targets' && <TargetsView />}
          {currentMode === 'map' && <Globe3DView />}
          {currentMode === 'underwater3d' && <Underwater3DView />}
          {currentMode === 'mission' && <MissionView />}
          {currentMode === 'reports' && <ReportsView />}
          {currentMode === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MissionProvider>
      <AppContent />
    </MissionProvider>
  );
}
