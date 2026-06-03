## Overview
Replace the minimal upload progress (subtle white bar inside button) and plain red error text on `/worn-in-the-wild/upload` with a clear, step-based progress indicator and polished Alert-styled messages.

## What will change

### 1. Upload progress indicator
- Add a visible 3-step progress tracker above the submit button during upload.
- Steps: **Preparing photo...** (resize + EXIF strip) → **Uploading...** (POST to edge function) → **Finishing up...** (server response + discount generation).
- Each step shows a checkmark when complete, a spinner when active, and a muted dot when pending.
- Uses Framer Motion for smooth transitions between step states.
- Styled with the existing Forest Green (`#4CAF50`) accent, sharp edges, and editorial typography.

### 2. Error messages
- Replace the current plain red `<p>` with the project's `Alert` component (`destructive` variant).
- Add a `CircleAlert` Lucide icon, a bold title, and the error description.
- Sharp edges via `rounded-none` override to match the editorial design system.
- Keep error placement just above the submit button.

### 3. Success confirmation
- Keep the existing reward code reveal as the final state.
- Add a brief "Submitted" success Alert before the reward block transitions in.

### File changes
- `src/pages/WornInTheWildUpload.tsx` — add `ProgressSteps` inline component, wire into `UploadForm`, replace error display with `Alert`.

No backend, routing, or edge function changes needed.
