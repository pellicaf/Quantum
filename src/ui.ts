import {
  applyGate,
  formatBloch,
  formatKet,
  formatMatrix,
  getGateMatrix,
  toBloch,
  zeroState,
  type GateName,
  type QubitState,
} from './qubit'

const PAULI_GATES: GateName[] = ['X', 'Y', 'Z', 'H']
const PHASE_GATES: GateName[] = ['S', 'T', 'S†', 'T†']
const ROTATION_GATES: GateName[] = ['Rx', 'Ry', 'Rz']

const MATRIX_PLACEHOLDER = 'Select a gate'

export type UiCallbacks = {
  onStateChange: (state: QubitState) => void
}

export type UiController = {
  getState: () => QubitState
  setState: (state: QubitState) => void
}

export function createUi(root: HTMLElement, callbacks: UiCallbacks): UiController {
  let state = zeroState()
  let angle = Math.PI / 8
  let lastGate: GateName | null = null

  root.innerHTML = `
    <h1>Bloch Sphere</h1>
    <p class="subtitle">Drag to rotate the view. Apply gates to rotate the qubit.</p>

    <h2>State</h2>
    <div class="readout" id="readout"></div>

    <h2>Gate matrix</h2>
    <div class="readout" id="gate-matrix">${MATRIX_PLACEHOLDER}</div>

    <h2>Pauli / Hadamard</h2>
    <div class="gate-grid" id="pauli-gates"></div>

    <h2>Phase</h2>
    <div class="gate-grid" id="phase-gates"></div>

    <h2>Rotations</h2>
    <div class="angle-row">
      <label for="angle">θ</label>
      <input id="angle" type="range" min="1" max="32" value="4" step="1" />
      <output id="angle-out">π/8</output>
    </div>
    <div class="gate-grid" id="rotation-gates" style="margin-top:8px"></div>

    <h2>Actions</h2>
    <div class="actions">
      <button type="button" id="reset">Reset |0⟩</button>
    </div>

    <p class="hint">Scroll to zoom. Rotation gates use the θ slider (steps of π/n).</p>
  `

  const readout = root.querySelector('#readout') as HTMLElement
  const gateMatrixEl = root.querySelector('#gate-matrix') as HTMLElement
  const angleInput = root.querySelector('#angle') as HTMLInputElement
  const angleOut = root.querySelector('#angle-out') as HTMLOutputElement

  function angleLabel(n: number): string {
    if (n === 1) return 'π'
    return `π/${n}`
  }

  function syncAngle(): void {
    const n = Number(angleInput.value)
    angle = Math.PI / n
    angleOut.value = angleLabel(n)
    if (lastGate && ROTATION_GATES.includes(lastGate)) {
      refreshMatrix()
    }
  }

  function refreshReadout(): void {
    const bloch = toBloch(state)
    readout.textContent = `${formatKet(state)}\n${formatBloch(bloch)}`
  }

  function refreshMatrix(): void {
    if (!lastGate) {
      gateMatrixEl.textContent = MATRIX_PLACEHOLDER
      return
    }
    gateMatrixEl.textContent = `${lastGate}\n${formatMatrix(getGateMatrix(lastGate, angle))}`
  }

  function setState(next: QubitState): void {
    state = next
    refreshReadout()
    callbacks.onStateChange(state)
  }

  function mountGates(containerId: string, gates: GateName[]): void {
    const el = root.querySelector(`#${containerId}`) as HTMLElement
    for (const name of gates) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.textContent = name
      btn.addEventListener('click', () => {
        lastGate = name
        setState(applyGate(state, name, angle))
        refreshMatrix()
      })
      el.appendChild(btn)
    }
  }

  mountGates('pauli-gates', PAULI_GATES)
  mountGates('phase-gates', PHASE_GATES)
  mountGates('rotation-gates', ROTATION_GATES)

  angleInput.addEventListener('input', syncAngle)
  root.querySelector('#reset')!.addEventListener('click', () => {
    lastGate = null
    setState(zeroState())
    refreshMatrix()
  })

  syncAngle()
  refreshReadout()
  refreshMatrix()
  callbacks.onStateChange(state)

  return {
    getState: () => state,
    setState,
  }
}
