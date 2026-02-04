

# Fix Plan: Mannequin 3D Model Reconstruction

## Problem Diagnosis

After analyzing the current `Mannequin3D.tsx` implementation, the mannequin appears "completely messed up" due to **fundamental positioning and geometry errors**:

### Root Cause Analysis

| Body Part | Current Position (Y) | Actual End Position | Gap to Next Part |
|-----------|---------------------|---------------------|------------------|
| Head | 1.72 | ~1.63 (bottom of sphere) | 0.05 to neck |
| Neck | 1.58 | ~1.52 (bottom) | GAP: ~0.25 to torso top |
| Torso | 1.22 base, lathe 0.55→0 | Top: 1.77, Bottom: 1.22 | GAP: ~0.55 to legs |
| Arms | 1.38 | Extends down | Misaligned with shoulders |
| Legs | 0.67 | Extends down to ~-0.13 | Massive gap from torso |

**The torso geometry is inverted!** The LatheGeometry creates points from `y: 0.55` (top) to `y: 0` (bottom), but when positioned at `y: 1.22`, the torso ends at 1.22 instead of going down to the hips. This leaves a **0.55-unit gap** between torso bottom (1.22) and leg tops (0.67).

### Visual Symptoms
1. **Floating torso** - Not connected to legs
2. **Arms floating** - Shoulder attachment Y misaligned  
3. **Head/neck floating** - Disconnected from torso top
4. **Limbs as separate cylinders** - No anatomical connection
5. **Robot-like appearance** - Primitive shapes not blended

---

## Solution Architecture

### Phase 1: Fix Core Geometry Positioning

**Goal:** Create a continuous, anatomically-correct mannequin from head to toe.

#### 1.1 Recalculate Body Segment Positions

```
TARGET VERTICAL LAYOUT (Y-axis, from ground up):
─────────────────────────────────────────────────
Feet:     Y = 0.00 → 0.05     (on ground)
Calves:   Y = 0.05 → 0.42     (37cm)
Thighs:   Y = 0.42 → 0.84     (42cm)  
Pelvis:   Y = 0.84 → 0.95     (hip joint)
Torso:    Y = 0.95 → 1.50     (55cm torso)
Shoulders: Y = 1.40 → 1.52    (shoulder line)
Neck:     Y = 1.52 → 1.62     (10cm)
Head:     Y = 1.62 → 1.80     (18cm)
─────────────────────────────────────────────────
TOTAL HEIGHT: ~1.75m (realistic male average)
```

#### 1.2 Fix Torso LatheGeometry Direction

Current code creates points going UP (0.55 → 0), but positions the mesh too high. The fix:
- Create torso from **hip level to shoulder level**
- Use consistent coordinate system
- Ensure smooth transitions at joints

#### 1.3 Connect Limbs to Torso Seamlessly

- Arms attach at shoulder height (Y ~1.45)
- Legs attach at hip height (Y ~0.85)
- Use overlapping geometry at joints to prevent gaps

---

### Phase 2: Premium Mannequin Aesthetics

Based on the design document requirements:

#### 2.1 Material Upgrade
```typescript
// Current: meshPhysicalMaterial with clearcoat
// Target: Matte ceramic/plaster museum-quality finish
<meshStandardMaterial
  color={skinTone}
  roughness={0.75}        // More matte
  metalness={0.0}         // No metal
  envMapIntensity={0.2}   // Subtle reflections only
/>
```

#### 2.2 Anatomical Proportions (8-Head Fashion Scale)
- Total height divided into 8 equal head units
- Shoulder width: 2 head-widths for male, 1.75 for female
- Hip width: 1.5 head-widths for male, 2 for female
- Leg length: 4 head-units (50% of total height)

#### 2.3 Smooth Joint Transitions
- Replace cylinder-cylinder connections with **tube geometries** using bezier curves
- Add subtle joint spheres at elbows, knees, shoulders, hips
- Create continuous silhouette without visible seams

---

### Phase 3: Implementation Details

#### File: `src/components/try-on/Mannequin3D.tsx`

**Complete Rewrite Required** — The current geometry calculations are fundamentally broken.

##### Key Fixes:

1. **Unified Coordinate System**
   - All parts use same origin (ground level at Y=0)
   - Clear documentation of each segment's Y-range

