
# World-Class Mannequin Reconstruction Plan
## Line of Judah Try-On Room

---

## Executive Summary

After a forensic analysis of the current 3D mannequin implementation, I've identified that while the fundamental architecture (8-head scale, unified proportion system, measurement flow) is now correctly structured, **the visual execution falls short of world-class standards**. The mannequin appears robotic, with visible geometric primitives, unnatural joint transitions, and a surface quality that lacks the museum-grade ceramic aesthetic the design spec requires.

This plan transforms the mannequin from "functional geometry" to "fashion industry display quality."

---

## Current State Analysis

### What's Working Well
- Unified proportion system in `measurementToProportions.ts`
- 8-head fashion scale implemented correctly (legs = 50% height)
- Measurement flow properly enables `useDetailedMeasurements`
- Gender/body type presets cover inclusive range
- Skin material with subsurface scattering for realistic tones

### Critical Visual Issues

| Problem | Location | Impact |
|---------|----------|--------|
| **Cylindrical limbs** | Arms, legs in Mannequin3D | Robot-like appearance |
| **Visible joint spheres** | Shoulder, elbow, hip, knee | Swollen, unnatural joints |
| **Segmented torso** | LatheGeometry with hard transitions | Mannequin vs sculpture |
| **Faceless head** | Simple sphere + jaw | Lacks facial suggestion |
| **Flat feet** | Capsule geometry | Unrealistic foot shape |
| **Surface uniformity** | No subtle anatomical detail | Lifeless appearance |
| **Stiff posture** | T-pose with no contrapposto | Not fashion-forward |

---

## Phase 1: Anatomical Geometry Overhaul

### 1.1 Torso Reconstruction — Sculpted Body Form

**Current:** LatheGeometry with linear interpolation produces a "vase shape"

**Target:** Anatomically contoured torso with:
- Subtle chest/pectoral definition
- Natural waist indentation
- Hip bone suggestion at pelvis
- Back curvature (slight S-spine)

**Implementation:**
```typescript
// Enhanced torso profile using cubic Bezier curves
const createSculptedTorsoProfile = (props, gender) => {
  const path = new THREE.CurvePath();
  
  // Hip curve
  path.add(new THREE.CubicBezierCurve3(
    new THREE.Vector3(props.hipWidth/2, 0, 0),        // Start at hips
    new THREE.Vector3(props.hipWidth/2 * 0.95, 0.1, 0), // Control
    new THREE.Vector3(props.waistWidth/2 * 1.02, 0.3, 0), // Control
    new THREE.Vector3(props.waistWidth/2, 0.35, 0)    // Waist point
  ));
  
  // Ribcage curve  
  path.add(new THREE.CubicBezierCurve3(
    new THREE.Vector3(props.waistWidth/2, 0.35, 0),
    new THREE.Vector3(props.waistWidth/2 * 1.05, 0.42, 0),
    new THREE.Vector3(props.chestDepth * 0.98, 0.50, 0),
    new THREE.Vector3(props.chestDepth, 0.55, 0)
  ));
  
  // Convert to LatheGeometry with higher segment count
  return new THREE.LatheGeometry(
    path.getPoints(48),  // More points = smoother
    48,                  // 48 radial segments
    0,
    Math.PI * 2
  );
};
```

### 1.2 Limb Reconstruction — Organic Tubes

**Current:** `cylinderGeometry` produces mechanical cylinders

**Target:** `TubeGeometry` with anatomical profile curves

**Implementation:**
```typescript
// Arm with natural muscle/bone curvature
const createAnatomicalArm = (armLength, armThickness) => {
  // Path follows natural arm curvature (slight S-bend)
  const armPath = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),                    // Shoulder
    new THREE.Vector3(-0.02, -armLength * 0.35, 0.01),  // Bicep outward
    new THREE.Vector3(0.01, -armLength * 0.65, -0.01),  // Forearm inward
    new THREE.Vector3(0, -armLength, 0)            // Wrist
  );

  // Custom radius function for anatomical taper
  const radiusFunction = (t) => {
    // Bicep bulge at 0.3, forearm taper
    const bicepBulge = Math.sin(t * Math.PI) * 0.012;
    const baseTaper = THREE.MathUtils.lerp(armThickness, armThickness * 0.55, t);
    return baseTaper + bicepBulge * (1 - t); // Bulge fades toward wrist
  };

  // Generate tube with variable radius
  return createVariableRadiusTube(armPath, 20, radiusFunction, 16);
};
```

### 1.3 Joint Transitions — Seamless Blends

**Current:** Overlapping spheres create visible bulges

**Target:** Smooth bezier transitions with no visible seams

