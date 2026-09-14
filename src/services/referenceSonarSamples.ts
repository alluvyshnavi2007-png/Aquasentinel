// Procedural generator for authentic side-scan sonar reference imagery
// Produces distinct acoustic waterfall representations with seafloor sand ripples,
// specular target highlights, and elongated acoustic shadows for the 6 canonical targets.

export interface SonarReferenceSample {
  id: string;
  name: string;
  fileName: string;
  label: string;
  category: 'Aircraft Wreck' | 'Human Remains' | 'Coral Reef' | 'Ghost Net' | 'Metallic Object' | 'Shipwreck';
  icon: string;
  accentColor: string;
  description: string;
  generateImageDataUrl: () => string;
}

function createAcousticCanvas(width = 400, height = 300): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Base Seabed Acoustic Backscatter (Textured copper/amber acoustic tone)
  ctx.fillStyle = '#1e140a';
  ctx.fillRect(0, 0, width, height);

  // 2. Sand Ripple Waves (Periodic acoustic backscatter ridges)
  ctx.strokeStyle = '#3d2814';
  ctx.lineWidth = 1.5;
  for (let y = 10; y < height; y += 8) {
    ctx.beginPath();
    for (let x = 0; x < width; x += 15) {
      const ny = y + Math.sin(x * 0.04 + y * 0.1) * 3 + (Math.random() - 0.5) * 2;
      if (x === 0) ctx.moveTo(x, ny);
      else ctx.lineTo(x, ny);
    }
    ctx.stroke();
  }

  // 3. Acoustic speckle noise
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 25;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.6));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.2));
  }
  ctx.putImageData(imgData, 0, 0);

  return [canvas, ctx];
}

