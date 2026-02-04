

# Try-On Room: Visual & Experience Design Concept

## A World-Class Virtual Fitting Room for Line of Judah

---

## EXECUTIVE SUMMARY

This document presents a comprehensive design and experience blueprint for transforming the Line of Judah Try-On Room into a magazine-editorial-meets-studio-fitting experience. The vision is to make users feel like they've stepped into a backstage fashion editorial studio—not a clinical 3D configurator.

The Try-On Room must feel like **flipping through a page of DAZED or 032c**, but interactive. Every interaction should feel **considered, confident, and cinematic**.

---

## PART 1: DESIGN PHILOSOPHY

### Core Experience Pillars

| Pillar | Principle | Application |
|--------|-----------|-------------|
| **Gallery Mode** | The mannequin is art on display | Clean backdrop, dramatic lighting, the avatar is the focal point |
| **Editorial Intimacy** | Like trying on in a designer's studio | Warm lighting options, premium materials feel, quiet confidence |
| **Streetwear Edge** | DAZED-style controlled chaos | Bold typography moments, intentional asymmetry, confident hierarchy |
| **Frictionless Flow** | Swedish function-first elegance | Every action is 1-2 taps, no clutter, clear hierarchy |

### Visual DNA (Inherited from Line of Judah)

```
TYPOGRAPHY:    DM Sans + Inter — light weights, generous tracking
COLORS:        Deep warm blacks (#0A0A0A), warm off-whites (#FAFAF8)
BORDERS:       None (rounded-none everywhere), clean edges
MOTION:        Smooth cubic-beziers, 0.3s default, editorial 0.7s reveals
SHADOWS:       Minimal, contact shadows only, no drop shadows
```

---

## PART 2: THE 3D CANVAS EXPERIENCE

### 2.1 Studio Environment Design

The 3D environment should feel like a **high-end photo studio** or **gallery installation**, not a generic 3D viewer.

#### Background Treatments (3 Modes)