**Implementation:**
```typescript
// Shoulder junction using swept bezier
const createShoulderBlend = (bodyRadius, sleeveRadius) => {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 0, 0),                    // Torso surface
    new THREE.Vector3(0.03, -0.02, 0),             // Control (smooth out)
    new THREE.Vector3(0.06, -0.05, 0)              // Arm attachment
  );
  
  // Swept geometry following curve with radius interpolation
  return new THREE.TubeGeometry(curve, 12, (t) => {
    return THREE.MathUtils.lerp(bodyRadius * 0.4, sleeveRadius, t);
  }, 16, false);
};
```

### 1.4 Head — Abstracted Fashion Mannequin

**Current:** Sphere + jaw sphere = alien appearance

**Target:** Stylized egg-form head with:
- Subtle brow ridge
- Nose suggestion (no details)
- Chin definition
- Smooth neckline transition

**Implementation:**
```typescript
const createMannequinHead = (headRadius) => {
  // Main skull - elongated egg shape
  const skullGeometry = new THREE.SphereGeometry(headRadius, 32, 24);
  
  // Morph skull to egg shape
  const positions = skullGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const scale = 1 + (y / headRadius) * 0.08; // Taller at top
    positions.setX(i, positions.getX(i) * 0.95);
    positions.setZ(i, positions.getZ(i) * 0.92);
    positions.setY(i, y * scale);
  }
  skullGeometry.computeVertexNormals();
  
  // Subtle facial plane (not features, just surface)
  const facePlane = createFacialPlane(headRadius);
  
  return { skull: skullGeometry, face: facePlane };
};

const createFacialPlane = (headRadius) => {
  // Slightly flattened front with brow suggestion
  const shape = new THREE.Shape();
  // ... egg cross-section with brow and chin points
  return new THREE.ExtrudeGeometry(shape, { depth: 0.01 });
};
```

### 1.5 Feet — Anatomical Foundation

**Current:** Capsule geometry = hot dog feet

**Target:** Proper foot form with:
- Heel definition
- Arch suggestion
- Ankle bone subtlety

**Implementation:**
```typescript
const createAnatomicalFoot = (legThickness, side) => {
  // Foot profile as bezier path
  const footPath = [
    [0, 0.03, -0.02],     // Heel back
    [0, 0.02, 0.04],      // Mid-sole
    [0, 0.01, 0.10],      // Ball of foot
    [0, 0.02, 0.13],      // Toe tip
  ];
  
  // Extruded shape with anatomical cross-section
  const footShape = new THREE.Shape();
  footShape.moveTo(-legThickness * 0.4, 0);
  footShape.quadraticCurveTo(-legThickness * 0.45, 0.015, -legThickness * 0.35, 0.025);
  // ... complete foot cross-section
  
  return new THREE.ExtrudeGeometry(footShape, {
    steps: 12,
    extrudePath: new THREE.CatmullRomCurve3(footPath.map(p => new THREE.Vector3(...p)))
  });
};
```

---

## Phase 2: Surface & Material Excellence

### 2.1 Premium Matte Ceramic Finish

**Current:** Basic MeshStandardMaterial or MeshPhysicalMaterial

**Target:** Museum-quality mannequin surface with:
- Subtle surface micro-variations
- Soft edge reflections
- Zero specular hotspots

**Implementation:**
```typescript
const PremiumMannequinMaterial = ({ skinTone, isDefaultCeramic }) => {
  // Custom matcap for controlled reflections
  const matcap = useLoader(THREE.TextureLoader, '/textures/ceramic-soft-matcap.png');
  
  if (isDefaultCeramic) {
    return (
      <meshMatcapMaterial
        matcap={matcap}
        color="#E8E4E0"  // Warm off-white
      />
    );
  }
  
  // Skin tones with subsurface scattering
  return (
    <meshPhysicalMaterial
      color={skinTone}
      roughness={0.55}
      metalness={0}
      clearcoat={0.05}
      clearcoatRoughness={0.6}
      transmission={0.08}
      thickness={0.15}
      ior={1.35}
      // Custom normal map for subtle skin texture
      normalMap={skinNormalMap}
      normalScale={[0.02, 0.02]}
    />
  );
};
```

### 2.2 Subtle Anatomical Normals

Add procedural normal variation to suggest muscle/bone structure without modeling it:

```typescript
const createAnatomyNormalMap = () => {
  // Generate subtle normal variations programmatically
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Subtle gradient variations for anatomical suggestion
  // ... procedural normal map generation
  
  return new THREE.CanvasTexture(canvas);
};
```

---

## Phase 3: Pose & Posture Refinement

### 3.1 Contrapposto — Fashion Stance

**Current:** T-pose / straight stance

**Target:** Relaxed fashion pose with:
- Slight weight shift to one leg
- Natural arm hang (not 90° out)
- Head tilt suggestion

