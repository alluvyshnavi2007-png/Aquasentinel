import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Compass,
  Crosshair,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export const ReportsView: React.FC = () => {
  const {
    anomalies,
    activeRegion,
    auvState,
    whatIf,
    missionLog,
  } = useMission();

  const [copied, setCopied] = useState<boolean>(false);

  // Export to structured Excel spreadsheet (.xlsx) using the installed xlsx package
  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Target Registry
    const targetRows = anomalies.map((t) => ({
      'Target ID': t.id,
      'Classification': t.classification,
      'Category': t.category,
      'Confidence (%)': t.confidence,
      'Depth (m)': t.depth,
      'Depth Provenance': t.depthProvenance,
      'Length (m)': t.dimensions.length,
      'Width (m)': t.dimensions.width,
      'Latitude': t.coordinates?.lat ?? 'N/A',
      'Longitude': t.coordinates?.lng ?? 'N/A',
      'Location Provenance': t.locationProvenance,
      'Survey Region': t.regionName,
      'Risk Level': t.riskLevel,
      'Priority': t.priority,
      'Status': t.status,
      'Ecological Summary': t.ecologicalImpact.summary,
      'Entanglement Risk': t.ecologicalImpact.entanglementRisk,
      'Diver Safety Hazard': t.diverSafety.hazardLevel,
      'Recommended Action': t.recommendedAction,
      'Timestamp': t.timestamp,
      'Data Provenance': t.provenance,
    }));
    const targetSheet = XLSX.utils.json_to_sheet(targetRows);
    XLSX.utils.book_append_sheet(workbook, targetSheet, 'Target Intelligence');

    // Sheet 2: Survey & Telemetry Summary
    const summaryRows = [
      { Parameter: 'Survey Region', Value: activeRegion.name },
      { Parameter: 'Region Type', Value: activeRegion.type },
      { Parameter: 'Bathymetric Depth Range', Value: activeRegion.depthRange },
      { Parameter: 'Water Clarity', Value: activeRegion.waterClarity },
      { Parameter: 'AUV Unit', Value: auvState.id },
      { Parameter: 'AUV Status', Value: auvState.status },
      { Parameter: 'Swath Chirp Frequency', Value: auvState.frequency },
      { Parameter: 'Survey Progress (%)', Value: `${(auvState.surveyProgress != null ? auvState.surveyProgress : 0).toFixed(1)}%` },
      { Parameter: 'Total Registered Targets', Value: anomalies.length },
      { Parameter: 'Critical / Immediate Priority', Value: anomalies.filter(a => a.riskLevel === 'Critical').length },
      { Parameter: 'Cleanup Candidates', Value: anomalies.filter(a => a.category === 'Artificial').length },
      { Parameter: 'Living Coral Sanctuaries', Value: anomalies.filter(a => a.category === 'Natural').length },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Survey Summary');

    // Sheet 3: Mission Log
    const logRows = missionLog.map(l => ({
      Timestamp: l.time,
      Severity: l.type.toUpperCase(),
      Message: l.text,
    }));
    const logSheet = XLSX.utils.json_to_sheet(logRows);
    XLSX.utils.book_append_sheet(workbook, logSheet, 'Mission Event Log');

    XLSX.writeFile(workbook, `AquaSentinel_MissionReport_${activeRegion.id}_${Date.now()}.xlsx`);
  };

  const handleCopySummary = () => {
    const text = `AquaSentinel Scientific Mission Dossier
Region: ${activeRegion.name} (${activeRegion.depthRange})
AUV Unit: ${auvState.id} | Survey Progress: ${(auvState.surveyProgress != null ? auvState.surveyProgress : 0).toFixed(0)}%
Total Targets: ${anomalies.length}
Critical Hazards: ${anomalies.filter(a => a.riskLevel === 'Critical').length}
Cleanup Candidates: ${anomalies.filter(a => a.category === 'Artificial').length}
Protected Habitats: ${anomalies.filter(a => a.category === 'Natural').length}
Generated via AquaSentinel Marine Intelligence.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="reports-view-container" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Scientific Reports &amp; Export
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Peer-reviewable oceanographic survey dossiers, GIS target records, and Excel spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {/* Executive Summary */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Executive Survey Summary
            </h2>
            <ProvenanceBadge type="EXTERNAL DATA" size="xs" />
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-3xl">
            Autonomous reconnaissance conducted by {auvState.id} across {activeRegion.name}. Swath acoustic surveys operating at {auvState.frequency} have classified {anomalies.length} subsea contacts, with {anomalies.filter(a => a.riskLevel === 'Critical').length} critical hazards queued for Work-Class ROV containment.
          </p>
        </div>

        {/* 4 Summary Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">Total Targets</span>
            <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">{anomalies.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">Critical Hazards</span>
            <span className="text-xl font-bold text-rose-600 font-mono mt-1 block">
              {anomalies.filter(a => a.riskLevel === 'Critical').length}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">Survey Completed</span>
            <span className="text-xl font-bold text-sky-600 font-mono mt-1 block">
              {(auvState.surveyProgress != null ? auvState.surveyProgress : 0).toFixed(0)}%
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <span className="text-slate-400 block text-[11px]">Living Corals</span>
            <span className="text-xl font-bold text-emerald-600 font-mono mt-1 block">
              {anomalies.filter(a => a.category === 'Natural').length}
            </span>
          </div>
        </div>

        {/* Detailed Table Preview */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Target Anomaly Catalog
          </h3>
          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Depth</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {anomalies.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{t.classification}</td>
                    <td className="py-2.5 px-3 font-mono text-sky-700">{t.confidence}%</td>
                    <td className="py-2.5 px-3">{(t.depth != null ? t.depth : 0).toFixed(1)}m</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.riskLevel === 'Critical'
                            ? 'bg-rose-50 text-rose-700'
                            : t.riskLevel === 'High'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{t.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
