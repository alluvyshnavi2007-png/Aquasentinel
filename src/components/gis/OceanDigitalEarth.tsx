import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Search,
  Layers,
  Compass,
  RotateCcw,
  Plus,
  Minus,
  Crosshair,
  MapPin,
  X,
  ExternalLink,
  Waves,
  Eye,
  Check,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { AnomalyTarget, SurveyRegion } from '../../types';

export interface MapLayersState {
  surveyArea: boolean;
  auvRoute: boolean;
  anomalies: boolean;
  bathymetry: boolean;
  ecology: boolean;
  marineConditions: boolean;
  historicalTargets: boolean;
}

interface WaterBodyLocation {
  name: string;
  type: 'Ocean' | 'Sea' | 'Lake' | 'Trench' | 'River';
  lat: number;
  lng: number;
  zoom: number;
  depth: string;
  anomaliesCount: number;
  description: string;
}

const GLOBAL_WATER_BODIES: WaterBodyLocation[] = [
  {
    name: 'Atlantic Ocean (Celtic Shelf)',
    type: 'Ocean',
    lat: 50.45,
    lng: -7.82,
    zoom: 2.2,
    depth: '65m - 180m',
    anomaliesCount: 4,
    description: 'High-density maritime corridor with historic shipwrecks and active ghost net survey.',
  },
  {
    name: 'Pacific Ocean (Central Basin)',
    type: 'Ocean',
    lat: 10.5,
    lng: -165.0,
    zoom: 2.6,
    depth: '4,000m - 5,500m',
    anomaliesCount: 6,
    description: 'Abyssal plains and deep seamount chains across the Clarion-Clipperton Zone.',
  },
  {
    name: 'Indian Ocean (Ninety East Ridge)',
    type: 'Ocean',
    lat: -5.0,
    lng: 90.0,
    zoom: 2.6,
    depth: '2,500m - 4,800m',
    anomaliesCount: 3,
    description: 'Mid-ocean tectonic ridge with active hydrothermal vents and deep currents.',
  },
  {
    name: 'Arctic Ocean (Fram Strait)',
    type: 'Ocean',
    lat: 79.0,
    lng: 0.0,
    zoom: 2.6,
    depth: '1,500m - 2,800m',
    anomaliesCount: 2,
    description: 'Deep polar sea passage between Greenland and Svalbard with ice-rafted deposits.',
  },
  {
    name: 'Southern Ocean (Drake Passage)',
    type: 'Ocean',
    lat: -58.5,
    lng: -64.0,
    zoom: 2.6,
    depth: '3,000m - 4,500m',
    anomaliesCount: 2,
    description: 'Circumpolar current confluence with severe sea states and extreme bathymetry.',
  },
  {
    name: 'Mediterranean Sea (Aegean)',
    type: 'Sea',
    lat: 37.52,
    lng: 25.18,
    zoom: 2.1,
    depth: '35m - 220m',
    anomaliesCount: 3,
    description: 'Ancient historical maritime routes with high archaeological preservation.',
  },
  {
    name: 'Red Sea (Ras Mohammed)',
    type: 'Sea',
    lat: 27.75,
    lng: 34.25,
    zoom: 2.1,
    depth: '18m - 120m',
    anomaliesCount: 2,
    description: 'Hyper-saline coral reef corridors and steep bathymetric walls.',
  },
  {
    name: 'Black Sea (Crimean Shelf)',
    type: 'Sea',
    lat: 44.3,
    lng: 34.1,
    zoom: 2.1,
    depth: '80m - 400m',
    anomaliesCount: 3,
    description: 'Vast anoxic marine basin preserving wooden shipwrecks intact for millennia.',
  },
  {
    name: 'Baltic Sea (Bornholm Basin)',
    type: 'Sea',
    lat: 55.2,
    lng: 15.65,
    zoom: 2.1,
    depth: '45m - 95m',
    anomaliesCount: 5,
    description: 'Brackish inland sea with extensive subsea pipeline conduits.',
  },
  {
    name: 'Caspian Sea (Absheron Basin)',
    type: 'Sea',
    lat: 40.5,
    lng: 51.5,
    zoom: 2.1,
    depth: '40m - 750m',
    anomaliesCount: 3,
    description: 'World\'s largest inland body of water with subsea petroleum conduits.',
  },
  {
    name: 'Coral Sea (Great Barrier Reef)',
    type: 'Sea',
    lat: -16.5,
    lng: 147.5,
    zoom: 2.1,
    depth: '15m - 450m',
    anomaliesCount: 4,
    description: 'UNESCO World Heritage biogenic coral reef terraces and WWII aviation wrecks.',
  },
  {
    name: 'Lake Baikal (Chivyrkuy)',
    type: 'Lake',
    lat: 53.6,
    lng: 109.15,
    zoom: 2.1,
    depth: '25m - 340m',
    anomaliesCount: 2,
    description: 'Deepest and oldest freshwater rift lake on Earth (20% of world freshwater).',
  },
  {
    name: 'Lake Victoria (Mwanza)',
    type: 'Lake',
    lat: -2.52,
    lng: 32.88,
    zoom: 2.1,
    depth: '15m - 65m',
    anomaliesCount: 2,
    description: 'Tropical African lake with extensive submerged gillnets and artisanal gear.',
  },
  {
    name: 'Lake Superior (Whitefish Point)',
    type: 'Lake',
    lat: 46.9,
    lng: -85.0,
    zoom: 2.1,
    depth: '40m - 240m',
    anomaliesCount: 4,
    description: 'Cold freshwater Great Lake renowned for over 500 preserved shipwrecks.',
  },
  {
    name: 'Mariana Trench (Challenger Deep)',
    type: 'Trench',
    lat: 14.85,
    lng: 144.2,
    zoom: 2.2,
    depth: '320m - 1,450m (Slope)',
    anomaliesCount: 2,
    description: 'Deepest oceanic subduction trench on Earth with fault scarps.',
  },
  {
    name: 'Mississippi River Delta',
    type: 'River',
    lat: 29.15,
    lng: -89.25,
    zoom: 2.1,
    depth: '8m - 45m',
    anomaliesCount: 3,
    description: 'Sediment discharge plume with subsea pipeline networks.',
  },
  {
    name: 'Amazon River Estuary',
    type: 'River',
    lat: 0.05,
    lng: -51.05,
    zoom: 2.1,
    depth: '12m - 50m',
    anomaliesCount: 2,
    description: 'World\'s largest freshwater discharge plume with dynamic silt sandbars.',
  },
];

