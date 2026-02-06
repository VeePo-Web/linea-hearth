
# Create My Avatar: Realistic Human Avatar System
## World-Class Virtual Try-On with Photorealistic Avatars

---

## Executive Summary

This plan transforms the current abstract ceramic mannequin into a **photorealistic human avatar system** inspired by Viubox, Ready Player Me, and industry leaders like BODS and 3DLOOK. Users will be able to create personalized avatars that look like real humans, complete with facial features, realistic skin, hair, and body proportions that match their measurements.

The goal is to make users see **themselves** in the clothing, not an abstract figure.

---

## Part 1: Architecture Overview

### Current State
```
TryOnRoom.tsx
    └── TryOnProvider (state management)
        └── TryOnCanvas.tsx
            └── Avatar3D.tsx
                └── Mannequin3D.tsx (abstract ceramic mannequin)
                └── GarmentLayer.tsx (5 slots)
```

### Target State
```
TryOnRoom.tsx
    └── TryOnProvider (enhanced state with avatar config)
        └── AvatarCreationFlow.tsx (NEW - wizard for avatar creation)
        │   ├── Step 1: Method Selection (Photo/Measurements/Model Library)
        │   ├── Step 2: Body Configuration
        │   ├── Step 3: Face & Hair
        │   └── Step 4: Preview & Save
        │
        └── TryOnCanvas.tsx
            └── RealisticAvatar.tsx (NEW - replaces Mannequin3D)
                ├── AvatarBody.tsx (realistic human mesh)
                ├── AvatarFace.tsx (parametric face with features)
                ├── AvatarHair.tsx (hair style options)
                └── GarmentLayer.tsx (unchanged)
```

---

## Part 2: Avatar Creation Wizard (AvatarCreationFlow)

### 2.1 Entry Point & Trigger

Add a "Create My Avatar" CTA in the sidebar when no custom avatar exists:

```typescript
// In TryOnSidebar.tsx - new section at top
{!hasCustomAvatar && (
  <AvatarCreationCTA 
    onStart={() => setShowAvatarWizard(true)}
  />
)}
```

Visual Design:
- Premium card with gradient border
- Human silhouette icon with sparkle
- "Create My Avatar" primary CTA
- "Quick Start" secondary option (skip to presets)

### 2.2 Step 1: Method Selection

Three creation methods (like Viubox/BODS):

| Method | Description | Effort | Accuracy |
|--------|-------------|--------|----------|
| **Photo Scan** | Upload 2 photos → AI generates measurements | Low | High |
| **Manual Input** | Enter height/weight/measurements → parametric body | Medium | Very High |
| **Model Library** | Choose from 12 diverse pre-made avatars | Instant | Approximate |

#### Photo Scan Flow (Future Enhancement - Phase 2)
- Frontend: Camera capture UI with pose guide overlay
- Backend: Edge function calling AI body estimation API
- Note: Mark as "Coming Soon" in Phase 1

#### Manual Input Flow (Phase 1 Focus)
- Already have BodyMeasurementsPanel
- Enhance with visual body silhouette that morphs in real-time
- Add arm length, shoulder width, torso length sliders

#### Model Library Flow
- Grid of 12 diverse pre-made avatars
- Male/Female, various body types, heights, skin tones
- Click to instantly apply

### 2.3 Step 2: Body Configuration

Enhanced measurement panel with visual feedback:

```typescript
interface AvatarBodyConfig {
  // Physical measurements
  heightCm: number;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  inseamCm: number;
  
  // NEW: Extended measurements for realistic avatar
  shoulderWidthCm: number;
  armLengthCm: number;
  neckCircumferenceCm: number;
  torsoLengthCm: number;
  
  // Body proportions
  bodyType: 'ectomorph' | 'mesomorph' | 'endomorph';
  muscleDefinition: 0-100; // Slider
  
  // Appearance
  gender: 'male' | 'female' | 'non-binary';
  skinTone: string; // Extended palette of 20 tones
}
```

UI Components:
- Interactive body silhouette with measurement callouts
- Drag handles on silhouette to adjust proportions
- Real-time 3D preview updating as sliders move

### 2.4 Step 3: Face & Hair Customization

Parametric face system with sliders:

