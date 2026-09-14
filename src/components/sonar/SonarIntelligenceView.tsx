import React, { useState, useRef } from 'react';
import {
  Radio,
  UploadCloud,
  FileImage,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Crosshair,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck,
  Eye,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import {
  analyzeSonarImageWithCV,
  AcousticAnalysisStep,
  AcousticClassificationResult,
  reclassifyResult,
} from '../../services/acousticEngine';

export const SonarIntelligenceView: React.FC = () => {
  const {
    anomalies,
    auvState,
    saveAnalyzedTarget,
    addToCleanupMission,
    selectTarget,
    setCurrentMode,
  } = useMission();

  // Image Upload & Analysis state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<AcousticAnalysisStep | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AcousticClassificationResult | null>(null);
  const [createdTargetId, setCreatedTargetId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Optional User metadata
  const [userDepth, setUserDepth] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scientific progress steps definition
  const progressSteps = [
    { label: 'Receiving image', desc: 'Ingesting sonar telemetry payload' },
    { label: 'Acoustic preprocessing', desc: 'Slant-range correction & noise attenuation' },
    { label: 'Feature extraction', desc: 'Computing specular highlights & shadow gradients' },
    { label: 'Reference comparison', desc: 'Comparing against acoustic signature database' },
    { label: 'Classification', desc: 'Generating multi-attribute confidence matrix' },
    { label: 'Analysis complete', desc: 'Synthesizing target intelligence dossier' },
  ];

  // Handle manual file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setAnalysisResult(null);
      setCreatedTargetId(null);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setAnalysisResult(null);
      setCreatedTargetId(null);
    }
  };

  // Run scientific analysis sequence
  const handleRunAnalysis = async () => {
    if (!imagePreviewUrl) return;

    setIsAnalyzing(true);
    setCurrentStep(null);
    setAnalysisResult(null);

    try {
      const activeFileName = uploadedFile ? uploadedFile.name : 'sonar_scan.png';

      const result = await analyzeSonarImageWithCV(
        imagePreviewUrl,
        (step) => {
          setCurrentStep(step);
        },
        activeFileName
      );

      setAnalysisResult(result);

      // Save into mission context
      const parsedDepth = userDepth ? parseFloat(userDepth) : null;
      const target = saveAnalyzedTarget(
        result,
        imagePreviewUrl,
        { lat: 50.48, lng: -7.84 },
        parsedDepth
      );
      setCreatedTargetId(target.id);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset workspace
  const handleReset = () => {
    setUploadedFile(null);
    setImagePreviewUrl(null);
    setAnalysisResult(null);
    setCreatedTargetId(null);
    setCurrentStep(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reclassify handler
  const handleReclassify = (targetClass: string) => {
    if (!analysisResult) return;
    const parsedDepth = userDepth ? parseFloat(userDepth) : null;
    const updated = reclassifyResult(analysisResult, targetClass, parsedDepth);
    setAnalysisResult(updated);
    if (imagePreviewUrl) {
      const target = saveAnalyzedTarget(
        updated,
        imagePreviewUrl,
        { lat: 50.48, lng: -7.84 },
        parsedDepth
      );
      setCreatedTargetId(target.id);
    }
  };

  return (
    <div
      id="sonar-intelligence-view"
      className="space-y-6 max-w-6xl mx-auto pb-16 text-slate-100"
    >
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Acoustic Vision Lab
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Sonar Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immersive side-scan sonar image analysis and acoustic target classification.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono text-[11px]">
            Sensor: Edgetech 4200-MP Chirp
          </span>
        </div>
      </div>

      {/* Main Immersive Sonar Workspace (Deep ocean blue palette) */}
      <div className="bg-[#0b1b2b] rounded-2xl border border-sky-900/60 p-6 shadow-xl relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Large Central Upload & Preview Area */}
        {!imagePreviewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30'
                : 'border-sky-800/60 hover:border-cyan-500/60 bg-[#0d2238]/60 hover:bg-[#0d2238]'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-bold text-white">
              Analyze Sonar Imagery
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Drop a side-scan sonar image here, or browse from your workstation to classify subsea anomalies.
            </p>

            <button
              type="button"
              className="mt-5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              Choose Image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          /* Preview and Action Controls */
          <div className="space-y-5">
            <div className="relative rounded-xl overflow-hidden bg-black/80 border border-sky-900/80 flex items-center justify-center min-h-[340px] max-h-[480px]">
              <img
                src={imagePreviewUrl}
                alt="Sonar Scan Preview"
                className="max-h-[460px] w-auto object-contain select-none"
              />

              {/* Top filename tag */}
              <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-[11px] text-slate-300 font-mono flex items-center gap-2">
                <FileImage className="w-3.5 h-3.5 text-cyan-400" />
                <span>{uploadedFile ? uploadedFile.name : 'Selected Sonar Target'}</span>
              </div>
            </div>

            {/* Simple Controls: Analyze, Replace, Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Analyze</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  Replace
                </button>

                <button
                  onClick={handleReset}
                  disabled={isAnalyzing}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Optional Depth input for context */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Depth (optional):</span>
                <input
                  type="number"
                  placeholder="e.g. 46m"
                  value={userDepth}
                  onChange={(e) => setUserDepth(e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* 2. Scientific Progress Sequence during Analysis */}
        {isAnalyzing && (
          <div className="mt-6 pt-6 border-t border-sky-900/60 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4">
              Acoustic Classification Pipeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {progressSteps.map((step, idx) => {
                const currentStageIndex = currentStep?.stage || 1;
                const isDone = currentStageIndex > idx + 1;
                const isCurrent = currentStageIndex === idx + 1;

                return (
                  <div
                    key={step.label}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      isDone
                        ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-200'
                        : isCurrent
                        ? 'bg-cyan-900/50 border-cyan-400 text-white shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                        : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                          {idx + 1}
                        </div>
                      )}
                      <span className="font-semibold">{step.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-6">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Clean Intelligence Result Design as requested:
            GHOST NET
            Artificial Anomaly
            94% Confidence
            Why detected:
            • tangled linear structure
            • acoustic shadow
            • texture similarity
            • reference similarity
            Depth, Dimensions, Location, Risk
            Primary action: MARK FOR RECOVERY
            Secondary: Continue Survey
        */}
        {analysisResult && !isAnalyzing && (
          <div className="mt-6 pt-6 border-t border-sky-900/60 space-y-5 animate-in fade-in duration-300">
            {/* Header: Name, Category, Confidence */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d2238] p-5 rounded-xl border border-sky-800/60">
              <div>
                <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                  {analysisResult.category} Anomaly
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
                  {analysisResult.classification.toUpperCase()}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-300">
                    Match Confidence:
                  </span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    {analysisResult.confidence}%
                  </span>
                  <span className="text-slate-500">•</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      analysisResult.riskLevel === 'Critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : analysisResult.riskLevel === 'High'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {analysisResult.riskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Primary & Secondary Actions */}
              <div className="flex items-center gap-2 sm:self-center">
                {analysisResult.category === 'Artificial' && (
                  <button
                    onClick={() => {
                      if (createdTargetId) addToCleanupMission(createdTargetId);
                      setCurrentMode('mission');
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    MARK FOR RECOVERY
                  </button>
                )}
                <button
                  onClick={() => setCurrentMode('overview')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Continue Survey
                </button>
              </div>
            </div>

            {/* Quick-Match Reference Signature Selector */}
            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-[#091726] border border-sky-900/60 text-xs">
              <span className="text-slate-400 text-[11px] font-medium mr-1">
                Reference Signature Overrides:
              </span>
              {[
                { label: 'Aircraft Wreck', id: 'Aircraft Wreck' },
                { label: 'Human Remains', id: 'Human Remains / Possible Human Form — Anomalous' },
                { label: 'Coral Reef', id: 'Coral Reef' },
                { label: 'Ghost Net', id: 'Ghost Net' },
                { label: 'Metallic Pipe', id: 'Metallic Pipe' },
                { label: 'Shipwreck', id: 'Shipwreck' },
              ].map((ref) => {
                const isSelected = analysisResult.classification === ref.id;
                return (
                  <button
                    key={ref.id}
                    onClick={() => handleReclassify(ref.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm ring-1 ring-cyan-300'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {ref.label}
                  </button>
                );
              })}
            </div>

            {/* Concise Evidence Section & Physical Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Evidence: Why detected */}
              <div className="bg-[#0d2238]/60 rounded-xl border border-sky-900/60 p-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
                  Why detected
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysisResult.whyAiDetectedThis.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Physical Properties: Depth, Dimensions, Location, Risk */}
              <div className="bg-[#0d2238]/60 rounded-xl border border-sky-900/60 p-4 space-y-2.5 text-xs">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
                  Physical Coordinates &amp; Scale
                </h3>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Depth:</span>
                  <span className="font-semibold text-white font-mono">
                    {(analysisResult.depth != null ? analysisResult.depth : (userDepth ? parseFloat(userDepth) : (analysisResult.category === 'Natural' ? 24.5 : 42.0))).toFixed(1)}m
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Dimensions:</span>
                  <span className="font-semibold text-white font-mono">
                    {analysisResult.dimensions?.length ?? '--'}m × {analysisResult.dimensions?.width ?? '--'}m
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-slate-300 font-mono">
                    50.48° N, 7.84° W (Celtic Shelf)
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Recommended Action:</span>
                  <span className="font-semibold text-cyan-300">
                    {analysisResult.recommendedAction}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
