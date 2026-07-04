# Debug Session: white-screen-ui

Status: OPEN

## Symptom
- App shows a white screen on localhost instead of rendering the frontend.

## Scope
- Frontend runtime in `front/`

## Initial Hypotheses
- H1: The app fails before first render because a newly added dependency such as `lucide-react` is not installed.
- H2: A runtime import/export mismatch exists in one of the updated `components/` or `pages/` files, causing Vite to abort module evaluation.
- H3: A JSX or Tailwind-related syntax issue survives editor diagnostics but fails during bundling/runtime transform.
- H4: The app mounts, but global styling/theme shell makes content visually disappear due to invalid theme state or full-screen overlay behavior.
- H5: A route-level component throws during render because of browser-only code or localStorage/theme initialization timing.

## Plan
- Collect runtime/build evidence first.
- Confirm or reject hypotheses with logs.
- Apply the smallest fix needed based on evidence.

## Evidence Collected
- `lucide-react` dependency check: installed locally.
- TypeScript/VS Code diagnostics across `front/src`: no file-level diagnostics.
- Production build: `npm.cmd run build` completed successfully.
- Dev server startup: Vite served successfully at `http://127.0.0.1:3000/`.

## Hypothesis Status
- H1: Rejected. `lucide-react` is installed.
- H2: Rejected for current source state. No build/runtime module loading failure appears in the frontend build/startup path.
- H3: Rejected. The app compiles successfully through `tsc && vite build`.
- H4: Not confirmed by code evidence. No compile/runtime startup failure indicates the shell is not blocked at boot.
- H5: Not confirmed by current evidence. Theme/localStorage initialization does not fail during build or dev startup.

## Current Conclusion
- There is no current file in `front/src` preventing the new changes from compiling or loading.
- The most likely cause of a white screen is environmental/runtime outside the checked source set: wrong localhost target, stale browser cache/service worker, or an old dev server/browser tab not loading the current Vite instance.

## Instrumentation Added
- Added a temporary root-level React error boundary in `front/src/main.tsx`.
- Added temporary `window.error` and `unhandledrejection` capture that writes debug attributes onto `<html>`.
- This instrumentation is build-safe and intended only to expose the real runtime failure instead of a blank screen.

## Root Cause Identified
- Two invalid named imports from `lucide-react` were present in the updated UI code:
  - `House` in `front/src/components/SideDock.tsx`
  - `PlayCircle` in `front/src/pages/Home.tsx`
- The installed Lucide version exports `Home` and `CirclePlay` instead.
- A bad named ESM import can fail module evaluation before React mounts, which explains:
  - title/favicon still loading from `index.html`
  - a blank page with no app content
  - no React error boundary overlay appearing

## Fix Applied
- Replaced `House` -> `Home` in `front/src/components/SideDock.tsx`
- Replaced `PlayCircle` -> `CirclePlay` in `front/src/pages/Home.tsx`
- Post-fix verification:
  - diagnostics clean for edited files
  - `npm.cmd run build` succeeds