```typescript
interface AvatarFaceConfig {
  // Face shape
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'oblong';
  jawWidth: 0-100;
  cheekboneHeight: 0-100;
  foreheadHeight: 0-100;
  chinLength: 0-100;
  
  // Features (subtle parametric adjustments)
  eyeSize: 0-100;
  noseWidth: 0-100;
  lipFullness: 0-100;
  
  // Presentation
  facialHair: 'none' | 'stubble' | 'beard' | 'goatee'; // Male options
  hasGlasses: boolean;
  glassesStyle: 'round' | 'square' | 'aviator' | 'cat-eye';
}

interface AvatarHairConfig {
  style: 'bald' | 'buzz' | 'short' | 'medium' | 'long' | 'ponytail' | 'braids' | 'afro' | 'curly';
  color: string; // 15 natural + 5 fashion colors
  hairline: 'full' | 'receding' | 'widows-peak';
}
```

UI Design:
- Face preview window (zoomed on head)
- Slider groups: Shape → Features → Style
- Hair style picker as visual tiles
- Color picker with presets

### 2.5 Step 4: Preview & Save

Full-body 3D preview with:
- 360° orbit viewing
- Lighting mode toggle (studio/natural)
- "How clothes will look" demo with sample outfit
- Name your avatar input
- Save to profile (localStorage + optional backend sync)

---

## Part 3: Realistic Avatar 3D Implementation

### 3.1 Replace Mannequin3D with RealisticAvatar

The key difference from the current mannequin:

| Aspect | Mannequin3D (Current) | RealisticAvatar (New) |
|--------|----------------------|----------------------|
| Surface | Ceramic/plaster matte | Realistic skin with SSS |
| Face | Abstracted egg shape | Parametric human features |
| Body | Stylized 8-head fashion | Anatomically accurate |
| Hair | None | Multiple hair styles |
| Joints | Smooth bezier transitions | Realistic joint articulation |
| Pose | Fashion contrapposto | Multiple pose options |

### 3.2 Avatar Body Mesh Architecture

```typescript
// RealisticAvatar.tsx
export const RealisticAvatar = ({ avatarConfig, position }: RealisticAvatarProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Body mesh with morphable proportions
  const bodyMesh = useMemo(() => 
    createRealisticBodyMesh(avatarConfig),
    [avatarConfig.bodyConfig]
  );
  
  // Face with parametric features
  const faceMesh = useMemo(() =>
    createParametricFace(avatarConfig.faceConfig),
    [avatarConfig.faceConfig]
  );
  
  // Hair geometry
  const hairMesh = useMemo(() =>
    createHairGeometry(avatarConfig.hairConfig),
    [avatarConfig.hairConfig]
  );

  return (
    <group ref={groupRef} position={position}>
      {/* Realistic body */}
      <mesh geometry={bodyMesh}>
        <RealisticSkinMaterial skinTone={avatarConfig.skinTone} />
      </mesh>
      
      {/* Face layer */}
      <mesh geometry={faceMesh} position={[0, headY, 0]}>
        <RealisticSkinMaterial skinTone={avatarConfig.skinTone} />
      </mesh>
      
      {/* Hair */}
      <mesh geometry={hairMesh} position={[0, headY, 0]}>
        <HairMaterial color={avatarConfig.hairConfig.color} />
      </mesh>
      
      {/* Eyes (stylized but human-like) */}
      <AvatarEyes faceConfig={avatarConfig.faceConfig} />
      
      {/* Eyebrows */}
      <AvatarEyebrows hairColor={avatarConfig.hairConfig.color} />
    </group>
  );
};
```

### 3.3 Realistic Skin Material

Upgrade from basic meshPhysicalMaterial to cinema-quality skin:

```typescript
const RealisticSkinMaterial = ({ skinTone }: { skinTone: string }) => {
  // Skin shader with subsurface scattering
  return (
    <meshPhysicalMaterial
      color={skinTone}
      roughness={0.45}
      metalness={0}
      transmission={0.12}
      thickness={0.25}
      ior={1.38}
      clearcoat={0.08}
      clearcoatRoughness={0.5}
      sheen={0.15}
      sheenRoughness={0.5}
      sheenColor="#FFE4C4"
    />
  );
};
```

### 3.4 Hair System

Multiple hair styles as pre-modeled geometries:

```typescript
const HAIR_STYLES = {
  buzz: { geometry: 'hair_buzz.glb', offset: [0, 0, 0] },
  short: { geometry: 'hair_short.glb', offset: [0, 0.02, 0] },
  medium: { geometry: 'hair_medium.glb', offset: [0, 0.01, 0] },
  long: { geometry: 'hair_long.glb', offset: [0, 0, 0] },
  ponytail: { geometry: 'hair_ponytail.glb', offset: [0, 0, 0] },
  braids: { geometry: 'hair_braids.glb', offset: [0, 0, 0] },
  afro: { geometry: 'hair_afro.glb', offset: [0, 0.03, 0] },
  curly: { geometry: 'hair_curly.glb', offset: [0, 0.01, 0] },
};

// For Phase 1: Procedural hair approximation
const createProceduralHair = (style: string, color: string) => {
  // Use sphere/cone primitives to approximate hair silhouettes
  // Full GLB models can be added in Phase 2
};
```