2. **Anatomically-Correct Torso**
```typescript
// Create torso from hips to shoulders
const createTorsoGeometry = (proportions) => {
  const points: THREE.Vector2[] = [];
  const segments = 32;
  
  // Bottom (hips) at Y=0, Top (shoulders) at Y=0.55
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let radius: number;
    
    if (t < 0.15) {
      // Hip to waist (narrowing)
      radius = lerp(proportions.hipWidth / 2, proportions.waistWidth / 2, t / 0.15);
    } else if (t < 0.6) {
      // Waist to chest (expanding)
      radius = lerp(proportions.waistWidth / 2, proportions.chestDepth, (t - 0.15) / 0.45);
    } else {
      // Chest to shoulders
      radius = lerp(proportions.chestDepth, proportions.shoulderWidth / 2, (t - 0.6) / 0.4);
    }
    
    // Y goes from 0 (hips) to 0.55 (shoulders)
    const y = t * 0.55;
    points.push(new THREE.Vector2(radius, y));
  }
  
  return new THREE.LatheGeometry(points, 40);
};
```

3. **Correct Positioning**
```typescript
// Position torso so hips are at hip level
<mesh position={[0, 0.85, 0]} geometry={torsoGeometry}>
```

4. **Limb Attachment Points**
```typescript
// Arms attach at shoulder level
<Arm position={[±shoulderX, 1.45, 0]} />

// Legs attach at hip level  
<Leg position={[±0.10, 0.85, 0]} />
```

5. **Joint Spheres for Smooth Transitions**
```typescript
// Shoulder joints
<mesh position={[shoulderX, 1.45, 0]}>
  <sphereGeometry args={[armThickness * 1.1, 16, 16]} />
</mesh>

// Hip joints
<mesh position={[0.10, 0.85, 0]}>
  <sphereGeometry args={[legThickness * 1.1, 16, 16]} />
</mesh>

// Elbow and knee joints
// ... similar sphere additions
```

---

### Phase 4: Body Type Morphing

Ensure proportions change smoothly when user adjusts:
- Gender toggle
- Body type presets (slim/athletic/average/curvy)
- Detailed measurements

```typescript
const proportions = useMemo(() => {
  return getBodyProportions(avatarBodyType, avatarGender, measurements, useDetailedMeasurements);
}, [avatarBodyType, avatarGender, measurements, useDetailedMeasurements]);

// All body parts receive proportions and scale accordingly
```

---

## Implementation Checklist

### Immediate Fixes (Critical)
- [ ] Fix torso Y-position to connect with legs
- [ ] Fix arm Y-position to align with shoulders
- [ ] Fix head/neck Y-position to connect with torso top
- [ ] Add joint spheres at all connection points

### Visual Quality
- [ ] Apply matte ceramic material preset
- [ ] Add 8-head proportion calculations
- [ ] Smooth silhouette with bezier tube limbs

### Integration
- [ ] Verify garment layers still align (HoodieGeometry, PantsGeometry)
- [ ] Test all body type presets
- [ ] Verify height scaling works correctly
- [ ] Test measurement-based proportions

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/try-on/Mannequin3D.tsx` | Complete rewrite of geometry positioning |
| `src/components/try-on/Avatar3D.tsx` | Remove duplicate breathing animation (already in Mannequin3D) |

## Files Unchanged (Verify Alignment)

| File | Verification |
|------|--------------|
| `src/components/try-on/garments/HoodieGeometry.tsx` | Position `[0, 1.22, 0]` — may need adjustment |
| `src/components/try-on/garments/PantsGeometry.tsx` | Position `[0, 0.67, 0]` — may need adjustment |
| All other garment geometries | Check Y-positions match new mannequin |

---

## Expected Outcome

After implementation:
1. **Continuous human form** — No gaps between body segments
2. **Natural proportions** — 8-head fashion scale
3. **Smooth joints** — Spheres at shoulders, hips, elbows, knees
4. **Premium aesthetic** — Matte ceramic museum mannequin appearance
5. **Proper scaling** — Height/body type changes work seamlessly
6. **Garment alignment** — Clothes fit correctly on the fixed body

---

## Technical Notes

### Y-Coordinate Reference (Final)
```
Ground:    0.00
Ankles:    0.08
Knees:     0.45
Hips:      0.85
Waist:     1.05
Chest:     1.25
Shoulders: 1.45
Neck base: 1.52
Chin:      1.62
Head top:  1.80
```

### Garment Alignment (Update After Mannequin Fix)
- **Tops (hoodie/crewneck/tshirt):** Position Y = ~1.22 (covers chest to hips)
- **Bottoms (pants/shorts):** Position Y = ~0.85 (starts at hips)
- **Footwear:** Position Y = 0.08 (at ankles)
- **Headwear:** Position Y = ~1.75 (on head)

