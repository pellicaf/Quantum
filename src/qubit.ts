/** Complex number a + bi */
export type Complex = { re: number; im: number }

/** Qubit state α|0⟩ + β|1⟩ */
export type QubitState = [Complex, Complex]

export type BlochVector = { x: number; y: number; z: number }

export type GateName =
  | 'X'
  | 'Y'
  | 'Z'
  | 'H'
  | 'S'
  | 'T'
  | 'S†'
  | 'T†'
  | 'Rx'
  | 'Ry'
  | 'Rz'

export type Matrix2 = [[Complex, Complex], [Complex, Complex]]

const c = (re: number, im = 0): Complex => ({ re, im })

const add = (a: Complex, b: Complex): Complex => ({
  re: a.re + b.re,
  im: a.im + b.im,
})

const mul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
})

const conj = (a: Complex): Complex => ({ re: a.re, im: -a.im })

const abs2 = (a: Complex): number => a.re * a.re + a.im * a.im

const scale = (a: Complex, s: number): Complex => ({
  re: a.re * s,
  im: a.im * s,
})

export function zeroState(): QubitState {
  return [c(1), c(0)]
}

export function normalize(state: QubitState): QubitState {
  const n = Math.sqrt(abs2(state[0]) + abs2(state[1]))
  if (n < 1e-15) return zeroState()
  return [scale(state[0], 1 / n), scale(state[1], 1 / n)]
}

function applyMatrix(m: Matrix2, state: QubitState): QubitState {
  const [a, b] = state
  return normalize([
    add(mul(m[0][0], a), mul(m[0][1], b)),
    add(mul(m[1][0], a), mul(m[1][1], b)),
  ])
}

/** Bloch vector from pure state: r = ⟨ψ|σ|ψ⟩ */
export function toBloch(state: QubitState): BlochVector {
  const [a, b] = normalize(state)
  const ac = conj(a)
  // x = 2 Re(α* β), y = 2 Im(α* β), z = |α|² - |β|²
  const ab = mul(ac, b)
  return {
    x: 2 * ab.re,
    y: 2 * ab.im,
    z: abs2(a) - abs2(b),
  }
}

function rx(theta: number): Matrix2 {
  const cth = Math.cos(theta / 2)
  const sth = Math.sin(theta / 2)
  return [
    [c(cth), c(0, -sth)],
    [c(0, -sth), c(cth)],
  ]
}

function ry(theta: number): Matrix2 {
  const cth = Math.cos(theta / 2)
  const sth = Math.sin(theta / 2)
  return [
    [c(cth), c(-sth)],
    [c(sth), c(cth)],
  ]
}

function rz(theta: number): Matrix2 {
  const half = theta / 2
  return [
    [c(Math.cos(-half), Math.sin(-half)), c(0)],
    [c(0), c(Math.cos(half), Math.sin(half))],
  ]
}

const INV_SQRT2 = 1 / Math.sqrt(2)

function gateMatrix(name: GateName, angle: number): Matrix2 {
  switch (name) {
    case 'X':
      return [
        [c(0), c(1)],
        [c(1), c(0)],
      ]
    case 'Y':
      return [
        [c(0), c(0, -1)],
        [c(0, 1), c(0)],
      ]
    case 'Z':
      return [
        [c(1), c(0)],
        [c(0), c(-1)],
      ]
    case 'H':
      return [
        [c(INV_SQRT2), c(INV_SQRT2)],
        [c(INV_SQRT2), c(-INV_SQRT2)],
      ]
    case 'S':
      return [
        [c(1), c(0)],
        [c(0), c(0, 1)],
      ]
    case 'T':
      return [
        [c(1), c(0)],
        [c(0), c(Math.SQRT1_2, Math.SQRT1_2)],
      ]
    case 'S†':
      return [
        [c(1), c(0)],
        [c(0), c(0, -1)],
      ]
    case 'T†':
      return [
        [c(1), c(0)],
        [c(0), c(Math.SQRT1_2, -Math.SQRT1_2)],
      ]
    case 'Rx':
      return rx(angle)
    case 'Ry':
      return ry(angle)
    case 'Rz':
      return rz(angle)
  }
}

export function getGateMatrix(
  name: GateName,
  angle = Math.PI / 8,
): Matrix2 {
  return gateMatrix(name, angle)
}

export function applyGate(
  state: QubitState,
  name: GateName,
  angle = Math.PI / 8,
): QubitState {
  return applyMatrix(gateMatrix(name, angle), state)
}

function fmtComplex(z: Complex, digits = 3): string {
  const re = Number(z.re.toFixed(digits))
  const im = Number(z.im.toFixed(digits))
  if (Math.abs(im) < 5e-4) return `${re}`
  if (Math.abs(re) < 5e-4) return `${im}i`
  const sign = im >= 0 ? '+' : '-'
  return `${re}${sign}${Math.abs(im)}i`
}

export function formatMatrix(m: Matrix2): string {
  const a = fmtComplex(m[0][0])
  const b = fmtComplex(m[0][1])
  const c0 = fmtComplex(m[1][0])
  const d = fmtComplex(m[1][1])
  return `[[ ${a}, ${b} ],\n [ ${c0}, ${d} ]]`
}

export function formatKet(state: QubitState): string {
  const [a, b] = normalize(state)
  return `(${fmtComplex(a)})|0⟩ + (${fmtComplex(b)})|1⟩`
}

export function formatBloch(v: BlochVector): string {
  const f = (n: number) => n.toFixed(3)
  return `x=${f(v.x)}, y=${f(v.y)}, z=${f(v.z)}`
}