### 3.5 Parametric Face System

Face built from morphable base mesh:

```typescript
const createParametricFace = (config: AvatarFaceConfig) => {
  // Start with base head sphere
  const headGeometry = new THREE.SphereGeometry(0.11, 64, 48);
  const positions = headGeometry.attributes.position;
  
  // Apply face shape morphs
  applyFaceShapeMorph(positions, config.faceShape);
  
  // Adjust jaw
  applyJawMorph(positions, config.jawWidth);
  
  // Adjust cheekbones
  applyCheekboneMorph(positions, config.cheekboneHeight);
  
  // Add subtle feature suggestions
  addBrowRidge(positions, config.foreheadHeight);
  addNoseProjection(positions, config.noseWidth);
  addLipVolume(positions, config.lipFullness);
  addChinDefinition(positions, config.chinLength);
  
  headGeometry.computeVertexNormals();
  return headGeometry;
};
```

---

## Part 4: Pre-made Avatar Library

### 4.1 Diverse Model Collection

12 pre-configured avatars for instant use:

| Name | Gender | Height | Body Type | Skin Tone | Hair |
|------|--------|--------|-----------|-----------|------|
| Alex | Male | 178cm | Athletic | Light | Short brown |
| Jordan | Male | 183cm | Slim | Medium | Buzz black |
| Marcus | Male | 175cm | Average | Dark | Curly black |
| Ethan | Male | 180cm | Muscular | Light | Medium blonde |
| Sofia | Female | 165cm | Curvy | Light | Long brown |
| Maya | Female | 170cm | Athletic | Medium | Ponytail black |
| Amara | Female | 163cm | Slim | Dark | Braids black |
| Luna | Female | 168cm | Average | Medium | Medium auburn |
| River | Non-binary | 173cm | Slim | Light | Short purple |
| Sage | Non-binary | 168cm | Average | Medium | Curly brown |
| Chen | Male | 172cm | Average | Light-medium | Short black |
| Priya | Female | 160cm | Curvy | Medium-dark | Long black |

### 4.2 Model Library UI

Visual grid with:
- Avatar bust preview (chest up)
- Name and body type label
- Quick-apply on click
- "Customize" button for adjustments

---

## Part 5: State Management Updates

### 5.1 Extended TryOnState

```typescript
// Enhanced useTryOnState.tsx

export interface AvatarConfig {
  id: string;
  name: string;
  createdAt: Date;
  method: 'photo' | 'manual' | 'library';
  
  body: AvatarBodyConfig;
  face: AvatarFaceConfig;
  hair: AvatarHairConfig;
}

export interface TryOnState {
  // ... existing state
  
  // NEW: Avatar configuration
  customAvatar: AvatarConfig | null;
  avatarMode: 'mannequin' | 'realistic';
  showAvatarWizard: boolean;
}

// NEW: Context methods
setCustomAvatar: (avatar: AvatarConfig) => void;
setAvatarMode: (mode: 'mannequin' | 'realistic') => void;
setShowAvatarWizard: (show: boolean) => void;
```

### 5.2 Persistence

```typescript
// useAvatarStorage.ts (NEW hook)
const AVATAR_STORAGE_KEY = 'loj-custom-avatar';

export const useAvatarStorage = () => {
  const saveAvatar = (avatar: AvatarConfig) => {
    localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatar));
    // Optionally sync to Supabase if user is logged in
  };
  
  const loadAvatar = (): AvatarConfig | null => {
    const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  };
  
  const deleteAvatar = () => {
    localStorage.removeItem(AVATAR_STORAGE_KEY);
  };
  
  return { saveAvatar, loadAvatar, deleteAvatar };
};
```

---

## Part 6: UI/UX Components

### 6.1 New Components to Create

| Component | Purpose |
|-----------|---------|
| `AvatarCreationFlow.tsx` | Multi-step wizard container |
| `AvatarMethodSelector.tsx` | Step 1: Choose creation method |
| `AvatarBodyEditor.tsx` | Step 2: Body measurement interface |
| `AvatarFaceEditor.tsx` | Step 3: Face customization |
| `AvatarHairPicker.tsx` | Step 3: Hair style/color picker |
| `AvatarPreview.tsx` | Step 4: Final preview with 3D |
| `AvatarLibraryGrid.tsx` | Pre-made avatar gallery |
| `AvatarCreationCTA.tsx` | Entry point card in sidebar |
| `RealisticAvatar.tsx` | Main 3D avatar component |
| `AvatarEyes.tsx` | Eye detail subcomponent |
| `AvatarEyebrows.tsx` | Eyebrow subcomponent |
| `HairMaterial.tsx` | Custom hair shader material |

