import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AnomalyTarget,
  SurveyRegion,
  AUVTelemetry,
  WhatIfParameters,
  TargetStatus,
} from '../types';
import {
  INITIAL_ANOMALIES,
  GLOBAL_SURVEY_REGIONS,
  INITIAL_AUV_TELEMETRY,
} from '../data/initialData';
import { AcousticClassificationResult, createTargetFromAnalysis } from '../services/acousticEngine';

export type AppMode =
  | 'overview'
  | 'sonar'
  | 'targets'
  | 'map'
  | 'underwater3d'
  | 'mission'
  | 'reports'
  | 'settings';

interface MissionContextType {
  // Navigation & mode
  currentMode: AppMode;
  setCurrentMode: (mode: AppMode) => void;
  sonarSubTab: 'live' | 'image-analysis';
  setSonarSubTab: (tab: 'live' | 'image-analysis') => void;

  // Shared Anomaly & Target State
  anomalies: AnomalyTarget[];
  selectedTargetId: string | null;
  selectedTarget: AnomalyTarget | null;
  selectTarget: (id: string | null) => void;
  updateTargetStatus: (id: string, newStatus: TargetStatus) => void;
  addToCleanupMission: (id: string) => void;

  // Analysis result
  lastAnalysisResult: AcousticClassificationResult | null;
  setLastAnalysisResult: (res: AcousticClassificationResult | null) => void;
  saveAnalyzedTarget: (
    result: AcousticClassificationResult,
    originalImageUrl: string,
    userCoords?: { lat: number; lng: number } | null,
    userDepth?: number | null
  ) => AnomalyTarget;

  // Geographic & survey state
  surveyRegions: SurveyRegion[];
  activeRegion: SurveyRegion;
  setActiveRegion: (region: SurveyRegion) => void;
  searchRegion: (query: string) => SurveyRegion | null;

  // AUV Telemetry state
  auvState: AUVTelemetry;
  setAuvState: React.Dispatch<React.SetStateAction<AUVTelemetry>>;

  // Oceanographic What-If Simulation parameters
  whatIf: WhatIfParameters;
  setWhatIf: React.Dispatch<React.SetStateAction<WhatIfParameters>>;

  // Timeline / Action Log
  missionLog: { id: string; time: string; text: string; type: 'info' | 'alert' | 'success' }[];
  addLogMessage: (text: string, type?: 'info' | 'alert' | 'success') => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMode, setCurrentMode] = useState<AppMode>('overview');
  const [sonarSubTab, setSonarSubTab] = useState<'live' | 'image-analysis'>('live');
  const [anomalies, setAnomalies] = useState<AnomalyTarget[]>(INITIAL_ANOMALIES);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>('GN-001');
  const [lastAnalysisResult, setLastAnalysisResult] = useState<AcousticClassificationResult | null>(null);

  const [surveyRegions] = useState<SurveyRegion[]>(GLOBAL_SURVEY_REGIONS);
  const [activeRegion, setActiveRegion] = useState<SurveyRegion>(GLOBAL_SURVEY_REGIONS[0]);
  const [auvState, setAuvState] = useState<AUVTelemetry>(INITIAL_AUV_TELEMETRY);

  const [whatIf, setWhatIf] = useState<WhatIfParameters>({
    currentKnots: 1.8,
    waveHeightMeters: 2.2,
    windSpeedKmh: 28,
    delayHours: 24,
    waterTemperatureC: 11.5,
  });

  const [missionLog, setMissionLog] = useState<{ id: string; time: string; text: string; type: 'info' | 'alert' | 'success' }[]>([
    { id: '1', time: '04:12:00 UTC', text: 'AUV-01 commenced swath line 04 at 46.2m depth.', type: 'info' },
    { id: '2', time: '04:18:35 UTC', text: 'Target GN-001 detected. AI classified Ghost Net (94% confidence).', type: 'alert' },
    { id: '3', time: '04:22:10 UTC', text: 'Acoustic shadow analysis verified 12.4m vertical lofting under current.', type: 'info' },
    { id: '4', time: '04:25:00 UTC', text: 'Target GN-001 prioritized for Cleanup Mission Plan.', type: 'success' },
  ]);

  const addLogMessage = (text: string, type: 'info' | 'alert' | 'success' = 'info') => {
    const time = new Date().toISOString().substring(11, 19) + ' UTC';
    setMissionLog((prev) => [{ id: String(Date.now()), time, text, type }, ...prev]);
  };

  const selectedTarget = anomalies.find((a) => a.id === selectedTargetId) || null;

  const selectTarget = (id: string | null) => {
    setSelectedTargetId(id);
  };

  const updateTargetStatus = (id: string, newStatus: TargetStatus) => {
    setAnomalies((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    addLogMessage(`Target ${id} status updated to: ${newStatus}`, 'success');
  };

  const addToCleanupMission = (id: string) => {
    updateTargetStatus(id, 'Planned');
    setSelectedTargetId(id);
    setCurrentMode('mission');
    addLogMessage(`Target ${id} assigned to active Cleanup Mission Planner.`, 'success');
  };

  const saveAnalyzedTarget = (
    result: AcousticClassificationResult,
    originalImageUrl: string,
    userCoords?: { lat: number; lng: number } | null,
    userDepth?: number | null
  ): AnomalyTarget => {
    const newTarget = createTargetFromAnalysis(
      result,
      originalImageUrl,
      activeRegion.name,
      userCoords,
      userDepth
    );

    setAnomalies((prev) => [newTarget, ...prev]);
    setSelectedTargetId(newTarget.id);
    addLogMessage(
      `New Anomaly logged: ${newTarget.id} (${newTarget.classification}) with ${newTarget.confidence}% confidence.`,
      newTarget.category === 'Artificial' || newTarget.category === 'Anomalous' ? 'alert' : 'info'
    );
    return newTarget;
  };

  const searchRegion = (query: string): SurveyRegion | null => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    const found = surveyRegions.find(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
    if (found) {
      setActiveRegion(found);
      setAuvState((prev) => ({
        ...prev,
        coordinates: found.coordinates,
      }));
      addLogMessage(`Active Survey Region changed to: ${found.name}`, 'info');
      return found;
    }
    return null;
  };

  // Subtle AUV position and progress telemetry simulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setAuvState((prev) => {
        const currentProgress = prev?.surveyProgress ?? 0;
        const currentHeading = prev?.heading ?? 142;
        const currentDepth = prev?.depth ?? 46.2;
        const currentBattery = prev?.batteryPercent ?? 100;

        const nextProgress = currentProgress >= 100 ? 0 : Number((currentProgress + 0.1).toFixed(1));
        const headingJitter = currentHeading + (Math.random() * 2 - 1);
        const depthJitter = Math.max(10, Math.min(200, currentDepth + (Math.random() * 0.4 - 0.2)));
        return {
          ...prev,
          surveyProgress: nextProgress,
          heading: Math.round(headingJitter % 360),
          depth: Number(depthJitter.toFixed(1)),
          batteryPercent: Math.max(15, currentBattery - 0.01),
        };
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <MissionContext.Provider
      value={{
        currentMode,
        setCurrentMode,
        sonarSubTab,
        setSonarSubTab,
        anomalies,
        selectedTargetId,
        selectedTarget,
        selectTarget,
        updateTargetStatus,
        addToCleanupMission,
        lastAnalysisResult,
        setLastAnalysisResult,
        saveAnalyzedTarget,
        surveyRegions,
        activeRegion,
        setActiveRegion,
        searchRegion,
        auvState,
        setAuvState,
        whatIf,
        setWhatIf,
        missionLog,
        addLogMessage,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
