import React from 'react';
import { Globe, Layers, Compass, Search, Info } from 'lucide-react';
import { OceanDigitalEarth } from './OceanDigitalEarth';
import { useMission } from '../../context/MissionContext';

export const Globe3DView: React.FC = () => {
  const { activeRegion, anomalies, auvState } = useMission();

  return (
    <div id="marine-map-gis-view" className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Marine GIS Map
          </h1>
          <p className="text-xs text-slate-500">
            Global oceanographic satellite globe, acoustic bathymetry layers, and subsea targets.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Active Survey: <strong className="text-slate-800">{activeRegion.name}</strong></span>
          <span>•</span>
          <span>Target Contacts: <strong className="text-sky-700">{anomalies.length}</strong></span>
        </div>
      </div>

      {/* Large Spacious 3D Earth GIS Visualization */}
      <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white">
        <OceanDigitalEarth
          heightClass="h-[550px] sm:h-[640px] lg:h-[720px]"
          showSearch={true}
          showLayerControls={true}
        />
      </div>
    </div>
  );
};