### 6.2 Wizard Step Navigation

Horizontal progress indicator at top:
```
[1] ─── [2] ─── [3] ─── [4]
Method  Body   Face   Preview
         ▲
      Current
```

- Back/Next buttons at bottom
- Skip option for optional steps
- Save draft on each step

---

## Part 7: Integration Points

### 7.1 Mode Toggle in TryOnSidebar

Allow switching between Mannequin and Realistic avatar:

```typescript
// In BodyMeasurementsPanel.tsx header
<div className="flex items-center justify-between mb-4">
  <h3>Avatar</h3>
  <AvatarModeToggle 
    mode={avatarMode}
    onToggle={setAvatarMode}
    hasCustomAvatar={!!customAvatar}
  />
</div>
```

### 7.2 Avatar Display in TryOnCanvas

```typescript
// In TryOnCanvas.tsx Scene component
{avatarMode === 'realistic' && customAvatar ? (
  <RealisticAvatar config={customAvatar} position={[0, 0, 0]} />
) : (
  <Mannequin3D position={[0, 0, 0]} />
)}
```

### 7.3 Garment Compatibility

Garments should fit both mannequin and realistic avatar:
- Both use same body proportion calculations from `measurementToProportions.ts`
- GarmentLayer receives proportions, not avatar type
- Garment positions are relative to standardized anchor points

---

## Part 8: Performance Considerations

| Aspect | Strategy |
|--------|----------|
| Face morphs | CPU-side, cached, only recompute on config change |
| Hair geometry | LOD: high poly on desktop, low poly on mobile |
| Skin material | Disable transmission on mobile for FPS |
| Avatar loading | Progressive: body first, then face, then hair |
| Memory | Single avatar instance, dispose old on change |

---

## Part 9: Phased Implementation

### Phase 1 (Core)
- AvatarCreationFlow wizard UI
- Manual measurement body configuration
- Pre-made avatar library (12 models)
- RealisticAvatar component with basic face
- State management updates
- Mode toggle (Mannequin ↔ Realistic)

### Phase 2 (Enhanced)
- Parametric face editor with sliders
- Multiple hair styles (procedural)
- Extended skin tone palette (20 tones)
- Avatar persistence to Supabase

### Phase 3 (Advanced)
- Photo-based body scan (AI integration)
- GLB hair models for higher fidelity
- Pose options (relaxed, confident, casual)
- AR preview mode

---

## Part 10: Files to Create/Modify

### New Files
```
src/components/try-on/avatar-creator/
├── AvatarCreationFlow.tsx
├── AvatarMethodSelector.tsx
├── AvatarBodyEditor.tsx
├── AvatarFaceEditor.tsx
├── AvatarHairPicker.tsx
├── AvatarPreview.tsx
├── AvatarLibraryGrid.tsx
├── AvatarCreationCTA.tsx
├── avatarPresets.ts (12 pre-made configs)
└── index.ts

src/components/try-on/realistic-avatar/
├── RealisticAvatar.tsx
├── AvatarBody.tsx
├── AvatarFace.tsx
├── AvatarHair.tsx
├── AvatarEyes.tsx
├── AvatarEyebrows.tsx
├── RealisticSkinMaterial.tsx
├── HairMaterial.tsx
└── index.ts

src/hooks/
├── useAvatarStorage.ts
└── useAvatarConfig.ts
```

### Modified Files
```
src/hooks/useTryOnState.tsx         — Add avatar config state
src/components/try-on/TryOnSidebar.tsx  — Add creation CTA
src/components/try-on/TryOnCanvas.tsx   — Switch avatar types
src/components/try-on/Avatar3D.tsx      — Integrate realistic avatar
src/pages/TryOnRoom.tsx             — Add wizard modal route
```

---

## Success Criteria

After implementation:

1. Users can create a personalized avatar that **looks human**
2. Face has recognizable features (not abstract)
3. Hair styles are selectable and realistic
4. Skin tones include **20+ diverse options**
5. Pre-made library offers **12 diverse models**
6. Avatar persists across sessions
7. Garments fit correctly on realistic avatar
8. Performance maintains **30+ FPS** on mobile
9. Creation flow is **under 2 minutes**
10. Experience feels **premium and inclusive**
