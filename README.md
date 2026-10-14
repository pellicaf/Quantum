# Quantum Bloch Sphere

Interactive Bloch sphere in the browser. Drag to rotate the view; click quantum gates to rotate the qubit state vector.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Controls

- **Drag** — orbit the camera around the sphere
- **Scroll** — zoom
- **Gate buttons** — apply `X`, `Y`, `Z`, `H`, `S`, `T`, `S†`, `T†`, `Rx`, `Ry`, `Rz`
- **θ slider** — angle for rotation gates (`π/n`)
- **Reset** — return to `|0⟩`

## Convention

- Bloch **+Z** → top (`|0⟩`)
- Bloch **+X** → right (`|+⟩`)
- Bloch **+Y** → forward (`|+i⟩`)
