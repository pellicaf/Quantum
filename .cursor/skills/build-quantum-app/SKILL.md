---
name: build-quantum-app
description: >-
  Documents how to run, structure, and extend the Quantum Bloch Sphere app
  (Vite, TypeScript, Three.js). Use when working in this repo, adding gates,
  UI, or visuals, changing qubit math or Bloch mapping, or when the user asks
  how the app is built.
---

# Build Quantum Bloch Sphere

Interactive single-qubit Bloch sphere: gates update a ket; the state arrow follows on the sphere.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc && vite build → dist/
npm run preview
```

`vite.config.ts` sets `base: './'` so GitHub Pages works for any repo name.

## Layering (do not break)

| Layer | File | Owns |
|-------|------|------|
| Math | `src/qubit.ts` | `QubitState`, `GateName`, `zeroState`, `applyGate`, `toBloch`, formatters |
| Render | `src/blochSphere.ts` | `createBlochSphere()` → `{ group, setBlochVector }`, `blochToThree` |
| UI / state | `src/ui.ts` | Mutable ket + θ; gate buttons; `getState` / `setState` |
| Compose | `src/main.ts` | Scene, camera, OrbitControls; wires UI → sphere |

Rules:

- No gate / complex math inside Three.js code.
- No `three` imports in `qubit.ts`.
- `main.ts` composes only; it does not own qubit state.

Shell markup: `index.html` (`#bloch-canvas`, `#panel`). Panel styles: `src/style.css`.

## Data flow

```
ui.ts (state)
  → onStateChange(state)
  → main.ts: toBloch(state)
  → blochSphere.setBlochVector(v)
```

Always call `toBloch` before `setBlochVector`. Mutate state through `setState` (or keep the same `onStateChange` path) so the arrow and readout stay in sync.

## Coordinate contract

README / visual convention:

- Bloch **+Z** → top (`|0⟩`)
- Bloch **+X** → right (`|+⟩`)
- Bloch **+Y** → forward (`|+i⟩`)

Use `blochToThree`: Bloch `(x, y, z)` → Three `(x, z, y)` (Y-up). **Never** map Bloch Y to Three Y.

`toBloch`: `x = 2 Re(α*β)`, `y = 2 Im(α*β)`, `z = |α|² − |β|²`.

## Extension recipes

### New gate

1. Add to `GateName` and `gateMatrix` in `qubit.ts`.
2. If the UI should expose it, append to `PAULI_GATES`, `PHASE_GATES`, or `ROTATION_GATES` in `ui.ts`.
3. Rotation gates use `angle` from the θ slider (`π/n`, `n` ∈ 1…32).

### Custom ket

```ts
ui.setState(normalize([α, β]))  // or zeroState()
```

`setState` refreshes the readout and fires `onStateChange`.

### Visual / layout tweak

- Sphere, axes, arrow: `blochSphere.ts` — keep the `BlochScene` API (`group` + `setBlochVector`).
- Panel look: `style.css` (CSS variables). Do not put gate algebra in materials or shaders.

## Out of scope

Multi-qubit registers and entanglement. This app models one pure state as a single Bloch arrow.