| Mode | Description | Visual Treatment | Use Case |
|------|-------------|------------------|----------|
| **Studio** | Clean photographic studio | Warm white seamless (#F8F6F3), subtle gradient to floor, soft hotspot above | Default, product focus |
| **Natural** | Golden hour outdoor | Warm sunset gradient, soft environmental lighting | Lifestyle feel |
| **Dramatic** | Editorial night shoot | Deep charcoal (#1C1917) background, single key light, theatrical | High fashion impact |

#### Floor Treatment

- **Reflective cyclorama** — Subtle reflection (opacity 0.15-0.25) creates depth without distraction
- **Contact shadows only** — Soft, realistic grounding; no harsh edges
- **Circular gradient** — Fade to background at edges, creates natural "spotlight" feel

#### Ambient Details

- **Subtle grain texture** — CSS noise overlay at 2-3% opacity on the canvas wrapper for that editorial film quality
- **Vignette** — Gentle darkening at corners (CSS radial gradient) to focus attention center

### 2.2 Lighting System Enhancement

The current 3-mode lighting system is good. Enhance with:

| Mode | Key Light | Fill | Rim | Mood |
|------|-----------|------|-----|------|
| **Studio** | Soft front-right (2.5 intensity) | Left fill 40% of key | Subtle rim from behind | Clean, commercial, trustworthy |
| **Natural** | Overhead sun simulation | Hemisphere sky-ground | Warm bounce | Lifestyle, approachable |
| **Dramatic** | Single hard key (4.0 intensity) | Minimal | Golden rim accent | Editorial, fashion-forward |

**Transition Animation:** Lighting mode changes should fade over 0.5s with smooth intensity interpolation—never "pop" between modes.

### 2.3 Camera & Controls

#### Default Camera Position
- **Height:** Eye-level to mannequin chest (y: 1.2)
- **Distance:** Full-body framing (z: 2.8)
- **FOV:** 45° — prevents fish-eye distortion, maintains editorial proportion

#### Orbit Behavior
- **Damping:** 0.05 — silky smooth, never jarring
- **Limits:** Prevent extreme angles (min polar: 30°, max polar: 110°)
- **Zoom range:** 1.2 (close-up on face/accessories) to 4.5 (full body + environment)

#### Camera Presets (New Feature)

| Preset | Position | Use |
|--------|----------|-----|
| **Full Body** | Default | Overview |
| **Upper Body** | Zoom to torso/head | Hoodie/top focus |
| **Detail** | Close zoom on selected slot | Texture/print inspection |
| **3/4 View** | Angled perspective | Most flattering angle |

**UX:** Preset buttons in SceneControls, smooth 0.5s camera animation between presets.

---

## PART 3: MANNEQUIN & AVATAR DESIGN

### 3.1 Mannequin Aesthetic

The mannequin should feel like a **high-end retail display figure** or **museum installation piece**, not a video game character.

#### Surface Treatment
- **Material:** Matte ceramic/plaster aesthetic — clean, neutral, artistic
- **Finish:** Very low roughness (0.15), subtle reflectivity for depth
- **Color:** Skin tones available, but default to neutral warm gray for product focus

#### Silhouette Philosophy
- **Pose:** Relaxed confidence — slight weight shift, natural arm position
- **Proportions:** Industry-standard fashion proportions (8-head scale)
- **Detail Level:** Enough for realistic garment drape, abstracted facial features

### 3.2 Inclusivity in Representation

The body measurement system already supports diverse bodies. Ensure the visual feedback reinforces inclusivity:

| Element | Implementation |
|---------|----------------|
| **Body Types** | Smooth morphing between slim/athletic/average/curvy — no jarring transitions |
| **Height Range** | 152cm - 198cm (5'0" - 6'6") — visible proportion changes |
| **Gender Expression** | Male/Female base with body measurements allowing any combination |
| **Skin Tones** | 6 tones minimum, realistic subsurface scattering in material |

---

## PART 4: GARMENT VISUALIZATION

### 4.1 Texture Philosophy

#### Product Images as Textures
The current UV projection system maps flat-front product images to 3D geometry. Enhance the visual quality:

| Element | Current | Target |
|---------|---------|--------|
| **Front Mapping** | Planar projection | Keep — works well for logo placement |
| **Side/Back** | Color-matched solid | Gradient fade from front texture to solid |
| **Fabric Simulation** | Basic MeshStandardMaterial | Normal maps for fabric texture feel |

#### Material Presets (Already Implemented)

| Fabric Type | Visual Properties |
|-------------|-------------------|
| **Cotton** | Matte, soft shadows, subtle texture |
| **Fleece** | Slightly fuzzy edge, warm material |
| **Denim** | Subtle warp/weft texture, matte |
| **Leather** | Higher roughness, subtle sheen |
| **Knit** | Visible rib texture in normals |

### 4.2 Garment Interaction

When a garment is equipped, create a **moment of satisfaction**:

| Event | Animation | Duration | Feel |
|-------|-----------|----------|------|
| **Equip** | Fade in + subtle scale (0.95 → 1.0) | 0.3s | Garment "settles" onto body |
| **Swap** | Cross-fade between garments | 0.25s | Seamless transition |
| **Remove** | Fade out + slight scale down | 0.2s | Quick, clean removal |

### 4.3 Garment Layering Hierarchy

Visual z-order must be correct for realistic outfit composition:

```
Layer 5 (Front): Head (beanies, caps)
Layer 4:         Outerwear (hoodies, jackets)
Layer 3:         Tops (t-shirts, tanks)
Layer 2:         Bottoms (pants, shorts)
Layer 1 (Base):  Footwear (sneakers, boots)
```

---

## PART 5: UI/UX DESIGN SYSTEM

### 5.1 Page Layout Philosophy

#### Desktop (≥768px)
- **Canvas: 60%** — The 3D experience is the hero
- **Sidebar: 40%** (380px fixed) — Compact but complete
- **Separation:** Subtle border-l, no heavy shadows

#### Mobile (<768px)
- **Canvas: 50dvh** — Maximum viable 3D space above fold
- **Bottom Bar:** Fixed sticky bar with outfit slots
- **Sheet Drawers:** Full-height product selection, measurements

### 5.2 Typography in Try-On Room

Apply the editorial typography system:

| Element | Style | Example |
|---------|-------|---------|
| **Page Title** | text-2xl font-light tracking-tight | "Try-On Room" |
| **Section Headers** | text-xs font-medium uppercase tracking-[0.2em] | "OUTFIT SLOTS" |
| **Body Text** | text-sm font-light | Product names |
| **Prices** | text-sm font-medium | "$68" |
| **Hints/Helpers** | text-[11px] uppercase tracking-[0.15em] text-muted-foreground | "Drag to rotate" |

### 5.3 Control Surface Design

#### Scene Controls (Bottom Center Pill)
- **Shape:** Rounded-full pill, backdrop-blur-md
- **Background:** bg-background/90 with border-border/50
- **Icons:** 18-20px, muted-foreground, hover → foreground
- **Spacing:** Consistent 9x9 icon buttons, 1px dividers between groups

#### Outfit Slot Buttons (Mobile Bottom Bar)
- **Shape:** Rounded-full circles (48x48px — touch target compliant)
- **States:**
  - Empty: border-border, text-muted-foreground
  - Equipped: bg-foreground text-background, filled
  - Active: ring-2 ring-foreground ring-offset-2

#### Size Selector Buttons
- **Shape:** Rectangular, rounded-none (editorial edge)
- **Spacing:** gap-3 (12px) for comfortable tap targets
- **States:**
  - Default: border-border, transparent bg
  - Selected: border-foreground bg-foreground text-background
  - Disabled: opacity-50, cursor-not-allowed

### 5.4 Micro-Interactions

| Interaction | Animation | Purpose |
|-------------|-----------|---------|
| **Hover on product card** | scale(1.02) + shadow | Invite interaction |
| **Select product** | Ring appears + checkmark overlay | Confirm selection |
| **Add to outfit** | Card "jumps" slightly + haptic | Celebrate action |
| **Price update** | Number counter animation | Show value changing |
| **Save look** | Confetti or sparkle burst | Reward sharing |

---

## PART 6: SIDEBAR EXPERIENCE (Desktop)

### 6.1 Information Architecture

```
┌─────────────────────────────────────┐
│ BODY MEASUREMENTS                   │
│ ┌─────────────────────────────────┐ │
│ │ Tabs: Quick | Detailed | Saved  │ │
│ ├─────────────────────────────────┤ │
│ │ Gender Toggle (Male/Female)     │ │
│ │ Size Presets (S/M/L/XL grid)    │ │
│ │ Skin Tone Selector              │ │
│ │ Recommended Size Badge          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ OUTFIT SLOTS                        │
│ ┌─────────────────────────────────┐ │
│ │ [Crown] Headwear     [+ Add]    │ │
│ │ [Shirt] Tops         [+ Add]    │ │
│ │ [Layer] Layers       [+ Add]    │ │
│ │ [Pants] Bottoms      [+ Add]    │ │
│ │ [Shoe]  Footwear     [+ Add]    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ YOUR OUTFIT (3 items)    [Clear]   │
│ ┌─────────────────────────────────┐ │
│ │ [Img] Stay Holy Hoodie   $68    │ │
│ │       Size M                    │ │
│ │ [Img] Heavenly Joggers   $58    │ │
│ │       Size L                    │ │
│ │ [Img] Faith Cap          $32    │ │
│ │       Size OS                   │ │
│ ├─────────────────────────────────┤ │
│ │ Total              $158         │ │
│ │ [████ Buy This Look ████]      │ │
│ │ [░░░░ Add All to Bag ░░░░]     │ │
│ │ [Save Look]     [Share]         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 6.2 Measurement Panel UX

#### Quick Tab (Default)
- **Gender Toggle:** Two equal buttons, clear selected state
- **Quick Presets:** 6 presets in 2x3 grid (Petite S, Small, Medium, Large, Tall, Athletic)
- **Skin Tones:** Horizontal row of 6 circles
- **Result:** "Recommended Size: M" with confidence indicator

#### Detailed Tab
- **Unit Toggle:** Metric/Imperial switch
- **Sliders:** Clean slider components with real-time value display
- **Organized Sections:** Height/Weight → Body Measurements
- **Live Preview:** Mannequin morphs as sliders move (debounced 50ms)

#### Saved Tab
- **Profile Cards:** Name, measurements summary, default badge
- **Actions:** Apply, Set Default, Delete
- **Empty State:** Encouraging prompt to save first profile

### 6.3 Outfit Summary UX

#### Empty State
```
┌────────────────────────────────┐
│    ┌────────────────────┐     │
│    │      [  👔  ]       │     │
│    └────────────────────┘     │
│    Select items to build      │
│      your outfit              │
└────────────────────────────────┘
```

#### With Items
- **Item Cards:** Thumbnail (48x48), name, size, price
- **Total:** Clear separation, larger font weight
- **Primary CTA:** "Buy This Look" — full-width, filled
- **Secondary CTA:** "Add All to Bag" — full-width, outlined
- **Tertiary:** "Save Look" + "Share" — ghost buttons, smaller

---

## PART 7: MOBILE EXPERIENCE

### 7.1 Bottom Bar Design

The mobile bottom bar is the **command center** for the Try-On experience on small screens.

#### Structure (Top to Bottom)
```
┌────────────────────────────────────────┐
│ [👑] [👕] [🧥] [👖] [👟]               │  ← Outfit Slots (equal width)
├────────────────────────────────────────┤
│ 🛒 3 items ▲        $158  [Buy Now]   │  ← Summary Bar
└────────────────────────────────────────┘
```

#### Slot Indicators
- **Empty:** Dashed circle border, muted icon
- **Filled:** Solid circle, inverted colors, mini product thumbnail option
- **Active:** Additional ring highlight

#### Summary Sheet (Pulled Up)
When user taps "3 items ▲", a bottom sheet expands showing:
- Full item list with thumbnails
- Total price
- Buy This Look button
- Add All to Bag button
- Save & Share Look button

### 7.2 Product Drawer (Mobile)

#### Sheet Behavior
- **Height:** 70vh from bottom
- **Drag handle:** Visible pill indicator at top
- **Close:** Swipe down or tap outside

#### Content Structure
```
┌────────────────────────────────────────┐
│     ═══                                │ ← Drag Handle
│ Select a Top                           │
├────────────────────────────────────────┤
│ Size: [XS] [S] [M●] [L] [XL]          │
├────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐              │
│ │         │  │         │              │
│ │  Prod   │  │  Prod   │              │
│ │         │  │    ✓    │ ← Equipped   │
│ ├─────────┤  ├─────────┤              │
│ │ Name    │  │ Name    │              │
│ │ $68     │  │ $58     │              │
│ └─────────┘  └─────────┘              │
│ ┌─────────┐  ┌─────────┐              │
│ │         │  │         │              │
│ └─────────┘  └─────────┘              │
└────────────────────────────────────────┘
```

---

## PART 8: INTERACTION STATES & FEEDBACK

### 8.1 Loading States

| Element | Loading Treatment |
|---------|-------------------|
| **3D Canvas** | Centered spinner + "Loading model..." text |
| **Product Grid** | Skeleton cards matching 3:4 aspect ratio |
| **Textures** | Placeholder material → smooth fade to textured |
| **Mannequin** | Base color → skin tone transition |

### 8.2 Error States

| Error | Treatment |
|-------|-----------|
| **WebGL Context Lost** | Friendly illustration + "Reload 3D View" button |
| **No Products** | Empty state with redirect to shop |
| **Save Failed** | Toast with retry action |

### 8.3 Success States

| Action | Feedback |
|--------|----------|
| **Item Equipped** | Subtle pulse on slot icon + optional haptic |
| **Look Saved** | Toast: "Saved! Share link copied" |
| **All Added to Cart** | Toast + cart icon bounce + drawer auto-open option |

---

## PART 9: ACCESSIBILITY REQUIREMENTS

### 9.1 Keyboard Navigation
- **Tab order:** Canvas controls → Sidebar panels → CTAs
- **Arrow keys:** Navigate size options, skin tone options
- **Enter/Space:** Activate buttons, select products
- **Escape:** Close drawers/modals

### 9.2 Screen Reader Support
- **Canvas:** `aria-label="3D outfit preview. Use controls below to adjust view."`
- **Slots:** `aria-label="Headwear slot. Empty." / "Equipped with Stay Holy Hoodie."`
- **Controls:** All buttons have descriptive labels

### 9.3 Reduced Motion
- **prefers-reduced-motion: reduce** → Disable 3D breathing animation, use instant transitions
- **Camera transitions:** Immediate instead of animated
- **Garment equip:** Opacity change only, no scale

---

## PART 10: PERFORMANCE TARGETS

| Metric | Target |
|--------|--------|
| **Initial 3D Load** | <2s on 4G |
| **Garment Swap** | <100ms perceived |
| **Texture Load** | Progressive, low-res first |
| **Mobile FPS** | 30+ fps maintained |
| **Memory** | <150MB WebGL heap |

### Optimization Strategies
1. **Texture caching** — Global cache with reference counting ✓
2. **Geometry reuse** — Memoized with proper dependencies ✓
3. **LOD for mobile** — Reduced polygon count on mobile ✓
4. **Lazy environment maps** — Load only for current lighting mode
5. **Shadow optimization** — Disabled on mobile ✓

---

## PART 11: EMOTIONAL JOURNEY

### The User's Experience Arc

```
1. INTRIGUE
   "This looks cool" → Premium entrance, clean layout, inviting canvas

2. PERSONALIZATION
   "This is about ME" → Quick body setup, see mannequin adapt

3. DISCOVERY
   "Let me try this" → Browse products, easy equip, instant visualization

4. STYLING
   "I'm creating something" → Mix pieces, see total, feel like a stylist

5. CONFIDENCE
   "This will fit" → Size recommendation, see it on my body type

6. COMMITMENT
   "I want this" → Clear price, easy purchase, save for later option

7. SHARING
   "Look what I made" → Share link, screenshot, social proof
```

### Emotional Design Details

| Moment | Emotion | Design Response |
|--------|---------|-----------------|
| First load | Curiosity | Smooth reveal, welcoming hint text |
| Empty state | Potential | Clean slate, encouraging prompts |
| First equip | Satisfaction | Subtle animation, confirmation feedback |
| Full outfit | Pride | Total displayed prominently, share CTA visible |
| Size doubt | Reassurance | Confidence percentage, measurement context |
| Save/Share | Connection | Easy URL copy, social share options |

---

## PART 12: IMPLEMENTATION CHECKLIST

### Phase 1: Visual Polish
- [ ] Add CSS grain overlay to canvas wrapper (2% opacity)
- [ ] Implement vignette gradient effect
- [ ] Refine lighting intensity curves per mode
- [ ] Add camera preset buttons to SceneControls
- [ ] Smooth camera transitions between presets

### Phase 2: Interaction Refinement
- [ ] Garment equip/remove animations (fade + scale)
- [ ] Price counter animation on total update
- [ ] Slot indicator transitions (empty → filled)
- [ ] Haptic feedback consistency audit

### Phase 3: Mobile Excellence
- [ ] Bottom sheet physics refinement
- [ ] Product drawer scroll performance
- [ ] Touch target audit (all ≥48px)
- [ ] Safe area compliance verification

### Phase 4: Accessibility Completion
- [ ] Full ARIA label audit
- [ ] Keyboard navigation testing
- [ ] Reduced motion behavior testing
- [ ] Screen reader compatibility testing

---

## SUMMARY

The Line of Judah Try-On Room should feel like **stepping into a private fashion editorial session**. The combination of:

- **Gallery-quality 3D presentation** (studio lighting, reflective floor, subtle grain)
- **Editorial typography and spacing** (DAZED/032c influence)
- **Frictionless interaction design** (1-2 taps for any action)
- **Inclusive body representation** (all sizes, tones, genders)
- **Confident commerce integration** (clear pricing, easy checkout)

...creates an experience that **elevates the brand** while **driving conversion**.

The Try-On Room isn't just a feature—it's a **brand statement**.