export const SONAR_REFERENCE_SAMPLES: SonarReferenceSample[] = [
  // 1. Aircraft Wreck (aircraft wreck.PNG)
  {
    id: 'sample-aircraft',
    name: 'Aircraft Wreck',
    fileName: 'aircraft wreck.PNG',
    label: 'Aircraft Wreck Anomaly',
    category: 'Aircraft Wreck',
    icon: 'Plane',
    accentColor: '#38bdf8',
    description: 'Cruciform airframe with central fuselage, swept wings, and detached empennage shadow.',
    generateImageDataUrl: () => {
      const [canvas, ctx] = createAcousticCanvas(420, 320);
      const cx = 200, cy = 160;

      // Acoustic Shadow cast to the right
      ctx.fillStyle = '#050302';
      ctx.beginPath();
      // Fuselage shadow
      ctx.fillRect(cx + 35, cy - 12, 110, 24);
      // Wing shadow
      ctx.fillRect(cx + 45, cy - 80, 50, 160);
      // Detached tail shadow top-right
      ctx.fillRect(cx + 120, cy - 100, 45, 35);
      ctx.fill();

      // High Specular Metallic Airframe Highlights (Bright amber/white)
      ctx.fillStyle = '#ffeedd';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;

      // Fuselage
      ctx.beginPath();
      ctx.ellipse(cx, cy, 75, 14, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Swept Wings
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 90);
      ctx.lineTo(cx + 15, cy - 90);
      ctx.lineTo(cx + 10, cy + 90);
      ctx.lineTo(cx - 15, cy + 90);
      ctx.closePath();
      ctx.fill();

      // Detached Tail Section at top-right
      ctx.beginPath();
      ctx.ellipse(cx + 90, cy - 90, 28, 12, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      return canvas.toDataURL('image/png');
    },
  },

  // 2. Human Remains (deadbody.PNG)
  {
    id: 'sample-human-remains',
    name: 'Human Remains',
    fileName: 'deadbody.PNG',
    label: 'Human Remains / Possible Human Form',
    category: 'Human Remains',
    icon: 'User',
    accentColor: '#a855f7',
    description: 'Recumbent prone humanoid silhouette with anthropomorphic limb/torso acoustic shadow.',
    generateImageDataUrl: () => {
      const [canvas, ctx] = createAcousticCanvas(420, 320);
      const cx = 200, cy = 160;

      // Acoustic Shadow (Soft organic shadow behind prone body)
      ctx.fillStyle = '#060403';
      ctx.beginPath();
      // Head shadow
      ctx.ellipse(cx - 50, cy + 18, 14, 18, 0.2, 0, Math.PI * 2);
      // Torso shadow
      ctx.ellipse(cx, cy + 22, 35, 20, 0, 0, Math.PI * 2);
      // Lower limbs shadow
      ctx.ellipse(cx + 55, cy + 25, 28, 14, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Organic Acoustic Highlight (Soft textile/tissue backscatter, not harsh metallic)
      ctx.fillStyle = '#d4af88';
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 4;

      // Head
      ctx.beginPath();
      ctx.arc(cx - 48, cy, 10, 0, Math.PI * 2);
      ctx.fill();

      // Shoulders & Torso
      ctx.beginPath();
      ctx.ellipse(cx, cy, 32, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Left & Right Arms resting forward
      ctx.beginPath();
      ctx.ellipse(cx - 30, cy - 12, 18, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - 30, cy + 12, 18, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Legs / Lower body
      ctx.beginPath();
      ctx.ellipse(cx + 45, cy - 5, 25, 6, 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 45, cy + 5, 25, 6, -0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      return canvas.toDataURL('image/png');
    },
  },

  // 3. Coral Reefs (coral reefs.PNG)
  {
    id: 'sample-coral-reefs',
    name: 'Coral Reefs',
    fileName: 'coral reefs.PNG',
    label: 'Coral Reefs Biogenic Sanctuary',
    category: 'Coral Reef',
    icon: 'TreePine',
    accentColor: '#10b981',
    description: 'Heterogeneous multi-cluster biogenic coral heads with organic fractal boundaries across sand bed.',
    generateImageDataUrl: () => {
      const [canvas, ctx] = createAcousticCanvas(420, 320);

      // Clustered coral reef colonies
      const centers = [
        { x: 130, y: 110, r: 40 },
        { x: 250, y: 130, r: 55 },
        { x: 180, y: 210, r: 48 },
        { x: 310, y: 220, r: 35 },
      ];

      // Multi-micro shadows
      ctx.fillStyle = '#050302';
      centers.forEach((c) => {
        ctx.beginPath();
        ctx.ellipse(c.x + 22, c.y + 12, c.r * 1.1, c.r * 0.8, 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Biogenic High-Frequency Specular Clusters
      ctx.fillStyle = '#e6c280';
      centers.forEach((c) => {
        for (let i = 0; i < 35; i++) {
          const ang = Math.random() * Math.PI * 2;
          const dist = Math.random() * c.r;
          const px = c.x + Math.cos(ang) * dist;
          const py = c.y + Math.sin(ang) * dist;
          ctx.beginPath();
          ctx.arc(px, py, 2 + Math.random() * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      return canvas.toDataURL('image/png');
    },
  },

  // 4. Ghost Fishing Net (fishing net.PNG)
  {
    id: 'sample-fishing-net',
    name: 'Ghost Fishing Net',
    fileName: 'fishing net.PNG',
    label: 'Ghost Fishing Net Hazard',
    category: 'Ghost Net',
    icon: 'AlertTriangle',
    accentColor: '#f43f5e',
    description: 'Tangled polyamide monofilament mesh trailing diagonally across sand with sinker weights and floats.',
    generateImageDataUrl: () => {
      const [canvas, ctx] = createAcousticCanvas(420, 320);

      // Acoustic Shadow along wavy path
      ctx.strokeStyle = '#050302';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(70, 60);
      ctx.bezierCurveTo(160, 100, 240, 220, 360, 260);
      ctx.stroke();

      // Tangled filament mesh highlight
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 3;

      // Main groundline
      ctx.beginPath();
      ctx.moveTo(50, 45);
      ctx.bezierCurveTo(140, 85, 220, 205, 340, 245);
      ctx.stroke();

      // Tangled loops and mesh folds
      for (let i = 0; i < 18; i++) {
        const t = i / 18;
        const x = 50 + t * 290 + (Math.random() - 0.5) * 20;
        const y = 45 + t * 200 + (Math.random() - 0.5) * 25;
        ctx.beginPath();
        ctx.arc(x, y, 6 + Math.random() * 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      return canvas.toDataURL('image/png');
    },
  },

  // 5. Metallic Pipe (metal pipe.PNG)
  {
    id: 'sample-metal-pipe',
    name: 'Metallic Pipe',
    fileName: 'metal pipe.PNG',
    label: 'Metallic Object / Subsea Pipeline',
    category: 'Metallic Object',
    icon: 'Cylinder',
    accentColor: '#f59e0b',
    description: 'Long continuous high-specular linear pipeline cutting diagonally with uniform parallel acoustic shadow.',
    generateImageDataUrl: () => {
      const [canvas, ctx] = createAcousticCanvas(420, 320);

      // Parallel Acoustic Shadow
      ctx.strokeStyle = '#040201';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(40, 290);
      ctx.lineTo(390, 40);
      ctx.stroke();

      // Continuous Linear Metallic Highlight (R² > 0.95)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(25, 275);
      ctx.lineTo(375, 25);
      ctx.stroke();

      // Flanged Joint collars along the conduit
      ctx.fillStyle = '#ffffff';
      [0.2, 0.45, 0.7, 0.9].forEach((t) => {
        const x = 25 + t * 350;
        const y = 275 - t * 250;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      return canvas.toDataURL('image/png');
    },
  },

  // 6. Shipwreck (shipwreck.PNG)
  {
    id: 'sample-shipwreck',
    name: 'Shipwreck',
    fileName: 'shipwreck.PNG',
    label: 'Shipwreck Anomaly',
    category: 'Shipwreck',
    icon: 'Anchor',
    accentColor: '#3b82f6',
    description: 'Cohesive oval hull perimeter with high-reflectivity gunwale edges, deck frame ribs, and deep hold shadow.',
    generateImageDataUrl: () => {
      const [canvas, ctx] = createAcousticCanvas(420, 320);
      const cx = 200, cy = 160;

      // Deep Hollow Hull Basin Shadow
      ctx.fillStyle = '#040201';
      ctx.beginPath();
      ctx.ellipse(cx + 30, cy + 15, 80, 42, 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Specular Gunwale Outline (Sunken vessel hull)
      ctx.strokeStyle = '#ffedd5';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 6;

      ctx.beginPath();
      // Pointed Bow
      ctx.moveTo(cx - 95, cy - 30);
      // Starboard gunwale
      ctx.quadraticCurveTo(cx, cy - 45, cx + 90, cy + 5);
      // Transom Stern
      ctx.lineTo(cx + 80, cy + 40);
      // Port gunwale
      ctx.quadraticCurveTo(cx, cy + 25, cx - 95, cy - 30);
      ctx.closePath();
      ctx.stroke();

      // Internal Bulkheads / Frame Rib Shadows
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 2.5;
      for (let i = -50; i <= 60; i += 22) {
        ctx.beginPath();
        ctx.moveTo(cx + i - 10, cy - 25);
        ctx.lineTo(cx + i + 8, cy + 20);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      return canvas.toDataURL('image/png');
    },
  },
];
