export type DataProvenance =
  | 'USER PROVIDED'
  | 'SURVEY DATA'
  | 'EXTERNAL DATA'
  | 'AI INFERENCE'
  | 'MODEL ESTIMATE'
  | 'SIMULATED PROTOTYPE DATA';

export type AnomalyCategory = 'Natural' | 'Artificial' | 'Anomalous' | 'Unknown';

export type TargetPriority = 'Routine' | 'Moderate' | 'Urgent' | 'Immediate';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type TargetStatus = 'Detected' | 'Assessed' | 'Planned' | 'In Progress' | 'Recovered' | 'Preserved';

export interface EcologicalImpact {
  summary: string;
  entanglementRisk: 'None' | 'Low' | 'Moderate' | 'High' | 'Severe';
  habitatDamage: string;
  pollutionRisk: string;
  affectedFauna: string[];
  cleanupUrgency: 'Not Required (Natural)' | 'Routine' | 'High Priority' | 'Immediate Action';
}

export interface DiverSafety {
  hazardLevel: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  entanglementConcern: string;
  visibilityImpact: string;
  structuralHazards: string;
  precautions: string[];
  disclaimer: string;
}

export interface CleanupMissionPlan {
  vesselRecommendation: string;
  equipment: string[];
  crewRecommendation: string;
  estimatedDuration: string;
  recoveryMethod: string;
  safetyNotes: string;
  ecologicalSafeguards: string;
  status: 'Draft' | 'Approved' | 'Executing' | 'Completed';
  targetId: string;
}

export interface AnomalyTarget {
  id: string; // Stable ID: GN-001, WR-002, AW-005, MP-004, CR-003, HR-006, etc.
  classification: string;
  category: AnomalyCategory;
  confidence: number;
  referenceSimilarity: {
    name: string;
    score: number;
  };
  depth: number; // in meters
  depthProvenance: DataProvenance;
  dimensions: {
    length: number; // meters
    width: number;
    height?: number;
  };
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  locationProvenance: DataProvenance;
  regionName: string;
  acousticEvidence: string[];
  whyAiDetectedThis: string[];
  riskLevel: RiskLevel;
  priority: TargetPriority;
  ecologicalImpact: EcologicalImpact;
  diverSafety: DiverSafety;
  recommendedAction: string;
  status: TargetStatus;
  timestamp: string;
  provenance: DataProvenance;
  userUploaded?: boolean;
  imagePreviewUrl?: string;
  enhancedImageUrl?: string;
  missionPlan?: CleanupMissionPlan;
  bbox?: {
    x: number; // percentage 0-100
    y: number;
    w: number;
    h: number;
  };
  acousticMetrics?: {
    contrastRatio: number;
    shadowLengthMeters: number;
    specularIntensity: number;
    textureEntropy: number;
    elongationFactor: number;
  };
}

export interface SurveyRegion {
  id: string;
  name: string;
  type: 'Ocean' | 'Sea' | 'Lake' | 'River' | 'Coastal';
  coordinates: { lat: number; lng: number };
  zoomLevel: number;
  depthRange: string;
  waterClarity: string;
  currentAnomalyCount: number;
  description: string;
}

export interface AUVTelemetry {
  id: string;
  name: string;
  status: 'Autonomous Surveying' | 'Holding Station' | 'Target Tracking' | 'Surfacing';
  depth: number;
  altitude: number;
  heading: number;
  speedKnots: number;
  batteryPercent: number;
  frequency: string;
  pingRateHz: number;
  swathWidthMeters: number;
  surveyProgress: number; // 0-100
  coordinates: { lat: number; lng: number };
  systemStatus: string;
}

export interface WhatIfParameters {
  currentKnots: number;
  waveHeightMeters: number;
  windSpeedKmh: number;
  delayHours: number;
  waterTemperatureC: number;
}
