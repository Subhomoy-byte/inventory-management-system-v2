import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ConstellationField } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import { useTheme } from '../../context/ThemeContext';
import { StatusChip } from '../common/StatusChip';
import {
  Box,
  Eye,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import type { Bin, Product } from '../../types';

export interface ShelfBinData {
  id: string;
  code: string;
  zone: string;
  level: number; // 0: bottom, 1: middle, 2: top
  slot: number;  // 0, 1, 2, 3
  capacity: number;
  currentUnits: number;
  status: 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL' | 'OVERSTOCKED';
  category: string;
  items: Array<{ name: string; sku: string; qty: number }>;
}

interface InteractiveShelf3DProps {
  bins?: Bin[];
  products?: Product[];
  onSelectBin?: (binCode: string) => void;
  className?: string;
  initialZone?: string;
}

// Fallback demo data if real bins are loading
const DEFAULT_SHELF_BINS: ShelfBinData[] = [
  // Top Level (Level 2)
  {
    id: 'bin-c1',
    code: 'BIN-C1-01',
    zone: 'Zone C',
    level: 2,
    slot: 0,
    capacity: 50,
    currentUnits: 46,
    status: 'OPTIMAL',
    category: 'Electronics',
    items: [{ name: 'Industrial Gateway v4', sku: 'SKU-ELEC-01', qty: 46 }],
  },
  {
    id: 'bin-c2',
    code: 'BIN-C1-02',
    zone: 'Zone C',
    level: 2,
    slot: 1,
    capacity: 60,
    currentUnits: 58,
    status: 'OVERSTOCKED',
    category: 'Electronics',
    items: [{ name: 'Optical Barcode Scanners', sku: 'SKU-ELEC-02', qty: 58 }],
  },
  {
    id: 'bin-c3',
    code: 'BIN-C1-03',
    zone: 'Zone C',
    level: 2,
    slot: 2,
    capacity: 40,
    currentUnits: 12,
    status: 'LOW_STOCK',
    category: 'Sensors',
    items: [{ name: 'Telemetry Transceivers', sku: 'SKU-SENS-09', qty: 12 }],
  },
  {
    id: 'bin-c4',
    code: 'BIN-C1-04',
    zone: 'Zone C',
    level: 2,
    slot: 3,
    capacity: 50,
    currentUnits: 4,
    status: 'CRITICAL',
    category: 'Sensors',
    items: [{ name: 'LiDAR Docking Pods', sku: 'SKU-SENS-12', qty: 4 }],
  },

  // Middle Level (Level 1)
  {
    id: 'bin-b1',
    code: 'BIN-B1-01',
    zone: 'Zone B',
    level: 1,
    slot: 0,
    capacity: 80,
    currentUnits: 72,
    status: 'OPTIMAL',
    category: 'Fasteners',
    items: [{ name: 'Titanium Hex Bolts M8', sku: 'SKU-FAST-88', qty: 72 }],
  },
  {
    id: 'bin-b2',
    code: 'BIN-B1-02',
    zone: 'Zone B',
    level: 1,
    slot: 1,
    capacity: 100,
    currentUnits: 88,
    status: 'OPTIMAL',
    category: 'Fasteners',
    items: [{ name: 'Neoprene O-Ring Seals', sku: 'SKU-FAST-90', qty: 88 }],
  },
  {
    id: 'bin-b3',
    code: 'BIN-B1-03',
    zone: 'Zone B',
    level: 1,
    slot: 2,
    capacity: 60,
    currentUnits: 18,
    status: 'LOW_STOCK',
    category: 'Pneumatics',
    items: [{ name: 'Air Cylinder Actuators', sku: 'SKU-PNEU-04', qty: 18 }],
  },
  {
    id: 'bin-b4',
    code: 'BIN-B1-04',
    zone: 'Zone B',
    level: 1,
    slot: 3,
    capacity: 75,
    currentUnits: 70,
    status: 'OPTIMAL',
    category: 'Pneumatics',
    items: [{ name: 'Pressure Relief Valves', sku: 'SKU-PNEU-11', qty: 70 }],
  },

  // Bottom Level (Level 0)
  {
    id: 'bin-a1',
    code: 'BIN-A1-01',
    zone: 'Zone A',
    level: 0,
    slot: 0,
    capacity: 120,
    currentUnits: 115,
    status: 'OPTIMAL',
    category: 'Hydraulics',
    items: [{ name: 'Hydraulic Motor Units', sku: 'SKU-HYDR-01', qty: 115 }],
  },
  {
    id: 'bin-a2',
    code: 'BIN-A1-02',
    zone: 'Zone A',
    level: 0,
    slot: 1,
    capacity: 100,
    currentUnits: 94,
    status: 'OPTIMAL',
    category: 'Hydraulics',
    items: [{ name: 'Heavy Duty Pump Blocks', sku: 'SKU-HYDR-03', qty: 94 }],
  },
  {
    id: 'bin-a3',
    code: 'BIN-A1-03',
    zone: 'Zone A',
    level: 0,
    slot: 2,
    capacity: 80,
    currentUnits: 15,
    status: 'LOW_STOCK',
    category: 'Bearings',
    items: [{ name: 'High-Load Roller Bearings', sku: 'SKU-BEAR-22', qty: 15 }],
  },
  {
    id: 'bin-a4',
    code: 'BIN-A1-04',
    zone: 'Zone A',
    level: 0,
    slot: 3,
    capacity: 90,
    currentUnits: 2,
    status: 'CRITICAL',
    category: 'Bearings',
    items: [{ name: 'Precision Ceramic Bearings', sku: 'SKU-BEAR-99', qty: 2 }],
  },
];

export const InteractiveShelf3D: React.FC<InteractiveShelf3DProps> = ({
  bins,
  products = [],
  onSelectBin,
  className = '',
  initialZone = 'Zone B',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction State
  const [hoveredBin, setHoveredBin] = useState<ShelfBinData | null>(null);
  const [selectedBin, setSelectedBin] = useState<ShelfBinData | null>(null);
  const [glideMode, setGlideMode] = useState<'glide' | 'orbit' | 'front'>('glide');
  const [lightingPreset, setLightingPreset] = useState<'shift' | 'studio' | 'neon'>('shift');
  const [selectedZone, setSelectedZone] = useState<string>(initialZone);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPointerInside, setIsPointerInside] = useState<boolean>(false);

  // Map real bins if provided
  const shelfBins: ShelfBinData[] = React.useMemo(() => {
    if (!bins || bins.length === 0) return DEFAULT_SHELF_BINS;

    // Filter by zone if selected
    const zoneBins = bins.filter((b) => !selectedZone || b.zoneId === selectedZone || b.code.includes(selectedZone.replace('Zone ', '')));
    const displayBins = zoneBins.length >= 6 ? zoneBins : bins;

    return displayBins.slice(0, 12).map((b, idx) => {
      const binProducts = products.filter((p) => p.binLocation === b.code);
      const currentUnits = binProducts.reduce((sum, p) => sum + p.quantity, 0);
      const capacity = b.capacityQuantity || 100;
      const fillRatio = currentUnits / capacity;

      let status: 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL' | 'OVERSTOCKED' = 'OPTIMAL';
      if (fillRatio > 1.05) status = 'OVERSTOCKED';
      else if (fillRatio < 0.15) status = 'CRITICAL';
      else if (fillRatio < 0.4) status = 'LOW_STOCK';

      const level = Math.floor(idx / 4); // 0, 1, 2
      const slot = idx % 4; // 0, 1, 2, 3

      return {
        id: b.id,
        code: b.code,
        zone: b.zoneId || 'Zone A',
        level: Math.min(2, Math.max(0, level)),
        slot,
        capacity,
        currentUnits,
        status,
        category: binProducts[0]?.category || 'General Stock',
        items: binProducts.map((p) => ({ name: p.name, sku: p.sku, qty: p.quantity })),
      };
    });
  }, [bins, products, selectedZone]);

  // Ref tracking for Three.js animation loop without stale closures
  const stateRef = useRef({
    shelfBins,
    hoveredBin,
    isDark,
    glideMode,
    lightingPreset,
    mouseTarget: { x: 0, y: 0 },
    mouseCurrent: { x: 0, y: 0 },
    hoverMesh: null as THREE.Mesh | null,
    binMeshes: new Map<string, { group: THREE.Group; mesh: THREE.Mesh; data: ShelfBinData }>(),
  });

  useEffect(() => {
    stateRef.current.shelfBins = shelfBins;
    stateRef.current.hoveredBin = hoveredBin;
    stateRef.current.isDark = isDark;
    stateRef.current.glideMode = glideMode;
    stateRef.current.lightingPreset = lightingPreset;
  }, [shelfBins, hoveredBin, isDark, glideMode, lightingPreset]);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 6.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.15 : 1.05;

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(isDark ? 0x182033 : 0xf1f5f9, isDark ? 1.4 : 1.8);
    scene.add(ambientLight);

    // Directional Key Light
    const keyLight = new THREE.DirectionalLight(isDark ? 0x818cf8 : 0xffffff, isDark ? 1.8 : 2.0);
    keyLight.position.set(4, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Directional Fill / Rim Light
    const rimLight = new THREE.DirectionalLight(isDark ? 0x06b6d4 : 0x94a3b8, isDark ? 1.5 : 1.0);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    // Cursor Follower Point Light (moves in real-time with mouse arrow)
    const cursorLight = new THREE.PointLight(isDark ? 0x38bdf8 : 0x6366f1, 2.5, 7, 1.8);
    cursorLight.position.set(0, 1, 3);
    scene.add(cursorLight);

    // Dynamic Hover Spotlight (snaps to active bin)
    const hoverSpotLight = new THREE.PointLight(0xffffff, 0, 4);
    scene.add(hoverSpotLight);

    // 3. Materials
    const steelColor = isDark ? 0x242d40 : 0x64748b;
    const rackMaterial = new THREE.MeshStandardMaterial({
      color: steelColor,
      metalness: 0.88,
      roughness: 0.28,
    });

    const beamMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e293b : 0x94a3b8,
      metalness: 0.75,
      roughness: 0.35,
    });

    const deckMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0x151c2c : 0xcfd8dc,
      metalness: 0.45,
      roughness: 0.5,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0b0f17 : 0xe2e8f0,
      metalness: 0.2,
      roughness: 0.85,
    });

    // Floor Plane with subtle shadow catching
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.6;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Grid Floor Overlay
    const gridHelper = new THREE.GridHelper(14, 28, isDark ? 0x312e81 : 0x94a3b8, isDark ? 0x1e2235 : 0xe2e8f0);
    gridHelper.position.y = -1.59;
    scene.add(gridHelper);

    // 4. Build The 3D Industrial Shelf Rack
    const rackGroup = new THREE.Group();
    scene.add(rackGroup);

    const RACK_WIDTH = 4.2;
    const RACK_HEIGHT = 3.2;
    const RACK_DEPTH = 1.0;
    const LEVEL_HEIGHTS = [-1.0, 0.0, 1.0]; // Y positions for the 3 levels

    // Vertical Upright Columns (4 corner legs)
    const postGeo = new THREE.BoxGeometry(0.08, RACK_HEIGHT, 0.08);
    const halfW = RACK_WIDTH / 2;
    const halfD = RACK_DEPTH / 2;
    const postPositions = [
      [-halfW, 0, -halfD],
      [halfW, 0, -halfD],
      [-halfW, 0, halfD],
      [halfW, 0, halfD],
    ];

    postPositions.forEach(([x, y, z]) => {
      const post = new THREE.Mesh(postGeo, rackMaterial);
      post.position.set(x, y, z);
      post.castShadow = true;
      post.receiveShadow = true;
      rackGroup.add(post);
    });

    // Horizontal Beams and Shelves for each tier
    LEVEL_HEIGHTS.forEach((yPos) => {
      // Front and Back long beams
      const longBeamGeo = new THREE.BoxGeometry(RACK_WIDTH, 0.06, 0.05);
      const frontBeam = new THREE.Mesh(longBeamGeo, beamMaterial);
      frontBeam.position.set(0, yPos, halfD);
      frontBeam.castShadow = true;
      rackGroup.add(frontBeam);

      const backBeam = new THREE.Mesh(longBeamGeo, beamMaterial);
      backBeam.position.set(0, yPos, -halfD);
      backBeam.castShadow = true;
      rackGroup.add(backBeam);

      // Side short cross-beams
      const sideBeamGeo = new THREE.BoxGeometry(0.05, 0.06, RACK_DEPTH);
      const leftBeam = new THREE.Mesh(sideBeamGeo, beamMaterial);
      leftBeam.position.set(-halfW, yPos, 0);
      rackGroup.add(leftBeam);

      const rightBeam = new THREE.Mesh(sideBeamGeo, beamMaterial);
      rightBeam.position.set(halfW, yPos, 0);
      rackGroup.add(rightBeam);

      // Shelf Deck Plane (metallic mesh wire deck)
      const deckGeo = new THREE.BoxGeometry(RACK_WIDTH - 0.1, 0.02, RACK_DEPTH - 0.08);
      const deckMesh = new THREE.Mesh(deckGeo, deckMaterial);
      deckMesh.position.set(0, yPos - 0.02, 0);
      deckMesh.receiveShadow = true;
      rackGroup.add(deckMesh);
    });

    // Back Cross Braces (Industrial X-Brace)
    const braceMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x334155 : 0x64748b,
      metalness: 0.8,
      roughness: 0.4,
    });
    const braceLength = Math.sqrt(RACK_WIDTH * RACK_WIDTH + RACK_HEIGHT * RACK_HEIGHT);
    const braceGeo = new THREE.CylinderGeometry(0.015, 0.015, braceLength * 0.95);

    const brace1 = new THREE.Mesh(braceGeo, braceMat);
    brace1.position.set(0, 0, -halfD);
    brace1.rotation.z = Math.atan2(RACK_HEIGHT, RACK_WIDTH);
    rackGroup.add(brace1);

    const brace2 = new THREE.Mesh(braceGeo, braceMat);
    brace2.position.set(0, 0, -halfD);
    brace2.rotation.z = -Math.atan2(RACK_HEIGHT, RACK_WIDTH);
    rackGroup.add(brace2);

    // Overhead LED Guide Strip across top front beam
    const ledStripGeo = new THREE.BoxGeometry(RACK_WIDTH * 0.9, 0.02, 0.02);
    const ledMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x38bdf8 : 0x6366f1,
    });
    const ledStrip = new THREE.Mesh(ledStripGeo, ledMat);
    ledStrip.position.set(0, RACK_HEIGHT / 2 - 0.02, halfD + 0.02);
    rackGroup.add(ledStrip);

    // 5. Populate Storage Bins / Smart Totes
    const binMeshes = new Map<string, { group: THREE.Group; mesh: THREE.Mesh; data: ShelfBinData }>();
    stateRef.current.binMeshes = binMeshes;

    // Geometry templates
    const BIN_WIDTH = 0.82;
    const BIN_HEIGHT = 0.52;
    const BIN_DEPTH = 0.76;

    const binBoxGeo = new THREE.BoxGeometry(BIN_WIDTH, BIN_HEIGHT, BIN_DEPTH);
    const lipGeo = new THREE.BoxGeometry(BIN_WIDTH + 0.04, 0.04, BIN_DEPTH + 0.04);
    const handleGeo = new THREE.BoxGeometry(0.24, 0.06, 0.04);
    const statusLedGeo = new THREE.BoxGeometry(BIN_WIDTH * 0.7, 0.025, 0.02);

    // Status Color Helper
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'OPTIMAL': return { base: 0x10b981, emissive: 0x059669, hex: '#10B981' };
        case 'LOW_STOCK': return { base: 0xf59e0b, emissive: 0xd97706, hex: '#F59E0B' };
        case 'CRITICAL': return { base: 0xef4444, emissive: 0xdc2626, hex: '#EF4444' };
        case 'OVERSTOCKED': return { base: 0x6366f1, emissive: 0x4f46e5, hex: '#6366F1' };
        default: return { base: 0x06b6d4, emissive: 0x0891b2, hex: '#06B6D4' };
      }
    };

    shelfBins.forEach((bData) => {
      const binGroup = new THREE.Group();

      const yLevelPos = LEVEL_HEIGHTS[bData.level] + BIN_HEIGHT / 2 + 0.01;
      const xSlotPos = -RACK_WIDTH / 2 + 0.55 + bData.slot * 1.02;

      binGroup.position.set(xSlotPos, yLevelPos, 0.02);

      const statusColors = getStatusColor(bData.status);

      // Primary Tote Plastic Material with smooth sheen
      const binMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x1e293b : 0xe2e8f0,
        metalness: 0.15,
        roughness: 0.35,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
      });

      const binMesh = new THREE.Mesh(binBoxGeo, binMat);
      binMesh.castShadow = true;
      binMesh.receiveShadow = true;
      // Attach bin data directly to mesh userData for raycasting
      binMesh.userData = { binData: bData };
      binGroup.add(binMesh);

      // Tote Top Lip Rim
      const lipMesh = new THREE.Mesh(lipGeo, binMat);
      lipMesh.position.y = BIN_HEIGHT / 2 - 0.02;
      binGroup.add(lipMesh);

      // Ergonomic Front Handle Recess
      const handleMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x0f172a : 0x94a3b8,
        roughness: 0.7,
      });
      const handleMesh = new THREE.Mesh(handleGeo, handleMat);
      handleMesh.position.set(0, 0.08, BIN_DEPTH / 2 + 0.01);
      binGroup.add(handleMesh);

      // Front Smart Status Light Strip (illuminated)
      const ledIndicatorMat = new THREE.MeshStandardMaterial({
        color: statusColors.base,
        emissive: statusColors.emissive,
        emissiveIntensity: isDark ? 1.4 : 1.0,
        roughness: 0.2,
      });
      const ledMesh = new THREE.Mesh(statusLedGeo, ledIndicatorMat);
      ledMesh.position.set(0, -BIN_HEIGHT / 2 + 0.06, BIN_DEPTH / 2 + 0.015);
      binGroup.add(ledMesh);

      // Stored Units / Packages inside bin (visible payload)
      if (bData.currentUnits > 0) {
        const payloadCount = Math.min(3, Math.ceil(bData.currentUnits / 25));
        for (let i = 0; i < payloadCount; i++) {
          const pkgGeo = new THREE.BoxGeometry(0.2, 0.18, 0.22);
          const pkgMat = new THREE.MeshStandardMaterial({
            color: isDark ? 0x475569 : 0xb0bec5,
            roughness: 0.6,
          });
          const pkgMesh = new THREE.Mesh(pkgGeo, pkgMat);
          pkgMesh.position.set((i - 1) * 0.24, BIN_HEIGHT / 2 + 0.04, 0);
          pkgMesh.castShadow = true;
          binGroup.add(pkgMesh);
        }
      }

      rackGroup.add(binGroup);
      binMeshes.set(bData.id, { group: binGroup, mesh: binMesh, data: bData });
    });

    // 6. Raycasting Setup for Hover & Click
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      stateRef.current.mouseTarget.x = x;
      stateRef.current.mouseTarget.y = y;

      mouseNDC.x = x;
      mouseNDC.y = y;

      // Update Follower Cursor Light in 3D Space
      cursorLight.position.x = x * 3.5;
      cursorLight.position.y = y * 2.0 + 0.5;
      cursorLight.position.z = 2.4;

      // Raycast against all bins
      raycaster.setFromCamera(mouseNDC, camera);
      const binMeshList = Array.from(binMeshes.values()).map((v) => v.mesh);
      const intersects = raycaster.intersectObjects(binMeshList, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const hitData: ShelfBinData = hit.object.userData.binData;

        if (stateRef.current.hoverMesh !== hit.object) {
          // Reset previous hover mesh
          if (stateRef.current.hoverMesh) {
            const prevMat = stateRef.current.hoverMesh.material as THREE.MeshStandardMaterial;
            prevMat.emissive.setHex(0x000000);
            prevMat.emissiveIntensity = 0.0;
          }

          // Apply glow to newly hovered bin
          stateRef.current.hoverMesh = hit.object as THREE.Mesh;
          const targetMat = hit.object.material as THREE.MeshStandardMaterial;
          targetMat.emissive.setHex(isDark ? 0x4f46e5 : 0x6366f1);
          targetMat.emissiveIntensity = 0.75;

          // Position highlight spotlight directly above the bin
          hoverSpotLight.position.copy(hit.object.getWorldPosition(new THREE.Vector3()));
          hoverSpotLight.position.z += 0.8;
          hoverSpotLight.position.y += 0.4;
          hoverSpotLight.intensity = 3.5;

          setHoveredBin(hitData);
        }
      } else {
        if (stateRef.current.hoverMesh) {
          const prevMat = stateRef.current.hoverMesh.material as THREE.MeshStandardMaterial;
          prevMat.emissive.setHex(0x000000);
          prevMat.emissiveIntensity = 0.0;
          stateRef.current.hoverMesh = null;
          hoverSpotLight.intensity = 0;
          setHoveredBin(null);
        }
      }
    };

    const handlePointerClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouseNDC, camera);
      const binMeshList = Array.from(binMeshes.values()).map((v) => v.mesh);
      const intersects = raycaster.intersectObjects(binMeshList, false);

      if (intersects.length > 0) {
        const hitData: ShelfBinData = intersects[0].object.userData.binData;
        setSelectedBin(hitData);
        if (onSelectBin) onSelectBin(hitData.code);
      }
    };

    const handleMouseEnter = () => setIsPointerInside(true);
    const handleMouseLeave = () => {
      setIsPointerInside(false);
      stateRef.current.mouseTarget.x = 0;
      stateRef.current.mouseTarget.y = 0;
      if (stateRef.current.hoverMesh) {
        const prevMat = stateRef.current.hoverMesh.material as THREE.MeshStandardMaterial;
        prevMat.emissive.setHex(0x000000);
        prevMat.emissiveIntensity = 0.0;
        stateRef.current.hoverMesh = null;
        hoverSpotLight.intensity = 0;
        setHoveredBin(null);
      }
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('click', handlePointerClick);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 7. Dynamic Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 8. Animation Render Loop with Lerp Glide Physics
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Damped Glide Physics
      const { mouseTarget, mouseCurrent, glideMode: currentMode } = stateRef.current;

      const lerpFactor = 0.06;
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * lerpFactor;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * lerpFactor;

      if (currentMode === 'glide') {
        // Natural glide tilt and pan with mouse arrow
        const targetRotY = mouseCurrent.x * 0.42;
        const targetRotX = -mouseCurrent.y * 0.22;
        const targetPosX = mouseCurrent.x * 0.35;
        const targetPosY = -mouseCurrent.y * 0.18;

        // Subtle organic breathing oscillation
        const breathY = Math.sin(elapsedTime * 0.8) * 0.015;
        const breathRot = Math.cos(elapsedTime * 0.6) * 0.01;

        rackGroup.rotation.y = targetRotY + breathRot;
        rackGroup.rotation.x = targetRotX;
        rackGroup.position.x = targetPosX;
        rackGroup.position.y = targetPosY + breathY;
      } else if (currentMode === 'orbit') {
        // Continuous auto-orbit glide
        rackGroup.rotation.y = elapsedTime * 0.35 + mouseCurrent.x * 0.2;
        rackGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08 - mouseCurrent.y * 0.15;
      } else {
        // Front Orthogonal View
        rackGroup.rotation.set(0, 0, 0);
        rackGroup.position.set(0, 0, 0);
      }

      // Smooth Hover Bin Elevation & Lift
      binMeshes.forEach(({ group, data }) => {
        const isHovered = stateRef.current.hoveredBin?.id === data.id;
        const targetZ = isHovered ? 0.18 : 0.0;
        const targetScale = isHovered ? 1.04 : 1.0;

        group.position.z += (targetZ - group.position.z) * 0.12;
        group.scale.setScalar(group.scale.x + (targetScale - group.scale.x) * 0.12);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('click', handlePointerClick);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      renderer.dispose();
      scene.clear();
    };
  }, [shelfBins, isDark]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border transition-all duration-300 ${
        isDark
          ? 'bg-[#090D16] border-white/[0.08] shadow-2xl shadow-black/80'
          : 'bg-white border-slate-200/80 shadow-xl shadow-slate-200/60'
      } ${isFullscreen ? 'fixed inset-4 z-50 h-auto' : 'h-[520px] sm:h-[580px]'} ${className}`}
    >
      {/* Configured ThreeUI ConstellationField (Gateway Flow Variant) Backdrop */}
      <div className="shader-frame pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-85">
        <ConstellationField
          variant="gateway-flow"
          mode={isDark ? "dark" : "light"}
          speed={1.00}
          size={1.00}
          length={1.00}
          density={1.00}
          opacity={1.00}
          hue={0}
          saturation={1.00}
          brightness={1.00}
        />
      </div>

      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10 w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Top Glass Control Toolbar */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none select-none">
        {/* Left: Facility Zone Badge & Title */}
        <div
          className={`pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded-xl backdrop-blur-md border shadow-lg ${
            isDark
              ? 'bg-[#0F1524]/90 border-white/10 text-white'
              : 'bg-white/90 border-slate-200 text-slate-900'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm tracking-tight">
                3D Smart Facility Shelf
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                LIVE
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Glide mouse over bins to inspect &amp; illuminate
            </span>
          </div>
        </div>

        {/* Right: Camera Glide Modes & Zone Selector */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Glide Mode Switcher */}
          <div
            className={`flex items-center p-1 rounded-xl backdrop-blur-md border shadow-md ${
              isDark ? 'bg-[#0F1524]/90 border-white/10' : 'bg-white/90 border-slate-200'
            }`}
          >
            <button
              onClick={() => setGlideMode('glide')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                glideMode === 'glide'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              title="Mouse Parallax Glide: shelf rotates smoothly with your mouse arrow"
            >
              Glide
            </button>
            <button
              onClick={() => setGlideMode('orbit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                glideMode === 'orbit'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              title="Auto Orbit 360"
            >
              Orbit
            </button>
            <button
              onClick={() => setGlideMode('front')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                glideMode === 'front'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              title="Front View"
            >
              Front
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className={`p-2 rounded-xl backdrop-blur-md border shadow-md transition-colors ${
              isDark
                ? 'bg-[#0F1524]/90 border-white/10 text-slate-300 hover:text-white hover:bg-[#151E32]'
                : 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D View'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating HUD: Real-time Hovered Bin Inspection Card */}
      {hoveredBin && (
        <div
          className={`absolute bottom-4 left-4 z-20 max-w-sm p-4 rounded-xl backdrop-blur-xl border shadow-2xl transition-all duration-150 animate-in fade-in slide-in-from-bottom-2 ${
            isDark
              ? 'bg-[#0F1524]/95 border-indigo-500/30 text-white ring-1 ring-indigo-500/20'
              : 'bg-white/95 border-indigo-500/30 text-slate-900 ring-1 ring-indigo-500/20 shadow-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Box className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono font-bold text-sm block">
                  {hoveredBin.code}
                </span>
                <span className="text-[10px] text-slate-400">
                  Level {hoveredBin.level === 2 ? 'Top' : hoveredBin.level === 1 ? 'Mid' : 'Bottom'} &bull; Slot {hoveredBin.slot + 1}
                </span>
              </div>
            </div>
            <StatusChip status={hoveredBin.status} />
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Category</span>
              <span className="font-medium text-cyan-400">{hoveredBin.category}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Volumetric Utilization</span>
              <span className="font-mono font-bold tabular-nums">
                {hoveredBin.currentUnits} / {hoveredBin.capacity}u ({Math.round((hoveredBin.currentUnits / hoveredBin.capacity) * 100)}%)
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-700/40 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  hoveredBin.status === 'CRITICAL'
                    ? 'bg-rose-500'
                    : hoveredBin.status === 'LOW_STOCK'
                    ? 'bg-amber-500'
                    : hoveredBin.status === 'OVERSTOCKED'
                    ? 'bg-indigo-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.round((hoveredBin.currentUnits / hoveredBin.capacity) * 100))}%`,
                }}
              />
            </div>

            {hoveredBin.items.length > 0 && (
              <div className="pt-2 mt-2 border-t border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Active SKU
                </div>
                <div className="font-medium truncate text-xs">
                  {hoveredBin.items[0].name}
                </div>
                <div className="font-mono text-[10px] text-indigo-400">
                  {hoveredBin.items[0].sku} &bull; {hoveredBin.items[0].qty} in bin
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedBin(hoveredBin);
              if (onSelectBin) onSelectBin(hoveredBin.code);
            }}
            className="w-full mt-3 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
          >
            <span>Open Shelf Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Right: Interactive Hint Badge */}
      <div className="absolute bottom-4 right-4 pointer-events-none select-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md border text-[11px] font-mono text-slate-400 bg-black/40 border-white/10">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        <span>3D Raycaster Active &bull; Glides with Cursor</span>
      </div>
    </div>
  );
};
