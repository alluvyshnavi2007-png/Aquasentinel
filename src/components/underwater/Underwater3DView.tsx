import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Waves,
  Eye,
  Camera,
  Crosshair,
  RotateCw,
  Maximize2,
  Gauge,
  Sliders,
  ShieldAlert,
  ArrowRight,
  SunMedium,
} from 'lucide-react';
import { useMission } from '../../context/MissionContext';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export const Underwater3DView: React.FC = () => {
  const {
    anomalies,
    selectedTargetId,
    selectTarget,
    selectedTarget,
    auvState,
    setCurrentMode,
    addToCleanupMission,
    activeRegion,
  } = useMission();

  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'followAUV' | 'inspectTarget'>('orbit');
  const [waterClarity, setWaterClarity] = useState<'high' | 'turbid' | 'deepAbyss'>('high');

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // Scene & Deep Ocean Fog (light attenuation with depth)
    const scene = new THREE.Scene();
    const fogColor =
      waterClarity === 'turbid'
        ? 0x052e2b
        : waterClarity === 'deepAbyss'
        ? 0x020a14
        : 0x041b2d;
    scene.background = new THREE.Color(fogColor);
    scene.fog = new THREE.FogExp2(fogColor, 0.025);

    // Camera & Renderer
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 15, 35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Seafloor Terrain with Bathymetric Undulations
    const seafloorGeo = new THREE.PlaneGeometry(120, 120, 48, 48);
    const posAttr = seafloorGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Gentle sediment ripples and rocky outcrops
      const z =
        Math.sin(x * 0.15) * Math.cos(y * 0.15) * 1.8 +
        Math.sin(x * 0.4) * 0.4;
      posAttr.setZ(i, z);
    }
    seafloorGeo.computeVertexNormals();

    const seafloorMat = new THREE.MeshStandardMaterial({
      color: 0x0c2538,
      roughness: 0.85,
      metalness: 0.15,
      wireframe: false,
    });
    const seafloor = new THREE.Mesh(seafloorGeo, seafloorMat);
    seafloor.rotation.x = -Math.PI / 2;
    seafloor.position.y = -5;
    scene.add(seafloor);

    // Grid on seafloor for acoustic scale
    const grid = new THREE.GridHelper(120, 30, 0x0ea5e9, 0x082f49);
    grid.position.y = -4.95;
    scene.add(grid);

    // Marine Snow / Suspended Organic Particles
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 80;
      particlePos[i + 1] = Math.random() * 30 - 5;
      particlePos[i + 2] = (Math.random() - 0.5) * 80;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.25,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // AUV 3D Model Construction (Procedural Mesh)
    const auvGroup = new THREE.Group();
    auvGroup.position.set(0, 4.5, 0);

    // Main Torpedo Hull
    const hullGeo = new THREE.CylinderGeometry(0.7, 0.7, 4.2, 16);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // High visibility yellow-amber
      metalness: 0.7,
      roughness: 0.3,
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.z = Math.PI / 2;
    auvGroup.add(hull);

    // Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.7, 1.2, 16);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 2.7;
    auvGroup.add(nose);

    // Tail Fins
    const finGeo = new THREE.BoxGeometry(0.1, 1.8, 1.8);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const fins = new THREE.Mesh(finGeo, finMat);
    fins.position.x = -2.1;
    auvGroup.add(fins);

    // Sonar Beam Fan (Translucent Emissive Cone)
    const sonarBeamGeo = new THREE.ConeGeometry(12, 11, 24, 1, true);
    const sonarBeamMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const sonarBeam = new THREE.Mesh(sonarBeamGeo, sonarBeamMat);
    sonarBeam.rotation.x = Math.PI;
    sonarBeam.position.y = -5.5;
    auvGroup.add(sonarBeam);

    // AUV Beacon Light
    const auvLight = new THREE.PointLight(0x38bdf8, 3, 25);
    auvLight.position.set(0, 0, 0);
    auvGroup.add(auvLight);

    scene.add(auvGroup);

    // Add Underwater Target 3D Objects
    const targetsGroup = new THREE.Group();
    scene.add(targetsGroup);

    // Target 1: GN-001 (Ghost Net tangled on seabed)
    const netGeo = new THREE.TorusKnotGeometry(2.5, 0.6, 64, 8, 2, 3);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      wireframe: true,
      emissive: 0x450a0a,
    });
    const netMesh = new THREE.Mesh(netGeo, netMat);
    netMesh.position.set(-14, -3.2, 8);
    netMesh.userData = { id: 'GN-001', name: 'Ghost Net GN-001' };
    targetsGroup.add(netMesh);

    // Target 2: WR-002 (Shipwreck Hull)
    const wreckGeo = new THREE.BoxGeometry(16, 4, 5);
    const wreckMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.6,
      roughness: 0.5,
    });
    const wreckMesh = new THREE.Mesh(wreckGeo, wreckMat);
    wreckMesh.position.set(18, -3.0, -12);
    wreckMesh.rotation.y = 0.4;
    wreckMesh.rotation.z = -0.15;
    wreckMesh.userData = { id: 'WR-002', name: 'Shipwreck WR-002' };
    targetsGroup.add(wreckMesh);

    // Target 3: MP-004 (Metallic Pipeline)
    const pipeGeo = new THREE.CylinderGeometry(0.5, 0.5, 45, 16);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
    pipeMesh.rotation.z = Math.PI / 2;
    pipeMesh.position.set(0, -4.5, -24);
    pipeMesh.userData = { id: 'MP-004', name: 'Metallic Pipe MP-004' };
    targetsGroup.add(pipeMesh);

    // Target 4: CR-003 (Coral Reef patch)
    const coralGeo = new THREE.DodecahedronGeometry(3.5, 1);
    const coralMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.9,
    });
    const coralMesh = new THREE.Mesh(coralGeo, coralMat);
    coralMesh.position.set(-22, -3.5, -15);
    coralMesh.userData = { id: 'CR-003', name: 'Coral Reef CR-003' };
    targetsGroup.add(coralMesh);

    // Sunlight piercing water column (Caustics simulation)
    const sunLight = new THREE.DirectionalLight(0x7dd3fc, 1.8);
    sunLight.position.set(10, 40, 20);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x0369a1, 0.6);
    scene.add(ambientLight);

    // Raycaster for clicking on targets
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(targetsGroup.children);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.id) {
          selectTarget(hit.userData.id);
        }
      }
    };
    container.addEventListener('click', onClick);

    // Interactive Drag Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let cameraAngle = { theta: 0, phi: 0.35, radius: 42 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;

      cameraAngle.theta -= dx * 0.005;
      cameraAngle.phi = Math.max(0.05, Math.min(Math.PI / 2.2, cameraAngle.phi + dy * 0.005));

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // AUV Autonomous Survey Trajectory (Figure-8 swath pattern)
      const auvX = Math.sin(elapsed * 0.25) * 16;
      const auvZ = Math.sin(elapsed * 0.5) * 8;
      const nextX = Math.sin((elapsed + 0.05) * 0.25) * 16;
      const nextZ = Math.sin((elapsed + 0.05) * 0.5) * 8;

      auvGroup.position.x = auvX;
      auvGroup.position.z = auvZ;
      auvGroup.lookAt(nextX, 4.5, nextZ);

      // Pulse Sonar Beam
      sonarBeam.rotation.y = elapsed * 1.2;
      (sonarBeamMat as THREE.MeshBasicMaterial).opacity = 0.12 + Math.sin(elapsed * 4) * 0.05;

      // Drift Marine Snow downward and laterally
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.03;
        if (positions[i] < -5) positions[i] = 25;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Camera Positioning based on mode
      if (cameraMode === 'orbit') {
        camera.position.x = cameraAngle.radius * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
        camera.position.y = cameraAngle.radius * Math.cos(cameraAngle.phi);
        camera.position.z = cameraAngle.radius * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
        camera.lookAt(0, 0, 0);
      } else if (cameraMode === 'followAUV') {
        const offset = new THREE.Vector3(-8, 5, 8);
        camera.position.copy(auvGroup.position).add(offset);
        camera.lookAt(auvGroup.position);
      } else if (cameraMode === 'inspectTarget' && selectedTarget) {
        if (selectedTarget.id === 'GN-001') {
          camera.position.set(-14, 2, 18);
          camera.lookAt(-14, -3.2, 8);
        } else if (selectedTarget.id === 'WR-002') {
          camera.position.set(18, 4, -2);
          camera.lookAt(18, -3, -12);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 560;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('click', onClick);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [cameraMode, waterClarity, selectedTarget, selectTarget]);

  return (
    <div id="underwater-3d-view-container" className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-cyan-950/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              Subsea Bathymetric Simulation
            </span>
            <ProvenanceBadge type="SIMULATED PROTOTYPE DATA" size="xs" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            Interactive Underwater 3D Environment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time subsea perspective featuring AUV-01 survey trajectory, acoustic sonar cone, and seafloor anomalies.
          </p>
        </div>

        {/* Camera & Visual Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setCameraMode('orbit')}
              className={`px-2.5 py-1 rounded transition-all ${
                cameraMode === 'orbit'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Orbit Camera
            </button>
            <button
              onClick={() => setCameraMode('followAUV')}
              className={`px-2.5 py-1 rounded transition-all ${
                cameraMode === 'followAUV'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chase AUV
            </button>
            <button
              onClick={() => setCameraMode('inspectTarget')}
              className={`px-2.5 py-1 rounded transition-all ${
                cameraMode === 'inspectTarget'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inspect Target
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase px-1">Clarity:</span>
            {(['high', 'turbid', 'deepAbyss'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setWaterClarity(mode)}
                className={`px-2 py-0.5 rounded text-[11px] capitalize ${
                  waterClarity === mode ? 'bg-slate-800 text-white font-bold' : 'text-slate-500'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3D Stage + HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Stage (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-cyan-900/80 overflow-hidden relative shadow-2xl">
          {/* Top HUD overlay */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-900/80 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>AUV-01 TELEMETRY:</span>
              <span className="text-white font-bold">{(auvState?.depth != null ? auvState.depth : 46.2).toFixed(1)}m DEPTH</span>
              <span className="text-slate-400">({auvState?.heading ?? 142}° HDG)</span>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
              CLICK ANY TARGET TO INSPECT
            </div>
          </div>

          {/* Canvas Mount */}
          <div
            ref={containerRef}
            className="w-full h-[520px] cursor-grab active:cursor-grabbing"
          />

          {/* Bottom Guidance bar */}
          <div className="bg-slate-950 px-4 py-2 border-t border-cyan-950 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
            <span>Left-click &amp; drag to orbit subsea camera • Scroll to zoom</span>
            <span className="text-cyan-400">Target GN-001, WR-002, MP-004 rendered on seabed</span>
          </div>
        </div>

        {/* Selected Target Dossier Panel in 3D (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedTarget ? (
            <div className="bg-slate-900/90 border border-cyan-900/80 rounded-xl p-5 shadow-xl space-y-4 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider block">Inspecting 3D Target</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{selectedTarget.id}</h3>
                  <div className="text-xs text-slate-300">{selectedTarget.classification}</div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    selectedTarget.riskLevel === 'Critical' ? 'bg-rose-950 text-rose-300' : 'bg-cyan-950 text-cyan-300'
                  }`}
                >
                  {selectedTarget.riskLevel}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Subsea Depth:</span>
                  <strong className="text-white">{(selectedTarget.depth != null ? selectedTarget.depth : 0).toFixed(1)}m</strong>
                </div>
                <div className="flex justify-between bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Confidence:</span>
                  <strong className="text-cyan-300">{selectedTarget.confidence}%</strong>
                </div>
                <div className="flex justify-between bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Acoustic Span:</span>
                  <strong className="text-white">{selectedTarget.dimensions?.length ?? '--'}m × {selectedTarget.dimensions?.width ?? '--'}m</strong>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                {selectedTarget.ecologicalImpact.summary}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {selectedTarget.category === 'Artificial' && (
                  <button
                    onClick={() => addToCleanupMission(selectedTarget.id)}
                    className="w-full py-2.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>ASSIGN TO CLEANUP MISSION</span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentMode('targets')}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Open Full Target Dossier &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-400 font-mono text-xs">
              Click any subsea anomaly model in the 3D world to inspect target telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
