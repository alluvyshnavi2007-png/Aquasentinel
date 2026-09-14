import React, { useState } from 'react';
import {
  Crosshair,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
  Radio,
  ExternalLink,
  Waves,
  Calendar,
  X,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { AnomalyTarget, TargetStatus } from '../../types';

export const TargetsView: React.FC = () => {
  const {
    anomalies,
    selectedTargetId,
    selectedTarget,
    selectTarget,
    updateTargetStatus,
    addToCleanupMission,
    setCurrentMode,
  } = useMission();

  const [searchFilter, setSearchFilter] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // Expandable sections inside the intelligence dossier
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    detection: true,
    location: true,
    evidence: true,
    ecology: false,
    safety: false,
    mission: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredTargets = anomalies.filter((target) => {
    const matchesRisk =
      filterRisk === 'ALL' ||
      (filterRisk === 'CRITICAL' && (target.riskLevel === 'Critical' || target.priority === 'Immediate')) ||
      target.riskLevel.toUpperCase() === filterRisk;

    const matchesSearch =
      !searchFilter.trim() ||
      target.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      target.classification.toLowerCase().includes(searchFilter.toLowerCase()) ||
      target.regionName.toLowerCase().includes(searchFilter.toLowerCase());

    return matchesRisk && matchesSearch;
  });

  const currentTarget = selectedTarget || (anomalies.length > 0 ? anomalies[0] : null);

  return (
    <div id="targets-view-container" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Target Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Classified marine acoustic contacts, risk evaluations, and environmental containment records.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search target ID or type..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 w-52 shadow-xs"
            />
          </div>

          <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-xl shadow-xs text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'LOW'].map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterRisk === risk
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout: Clean Table on Left + Intelligence Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Clean Targets Table as specified:
            | ID | Type | Confidence | Risk | Status |
        */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Targets Registry ({filteredTargets.length})
            </h2>
            <span className="text-[11px] text-slate-400">
              Click row to inspect dossier
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTargets.map((target) => {
                  const isSelected = currentTarget?.id === target.id;
                  return (
                    <tr
                      key={target.id}
                      onClick={() => selectTarget(target.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-50/80 font-medium text-slate-900'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {target.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {target.classification}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-sky-700">
                        {target.confidence}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            target.riskLevel === 'Critical'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : target.riskLevel === 'High'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {target.riskLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-600">{target.status}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {target.category === 'Artificial' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCleanupMission(target.id);
                              setCurrentMode('mission');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-[11px] transition-colors"
                          >
                            Plan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Expandable Intelligence Dossier
            Sections: Detection, Location, Evidence, Ecology, Safety, Mission
        */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          {!currentTarget ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs font-semibold">No target selected</p>
              <p className="text-[11px] mt-1">Select an anomaly from the directory to inspect intelligence dossier.</p>
            </div>
          ) : (
            <>
              {/* Dossier Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    {currentTarget.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentTarget.riskLevel === 'Critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : currentTarget.riskLevel === 'High'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {currentTarget.riskLevel} Risk
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  {currentTarget.classification}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentTarget.category} Anomaly • Match Confidence: {currentTarget.confidence}%
                </p>
              </div>

              {/* Expandable Section 1: Detection */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('detection')}
                  className="w-full p-3 bg-slate-50/80 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
                >
                  <span>1. Detection &amp; Physical Geometry</span>
                  {openSections.detection ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>
                {openSections.detection && (
                  <div className="p-3 text-xs space-y-2 text-slate-600 border-t border-slate-100 bg-white">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dimensions:</span>
                      <span className="font-semibold text-slate-800">
                        {currentTarget.dimensions?.length ?? '--'}m × {currentTarget.dimensions?.width ?? '--'}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registered Timestamp:</span>
                      <span className="font-mono text-slate-700">{currentTarget.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sensor Provenance:</span>
                      <span className="font-semibold text-slate-700">{currentTarget.provenance}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Expandable Section 2: Location */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('location')}
                  className="w-full p-3 bg-slate-50/80 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
                >
                  <span>2. Geographic Coordinates &amp; Depth</span>
                  {openSections.location ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>
                {openSections.location && (
                  <div className="p-3 text-xs space-y-2 text-slate-600 border-t border-slate-100 bg-white">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Depth:</span>
                      <span className="font-semibold text-slate-800">{(currentTarget.depth != null ? currentTarget.depth : 0).toFixed(1)}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Region:</span>
                      <span className="font-semibold text-slate-800">{currentTarget.regionName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coordinates:</span>
                      <span className="font-mono text-slate-700">
                        {currentTarget.coordinates?.lat != null && currentTarget.coordinates?.lng != null
                          ? `${currentTarget.coordinates.lat.toFixed(4)}° N, ${Math.abs(currentTarget.coordinates.lng).toFixed(4)}° W`
                          : 'Sensor Relative'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

          {/* Expandable Section 3: Evidence */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('evidence')}
              className="w-full p-3 bg-slate-50/80 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
            >
              <span>3. Acoustic Vision Evidence</span>
              {openSections.evidence ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {openSections.evidence && (
              <div className="p-3 text-xs space-y-1.5 text-slate-600 border-t border-slate-100 bg-white">
                {currentTarget.whyAiDetectedThis.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sky-600 mt-0.5">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expandable Section 4: Ecology */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('ecology')}
              className="w-full p-3 bg-slate-50/80 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
            >
              <span>4. Ecological Impact Assessment</span>
              {openSections.ecology ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {openSections.ecology && (
              <div className="p-3 text-xs space-y-2 text-slate-600 border-t border-slate-100 bg-white">
                <p className="leading-relaxed">{currentTarget.ecologicalImpact?.summary ?? ''}</p>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Entanglement:</span>
                  <span className="font-semibold text-rose-600">{currentTarget.ecologicalImpact?.entanglementRisk ?? 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Affected Fauna:</span>
                  <span className="font-medium text-slate-800">
                    {currentTarget.ecologicalImpact?.affectedFauna?.join(', ') ?? 'None'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Expandable Section 5: Safety */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('safety')}
              className="w-full p-3 bg-slate-50/80 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
            >
              <span>5. Diver &amp; Operational Safety</span>
              {openSections.safety ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {openSections.safety && (
              <div className="p-3 text-xs space-y-2 text-slate-600 border-t border-slate-100 bg-white">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hazard Level:</span>
                  <span className="font-semibold text-amber-700">{currentTarget.diverSafety?.hazardLevel ?? 'None'}</span>
                </div>
                <p className="text-slate-600">{currentTarget.diverSafety?.entanglementConcern ?? ''}</p>
              </div>
            )}
          </div>

          {/* Expandable Section 6: Mission */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('mission')}
              className="w-full p-3 bg-slate-50/80 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
            >
              <span>6. Cleanup Protocol &amp; Equipment</span>
              {openSections.mission ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {openSections.mission && (
              <div className="p-3 text-xs space-y-2 text-slate-600 border-t border-slate-100 bg-white">
                <p className="font-medium text-slate-800">{currentTarget.recommendedAction}</p>
                {currentTarget.category === 'Artificial' && (
                  <button
                    onClick={() => {
                      addToCleanupMission(currentTarget.id);
                      setCurrentMode('mission');
                    }}
                    className="w-full mt-2 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors"
                  >
                    Open in Cleanup Mission Planner
                  </button>
                )}
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