**Implementation:**
```typescript
// Posture constants
const FASHION_POSE = {
  // Pelvis tilt
  pelvisTiltZ: 0.03,      // Slight hip drop on relaxed side
  
  // Leg stance  
  weightLeg: 'right',      // Weight-bearing leg
  relaxedLegAngle: 0.05,   // Slight bend in relaxed leg
  
  // Arm positions
  leftArmAngle: [0, 0, 0.12],   // Natural hang
  rightArmAngle: [0, 0, -0.08], // Slight variation
  
  // Head  
  headTilt: 0.02,          // Subtle tilt
};

// Apply to group transforms
<group position={[0, 0, 0]} rotation={[0, 0, FASHION_POSE.pelvisTiltZ]}>
  {/* Pelvis with weight shift */}
</group>
```

### 3.2 Breathing Animation Enhancement

**Current:** Y-scale oscillation (breathing = getting taller?!)

**Target:** Chest expansion + subtle shoulder rise

```typescript
useFrame((state) => {
  if (reducedMotion) return;
  
  const t = state.clock.getElapsedTime();
  const breathCycle = Math.sin(t * 1.2);
  
  // Chest expands forward/outward, not upward
  torsoRef.current.scale.z = 1 + breathCycle * 0.008;
  torsoRef.current.scale.x = 1 + breathCycle * 0.005;
  
  // Subtle shoulder rise
  shoulderRef.current.position.y = baseShoulderY + breathCycle * 0.002;
});
```

---

## Phase 4: Performance Optimization

### 4.1 Geometry Instancing & Merging

```typescript
// Merge static body parts into single geometry
const mergedBodyGeometry = useMemo(() => {
  const merged = BufferGeometryUtils.mergeBufferGeometries([
    torsoGeometry,
    pelvisGeometry,
    neckGeometry,
    headGeometry,
  ]);
  return merged;
}, [proportions]);

// Single mesh draw call for body core
<mesh geometry={mergedBodyGeometry}>
  <SkinMaterial skinTone={skinTone} />
</mesh>
```

### 4.2 LOD (Level of Detail) for Mobile

```typescript
// Reduce segment counts on mobile
const LOD_SETTINGS = {
  desktop: { torsoSegments: 48, limbSegments: 24 },
  mobile: { torsoSegments: 24, limbSegments: 12 },
};

const settings = isMobile ? LOD_SETTINGS.mobile : LOD_SETTINGS.desktop;
```

### 4.3 Memoization & Dependency Optimization

```typescript
// Already good, but ensure all geometry creates are memoized
const torsoGeometry = useMemo(
  () => createSculptedTorso(proportions, gender),
  [proportions.height, proportions.waistWidth, proportions.chestDepth, gender]
);
```

---

## Phase 5: Garment Alignment Verification

After mannequin changes, verify garment positions:

| Garment | Anchor Point | Expected Y |
|---------|--------------|------------|
| Hoodie/Crewneck/Tshirt | Chest center | 1.15 (chest line - offset) |
| Pants/Shorts | Hip line | 0.875 (crotch line) |
| Beanie | Head top | 1.70 |
| Sneakers | Ground | 0.00 |

Adjust garment geometry files if mannequin silhouette changes.

---

## Implementation File Changes

| File | Changes |
|------|---------|
| `src/components/try-on/Mannequin3D.tsx` | Complete geometry overhaul: sculpted torso, anatomical limbs, bezier joints, fashion head, proper feet, pose system, enhanced breathing |
| `src/components/try-on/utils/measurementToProportions.ts` | Add pose configuration constants |
| `src/components/try-on/garments/HoodieGeometry.tsx` | Verify Y alignment after mannequin changes |
| `src/components/try-on/garments/PantsGeometry.tsx` | Verify Y alignment after mannequin changes |
| `public/textures/` | Add ceramic matcap texture (optional) |

---

## Success Criteria

After implementation, the mannequin must:

1. **Look human at first glance** — No visible geometric primitives
2. **Have smooth joint transitions** — No spheres, no gaps, no bulges
3. **Stand like a fashion model** — Subtle contrapposto, confident stance
4. **Breathe naturally** — Chest expansion, not height oscillation
5. **Render with premium materials** — Museum ceramic or realistic skin
6. **Morph smoothly** — Body type changes without jarring
7. **Maintain garment fit** — All equipped items align correctly
8. **Perform excellently** — <2s load, 30+ FPS on mobile

---

## Technical Dependencies

- **three.js** (already installed via @react-three/fiber)
- **BufferGeometryUtils** from three/addons (for geometry merging)
- Optional: Matcap texture file for premium ceramic finish

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1: Geometry Overhaul | ~400 lines |
| Phase 2: Materials | ~50 lines |
| Phase 3: Pose/Animation | ~80 lines |
| Phase 4: Performance | ~40 lines |
| Phase 5: Garment Verification | ~20 lines |
| **Total** | ~590 lines (net change) |
