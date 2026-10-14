import * as THREE from 'three'
import type { BlochVector } from './qubit'

const RADIUS = 1

export type BlochScene = {
  group: THREE.Group
  setBlochVector: (v: BlochVector) => void
}

function axisLine(
  from: THREE.Vector3,
  to: THREE.Vector3,
  color: number,
): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints([from, to])
  const mat = new THREE.LineBasicMaterial({ color })
  return new THREE.Line(geo, mat)
}

function ring(axis: 'x' | 'y' | 'z', color: number): THREE.Line {
  const curve = new THREE.EllipseCurve(
    0,
    0,
    RADIUS,
    RADIUS,
    0,
    Math.PI * 2,
    false,
    0,
  )
  const points2 = curve.getPoints(128)
  const points = points2.map((p) => {
    if (axis === 'z') return new THREE.Vector3(p.x, p.y, 0)
    if (axis === 'y') return new THREE.Vector3(p.x, 0, p.y)
    return new THREE.Vector3(0, p.x, p.y)
  })
  const geo = new THREE.BufferGeometry().setFromPoints(points)
  return new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 }),
  )
}

function makeLabelSprite(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = color
  ctx.font = 'bold 48px "IBM Plex Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(0.35, 0.175, 1)
  return sprite
}

function addPoleLabels(group: THREE.Group): void {
  const labels: Array<[string, THREE.Vector3, string]> = [
    ['|0⟩', new THREE.Vector3(0, RADIUS + 0.18, 0), '#9fd0ff'],
    ['|1⟩', new THREE.Vector3(0, -(RADIUS + 0.18), 0), '#9fd0ff'],
    ['|+⟩', new THREE.Vector3(RADIUS + 0.18, 0, 0), '#b8f0c8'],
    ['|−⟩', new THREE.Vector3(-(RADIUS + 0.18), 0, 0), '#b8f0c8'],
    ['|+i⟩', new THREE.Vector3(0, 0, RADIUS + 0.18), '#f0d08a'],
    ['|−i⟩', new THREE.Vector3(0, 0, -(RADIUS + 0.18)), '#f0d08a'],
  ]
  for (const [text, pos, color] of labels) {
    const sprite = makeLabelSprite(text, color)
    sprite.position.copy(pos)
    group.add(sprite)
  }
}

/** Map Bloch (x,y,z) → Three.js (x, z, y) with Y-up so |0⟩ is at the top. */
export function blochToThree(v: BlochVector): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.z, v.y)
}

export function createBlochSphere(): BlochScene {
  const group = new THREE.Group()

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS, 48, 32),
    new THREE.MeshPhongMaterial({
      color: 0x3a6ea5,
      transparent: true,
      opacity: 0.18,
      shininess: 40,
      depthWrite: false,
    }),
  )
  group.add(sphere)

  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(RADIUS, 24, 16)),
    new THREE.LineBasicMaterial({
      color: 0x6a93c7,
      transparent: true,
      opacity: 0.22,
    }),
  )
  group.add(wire)

  group.add(ring('z', 0x7aa2d4))
  group.add(ring('y', 0x5f8f6a))
  group.add(ring('x', 0xa8894a))

  group.add(
    axisLine(new THREE.Vector3(-1.15, 0, 0), new THREE.Vector3(1.15, 0, 0), 0x7dffa3),
  )
  group.add(
    axisLine(new THREE.Vector3(0, -1.15, 0), new THREE.Vector3(0, 1.15, 0), 0x8ec7ff),
  )
  group.add(
    axisLine(new THREE.Vector3(0, 0, -1.15), new THREE.Vector3(0, 0, 1.15), 0xffd27a),
  )

  addPoleLabels(group)

  const arrowDir = new THREE.Vector3(0, 1, 0)
  const arrow = new THREE.ArrowHelper(
    arrowDir,
    new THREE.Vector3(0, 0, 0),
    RADIUS,
    0xff6b6b,
    0.12,
    0.08,
  )
  group.add(arrow)

  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff8a8a }),
  )
  tip.position.copy(arrowDir.clone().multiplyScalar(RADIUS))
  group.add(tip)

  function setBlochVector(v: BlochVector): void {
    const dir = blochToThree(v)
    if (dir.lengthSq() < 1e-12) {
      dir.set(0, 1, 0)
    } else {
      dir.normalize()
    }
    arrow.setDirection(dir)
    arrow.setLength(RADIUS, 0.12, 0.08)
    tip.position.copy(dir.clone().multiplyScalar(RADIUS))
  }

  return { group, setBlochVector }
}