interface OceanDigitalEarthProps {
  heightClass?: string;
  showSearch?: boolean;
  showLayerControls?: boolean;
  allowSelection?: boolean;
  onTargetClick?: (target: AnomalyTarget) => void;
}

export const OceanDigitalEarth: React.FC<OceanDigitalEarthProps> = ({
  heightClass = 'h-[460px] sm:h-[540px] lg:h-[600px]',
  showSearch = true,
  showLayerControls = true,
  allowSelection = true,
  onTargetClick,
}) => {
  const {
    activeRegion,
    setActiveRegion,
    anomalies,
    selectTarget,
    setCurrentMode,
    auvState,
  } = useMission();

  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [selectedTargetItem, setSelectedTargetItem] = useState<AnomalyTarget | null>(null);
  const [selectedWaterBody, setSelectedWaterBody] = useState<WaterBodyLocation | null>(null);

  // Active Map Layers
  const [layers, setLayers] = useState<MapLayersState>({
    surveyArea: true,
    auvRoute: true,
    anomalies: true,
    bathymetry: false,
    ecology: true,
    marineConditions: false,
    historicalTargets: false,
  });

  // Three.js References
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const routesGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.25, y: 0.8 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.25, y: 0.8 });
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetZoomRef = useRef(2.5);
  const currentZoomRef = useRef(2.5);
  const is2DModeRef = useRef(false);

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return GLOBAL_WATER_BODIES.filter(
      (wb) =>
        wb.name.toLowerCase().includes(q) ||
        wb.type.toLowerCase().includes(q) ||
        wb.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Convert Lat/Lng to Vector3
  const latLngToVector3 = (lat: number, lng: number, radius = 1.0): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Fly to target coordinates
  const flyToCoordinates = (lat: number, lng: number, zoom = 2.1) => {
    const targetY = -(lng * Math.PI) / 180 + Math.PI / 2;
    const targetX = (lat * Math.PI) / 180;
    targetRotationRef.current = { x: targetX, y: targetY };
    targetZoomRef.current = zoom;
  };

  // Create High-Definition Ocean-First Earth Texture
  const createOceanEarthTexture = (bathymetry = false): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Subtle Multi-Depth Ocean Gradient (Ocean Blue to Deep Aqua)
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 1024);
    if (bathymetry) {
      // Scientific bathymetric color scale (Indigo -> Deep Blue -> Cyan -> Teal)
      oceanGradient.addColorStop(0, '#0a1d37');
      oceanGradient.addColorStop(0.3, '#0b3c5d');
      oceanGradient.addColorStop(0.5, '#1d6a96');
      oceanGradient.addColorStop(0.7, '#0b3c5d');
      oceanGradient.addColorStop(1, '#0a1d37');
    } else {
      // Natural oceanographic digital earth
      oceanGradient.addColorStop(0, '#0f2f57');
      oceanGradient.addColorStop(0.2, '#143d6e');
      oceanGradient.addColorStop(0.5, '#1a4e8c');
      oceanGradient.addColorStop(0.8, '#143d6e');
      oceanGradient.addColorStop(1, '#0f2f57');
    }
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 2048, 1024);

    // 2. Continental Shelf Turquoise / Shallow Lagoon Glow
    ctx.fillStyle = '#06b6d4';
    ctx.filter = 'blur(14px)';
    ctx.globalAlpha = 0.3;

    const drawLagoon = (x: number, y: number, rx: number, ry: number, rot = 0) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rx + 12, ry + 12, rot, 0, Math.PI * 2);
      ctx.fill();
    };

    drawLagoon(540, 360, 180, 150, -0.2); // North America
    drawLagoon(660, 650, 120, 180, 0.3); // South America
    drawLagoon(1180, 370, 290, 170, 0); // Eurasia
    drawLagoon(1090, 590, 140, 180, 0); // Africa
    drawLagoon(1670, 690, 100, 80, 0); // Australia
    ctx.filter = 'none';
    ctx.globalAlpha = 1.0;

    // 3. Clean, Elegant Continents with Natural Earth Tones
    // Restrained sage green, temperate gold, clean landforms
    const continentGreen = '#3a5a40';
    const aridGold = '#a3875d';
    const polarWhite = '#e2e8f0';

    // Europe & Asia
    ctx.fillStyle = continentGreen;
    ctx.beginPath();
    ctx.ellipse(1220, 340, 260, 130, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sahara / Middle East
    ctx.fillStyle = aridGold;
    ctx.beginPath();
    ctx.ellipse(1120, 480, 150, 65, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Sub-Saharan Africa
    ctx.fillStyle = continentGreen;
    ctx.beginPath();
    ctx.ellipse(1110, 620, 100, 120, 0, 0, Math.PI * 2);
    ctx.fill();

    // North America
    ctx.fillStyle = continentGreen;
    ctx.beginPath();
    ctx.ellipse(520, 340, 160, 120, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // South America
    ctx.fillStyle = continentGreen;
    ctx.beginPath();
    ctx.ellipse(660, 650, 100, 160, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Australia
    ctx.fillStyle = aridGold;
    ctx.beginPath();
    ctx.ellipse(1680, 690, 90, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // Polar caps
    ctx.fillStyle = polarWhite;
    ctx.fillRect(0, 0, 2048, 55); // Arctic
    ctx.fillRect(0, 925, 2048, 99); // Antarctic

    // 4. Subtle Atmospheric Weather Swirls (Soft, transparent)
    ctx.fillStyle = '#ffffff';
    ctx.filter = 'blur(12px)';
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 18; i++) {
      const cx = (i * 120 + 80) % 2048;
      const cy = 220 + Math.sin(i * 1.5) * 160;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 120 + (i % 3) * 30, 28 + (i % 2) * 15, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.filter = 'none';
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  // Re-build markers when anomalies, layers, or selection changes
  useEffect(() => {
    if (!markersGroupRef.current) return;
    const group = markersGroupRef.current;
    group.clear();

    if (!layers.anomalies) return;

    // Place scientific pulse markers for all detected anomalies
    anomalies.forEach((target) => {
      const coords = target.coordinates || { lat: 50.45, lng: -7.82 };
      const pos = latLngToVector3(coords.lat, coords.lng, 1.018);

      // Color coding: Critical (Red/Coral), High (Amber), Natural (Emerald), Moderate (Cyan/Blue)
      let markerColor = 0x0284c7; // default ocean blue
      if (target.riskLevel === 'Critical') markerColor = 0xf43f5e;
      else if (target.riskLevel === 'High') markerColor = 0xf59e0b;
      else if (target.category === 'Natural') markerColor = 0x10b981;

      // Outer pulse ring
      const ringGeo = new THREE.RingGeometry(0.014, 0.022, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(pos.clone().multiplyScalar(2));
      ringMesh.userData = { targetId: target.id };
      group.add(ringMesh);

      // Inner solid core
      const coreGeo = new THREE.CircleGeometry(0.009, 24);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.copy(pos.clone().multiplyScalar(1.001));
      coreMesh.lookAt(pos.clone().multiplyScalar(2));
      coreMesh.userData = { targetId: target.id };
      group.add(coreMesh);
    });

    // AUV route waypoints line
    if (routesGroupRef.current) {
      routesGroupRef.current.clear();
      if (layers.auvRoute && activeRegion.coordinates) {
        const points: THREE.Vector3[] = [];
        const baseLat = activeRegion.coordinates.lat;
        const baseLng = activeRegion.coordinates.lng;

        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const lat = baseLat - 0.4 + t * 0.8 + Math.sin(t * Math.PI * 3) * 0.15;
          const lng = baseLng - 0.5 + t * 1.0;
          points.push(latLngToVector3(lat, lng, 1.012));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const curveGeo = new THREE.TubeGeometry(curve, 64, 0.004, 8, false);
        const curveMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.7,
        });
        const routeMesh = new THREE.Mesh(curveGeo, curveMat);
        routesGroupRef.current.add(routeMesh);
      }
    }
  }, [anomalies, layers, activeRegion]);

  // Main Three.js setup
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.z = currentZoomRef.current;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Earth Sphere Geometry & Material
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const texture = createOceanEarthTexture(layers.bathymetry);
    const earthMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.05,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Atmospheric Rim (Subtle and restrained)
    const atmoGeo = new THREE.SphereGeometry(1.022, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);

    // Natural Sunlight Lighting (Warm directional light + soft ambient light)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xdce7f5, 0.95);
    scene.add(ambientLight);

    // Markers & Routes Group
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const routesGroup = new THREE.Group();
    globeGroup.add(routesGroup);
    routesGroupRef.current = routesGroup;

    // Raycaster for clicking markers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse & Touch Interactivity
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.005;
      targetRotationRef.current.x += deltaY * 0.005;
      targetRotationRef.current.x = Math.max(-1.4, Math.min(1.4, targetRotationRef.current.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersGroup.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const targetId = hit.userData?.targetId;
        if (targetId) {
          const match = anomalies.find((a) => a.id === targetId);
          if (match) {
            setSelectedTargetItem(match);
            selectTarget(match.id);
            if (onTargetClick) onTargetClick(match);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomRef.current = Math.max(1.6, Math.min(4.2, targetZoomRef.current + e.deltaY * 0.002));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x = currentRotationRef.current.x;
        globeGroupRef.current.rotation.y = currentRotationRef.current.y;

        // Subtle idle spin when not dragging or inspecting a selected target
        if (!isDraggingRef.current && !selectedTargetItem && !selectedWaterBody) {
          targetRotationRef.current.y += 0.0005;
        }
      }

      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.1;
      camera.position.z = currentZoomRef.current;

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [layers.bathymetry]);

  // Handle Water Body Selection
  const handleSelectWaterBody = (wb: WaterBodyLocation) => {
    setSelectedWaterBody(wb);
    setSelectedTargetItem(null);
    setSearchQuery(wb.name);
    setIsSearching(false);
    flyToCoordinates(wb.lat, wb.lng, wb.zoom);

    // Sync active region
    const matchingRegion: SurveyRegion = {
      id: wb.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: wb.name,
      type: wb.type as any,
      coordinates: { lat: wb.lat, lng: wb.lng },
      zoomLevel: 8,
      depthRange: wb.depth,
      waterClarity: 'High',
      currentAnomalyCount: wb.anomaliesCount,
      description: wb.description,
    };
    setActiveRegion(matchingRegion);
  };

  // Fly to user active survey region
  const handleFlyToMySurvey = () => {
    if (activeRegion?.coordinates) {
      flyToCoordinates(activeRegion.coordinates.lat, activeRegion.coordinates.lng, 2.0);
    }
  };

  // Toggle 3D / 2D tilt
  const handleToggle2D3D = () => {
    is2DModeRef.current = !is2DModeRef.current;
    if (is2DModeRef.current) {
      targetRotationRef.current.x = 0; // flat
    } else {
      targetRotationRef.current.x = 0.35; // perspective tilt
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
        {/* Search location floating pill */}
        {showSearch && (
          <div className="relative pointer-events-auto w-72 sm:w-80">
            <div className="relative flex items-center shadow-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ocean, sea, lake..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 placeholder-slate-400 text-xs font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    setSelectedWaterBody(null);
                  }}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-100">
                {searchResults.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleSelectWaterBody(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-sky-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-sky-700">
                          {item.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                          {item.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Depth: {item.depth} • {item.anomaliesCount} targets
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Floating Actions: Layers, My Survey, 3D/2D */}
        <div className="flex items-center gap-2 pointer-events-auto ml-auto">
          {/* My Survey Button */}
          <button
            onClick={handleFlyToMySurvey}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-300 text-xs font-medium shadow-sm transition-all"
            title="Fly to active survey area"
          >
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">My Survey</span>
          </button>

          {/* Map Layers Dropdown Toggle */}
          {showLayerControls && (
            <div className="relative">
              <button
                onClick={() => setLayersOpen(!layersOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border text-xs font-medium shadow-sm transition-all ${
                  layersOpen
                    ? 'border-sky-500 text-sky-700 bg-sky-50'
                    : 'border-slate-200 text-slate-700 hover:text-sky-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Layers</span>
              </button>

              {/* Map Layers Popover Menu */}
              {layersOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/98 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-3 z-50 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-900 text-xs">Map Layers</span>
                    <button
                      onClick={() => setLayersOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {([
                    { key: 'surveyArea', label: 'Survey Area' },
                    { key: 'auvRoute', label: 'AUV Route' },
                    { key: 'anomalies', label: 'Anomalies / Targets' },
                    { key: 'bathymetry', label: 'Bathymetry (Depth)' },
                    { key: 'ecology', label: 'Ecology Zones' },
                    { key: 'marineConditions', label: 'Marine Conditions' },
                    { key: 'historicalTargets', label: 'Historical Targets' },
                  ] as const).map((layer) => (
                    <label
                      key={layer.key}
                      className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700"
                    >
                      <span>{layer.label}</span>
                      <input
                        type="checkbox"
                        checked={layers[layer.key]}
                        onChange={(e) =>
                          setLayers((prev) => ({ ...prev, [layer.key]: e.target.checked }))
                        }
                        className="rounded text-sky-600 focus:ring-sky-500 h-3.5 w-3.5"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3D / 2D Tilt Toggle */}
          <button
            onClick={handleToggle2D3D}
            className="px-2.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-sky-700 text-xs font-semibold shadow-sm transition-all"
            title="Toggle 2D / 3D tilt"
          >
            3D
          </button>
        </div>
      </div>

      {/* Main Three.js Earth Stage */}
      <div
        ref={containerRef}
        className={`w-full ${heightClass} cursor-grab active:cursor-grabbing`}
        style={{ touchAction: 'none' }}
      />

      {/* Floating Bottom-Right Navigation Controls (+, -, Reset) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-0.5 flex flex-col">
          <button
            onClick={() => {
              targetZoomRef.current = Math.max(1.6, targetZoomRef.current - 0.35);
            }}
            className="p-2 text-slate-600 hover:text-sky-700 hover:bg-slate-50 rounded-lg transition-colors"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <div className="h-px bg-slate-100" />
          <button
            onClick={() => {
              targetZoomRef.current = Math.min(4.2, targetZoomRef.current + 0.35);
            }}
            className="p-2 text-slate-600 hover:text-sky-700 hover:bg-slate-50 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => {
            targetRotationRef.current = { x: 0.25, y: 0.8 };
            targetZoomRef.current = 2.5;
            setSelectedTargetItem(null);
            setSelectedWaterBody(null);
          }}
          className="p-2 bg-white/95 backdrop-blur-md hover:bg-slate-50 text-slate-600 hover:text-sky-700 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center"
          title="Reset Globe Orientation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Small Elegant Target Information Panel (Leaves globe spacious!) */}
      {selectedTargetItem && (
        <div className="absolute bottom-4 left-4 z-20 w-80 bg-white/98 backdrop-blur-md rounded-xl border border-slate-200 p-4 shadow-xl text-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedTargetItem.riskLevel === 'Critical'
                      ? 'bg-rose-500 animate-pulse'
                      : selectedTargetItem.riskLevel === 'High'
                      ? 'bg-amber-500'
                      : 'bg-sky-500'
                  }`}
                />
                <span className="font-mono text-xs font-bold text-slate-900">
                  {selectedTargetItem.id}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  • {selectedTargetItem.classification}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedTargetItem.confidence}% Confidence • {selectedTargetItem.riskLevel} Risk
              </p>
            </div>
            <button
              onClick={() => setSelectedTargetItem(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mb-3">
            {selectedTargetItem.ecologicalImpact?.summary ?? ''}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Depth: {(selectedTargetItem.depth != null ? selectedTargetItem.depth : 0).toFixed(1)}m</span>
            <button
              onClick={() => {
                selectTarget(selectedTargetItem.id);
                setCurrentMode('targets');
              }}
              className="font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View Intelligence</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Small Water Body Reconnaissance Info Pill */}
      {selectedWaterBody && !selectedTargetItem && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-md flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <div>
            <span className="font-semibold text-slate-900 block">{selectedWaterBody.name}</span>
            <span className="text-[11px] text-slate-500">
              Depth: {selectedWaterBody.depth} • {selectedWaterBody.anomaliesCount} anomalies
            </span>
          </div>
          <button
            onClick={() => setSelectedWaterBody(null)}
            className="text-slate-400 hover:text-slate-600 ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
