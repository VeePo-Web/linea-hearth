

# Replace Logo: "LINEA" to "LINE OF JUDAH"

## Problem
The current `public/logo.svg` renders "LINEA" in black vector paths. It needs to say "LINE OF JUDAH" to match the brand. The user uploaded a reference image (`Judah_2.png`) showing the desired text style -- bold, slightly stylized lettering with "Est. 2025" beneath.

The uploaded image has white text on a **black background**, which breaks on the site's white nav bar. We need a transparent-background version.

## Solution

### Step 1: Generate a proper transparent-background logo
Use the AI image generation endpoint (Gemini flash image model) to create a clean "LINE OF JUDAH / Est. 2025" logo with:
- Black text on transparent (alpha=0) background
- Bold, slightly stylized lettering matching the uploaded reference
- Output as PNG with transparency

### Step 2: Save to project
Copy the generated logo to `public/logo.png` (replacing the SVG reference with a PNG that supports transparency from AI generation).

### Step 3: Update 4 component references
All files currently reference `/logo.svg`. Update each to `/logo.png`:

| File | Line | Notes |
|------|------|-------|
| `src/components/header/Navigation.tsx` | 140 | Main nav bar logo |
| `src/components/header/FullScreenNav.tsx` | 192 | Full-screen mobile nav (has `brightness-0` filter) |
| `src/components/header/MobileMenu.tsx` | 141 | Mobile menu header |
| `src/components/header/CheckoutHeader.tsx` | 25 | Checkout page header |

Each is a simple string change: `"/logo.svg"` becomes `"/logo.png"`.

### Step 4: Clean up
Remove the old `public/logo.svg` file (optional -- it won't be referenced anymore).

## Technical Details

- **No layout changes** -- the `<img>` tags keep the same `className` (`h-6 w-auto` or `h-5 w-auto`)
- **No new dependencies** -- just swapping a file reference
- **Performance** -- PNG with transparency is slightly heavier than SVG but negligible at logo sizes; could also attempt SVG conversion if AI output quality is sufficient
- **FullScreenNav special case** -- currently applies `brightness-0` CSS filter to force black; with a proper black-on-transparent logo this filter can stay (it's a no-op on already-black content)

