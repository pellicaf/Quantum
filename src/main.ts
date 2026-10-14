import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createBlochSphere } from './blochSphere'
import { toBloch } from './qubit'
import { createUi } from './ui'

const canvas = document.querySelector('#bloch-canvas') as HTMLCanvasElement
const panel = document.querySelector('#panel') as HTMLElement

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
)
camera.position.set(2.4, 1.6, 2.8)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.08
controls.minDistance = 1.6
controls.maxDistance = 8
controls.target.set(0, 0, 0)

scene.add(new THREE.AmbientLight(0xffffff, 0.55))
const key = new THREE.DirectionalLight(0xffffff, 0.9)
key.position.set(3, 4, 2)
scene.add(key)

const bloch = createBlochSphere()
scene.add(bloch.group)

createUi(panel, {
  onStateChange(state) {
    bloch.setBlochVector(toBloch(state))
  },
})

function onResize(): void {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

window.addEventListener('resize', onResize)

function tick(): void {
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick()
