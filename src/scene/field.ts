import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { buildGrid, CAMS, makeFrame, STATES, type Ctx, type Frame, type Grid } from './states'
import { finePointer, pointer, reduced, stage } from '@/lib/motion'

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

export const WIDE = 1024

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export type FieldOptions = {
  fixed?: number
  centered?: boolean
}

export class CubeField {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 90)
  private mesh: THREE.InstancedMesh
  private grid: Grid
  private A: Frame
  private B: Frame
  private ca: Ctx = { t: 0, settle: 0, px: 0, pz: 0, ps: 0 }
  private cb: Ctx = { t: 0, settle: 0, px: 0, pz: 0, ps: 0 }
  private ray = new THREE.Raycaster()
  private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  private hit = new THREE.Vector3()
  private ndc = new THREE.Vector2()
  private pos = new THREE.Vector3()
  private look = new THREE.Vector3()
  private timer = new THREE.Timer()
  private ro: ResizeObserver
  private sim = { s: 0, t: 2, intro: reduced ? 1 : 0, px: 0, pz: 0, ps: 0, lx: 0, ly: 0 }
  private w = 1
  private h = 1
  private running = false
  private maxDpr: number
  private slow = 0
  private frames = 0
  private first = true
  private shift = NaN

  constructor(
    private host: HTMLElement,
    G: number,
    private opts: FieldOptions,
    private onReady: () => void
  ) {
    const mobile = G < 32
    this.maxDpr = mobile ? 1.75 : 2
    this.sim.s = opts.fixed ?? stage.value
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.maxDpr))
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.toneMapping = THREE.NeutralToneMapping
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    const canvas = this.renderer.domElement
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    host.appendChild(canvas)

    this.scene.add(new THREE.HemisphereLight('#ffffff', '#cdc4b0', 1.5))
    const sun = new THREE.DirectionalLight('#ffffff', 2.4)
    sun.position.set(5, 12, 6)
    sun.castShadow = true
    sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048)
    const sc = sun.shadow.camera
    sc.left = -8
    sc.right = 8
    sc.top = 8
    sc.bottom = -8
    sc.near = 1
    sc.far = 30
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.02
    this.scene.add(sun)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.14, color: '#2a2117' })
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)

    this.grid = buildGrid(G)
    this.A = makeFrame(this.grid.N)
    this.B = makeFrame(this.grid.N)
    const geo = new RoundedBoxGeometry(1, 1, 1, 2, 0.1)
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.64, metalness: 0 })
    this.mesh = new THREE.InstancedMesh(geo, mat, this.grid.N)
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.grid.N * 3), 3)
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.mesh.frustumCulled = false
    this.scene.add(this.mesh)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    this.resize()
  }

  private get wide() {
    return !this.opts.centered && this.w >= WIDE
  }

  private fit(radius: number) {
    const tv = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const aspect = this.w / this.h
    if (this.opts.centered) {
      const t = Math.min(tv * aspect * 0.92, tv * 0.92)
      return radius / Math.sin(Math.atan(t))
    }
    const wide = this.wide
    const th = tv * aspect * (wide ? 0.54 : 0.94)
    const tw = tv * (wide ? (this.h - 64) / this.h : 0.47)
    const t = Math.min(th, tw)
    return (radius / Math.sin(Math.atan(t))) * (wide ? 1 : 0.92)
  }

  private resize() {
    const w = Math.max(1, this.host.clientWidth)
    const h = Math.max(1, this.host.clientHeight)
    this.w = w
    this.h = h
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.shift = NaN
    if (!this.running) this.frame(0)
  }

  start() {
    if (this.running) return
    this.running = true
    this.timer.reset()
    this.renderer.setAnimationLoop(t => {
      this.timer.update(t)
      this.frame(Math.min(this.timer.getDelta(), 1 / 20))
    })
  }

  stop() {
    this.running = false
    this.renderer.setAnimationLoop(null)
  }

  dispose() {
    this.stop()
    this.ro.disconnect()
    this.mesh.geometry.dispose()
    ;(this.mesh.material as THREE.Material).dispose()
    this.mesh.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer.domElement.remove()
  }

  private adapt(dt: number) {
    if (this.frames > 240 || dt <= 0) return
    this.frames++
    if (dt > 1 / 40) this.slow++
    if (this.frames === 240 && this.slow > 90 && this.renderer.getPixelRatio() > 1) {
      this.renderer.setPixelRatio(1)
      this.renderer.setSize(this.w, this.h, false)
    }
  }

  private frame(dt: number) {
    const S = this.sim
    const grid = this.grid
    const A = this.A
    const B = this.B
    this.adapt(dt)
    if (!reduced) S.t += dt
    S.intro = Math.min(1, S.intro + dt / 2.4)
    const target = this.opts.fixed ?? stage.value
    S.s += (target - S.s) * (1 - Math.exp(-dt * (reduced ? 40 : 5)))

    const last = CAMS.length - 1
    const s = Math.min(Math.max(S.s, 0), last)
    const k = Math.min(Math.floor(s), last - 1)
    const b = smooth(0.14, 0.86, s - k)

    const recent = performance.now() - pointer.seen < 1800
    const want = recent && s < 0.6 ? 1 : 0
    S.ps += (want - S.ps) * (1 - Math.exp(-dt * 2.5))
    if (recent) {
      const rect = this.host.getBoundingClientRect()
      this.ndc.set(((pointer.cx - rect.left) / rect.width) * 2 - 1, -((pointer.cy - rect.top) / rect.height) * 2 + 1)
      this.ray.setFromCamera(this.ndc, this.camera)
      if (this.ray.ray.intersectPlane(this.plane, this.hit)) {
        const r = 1 - Math.exp(-dt * 7)
        S.px += (this.hit.x - S.px) * r
        S.pz += (this.hit.z - S.pz) * r
      }
    }

    const ca = this.ca
    ca.t = S.t
    ca.settle = smooth(k - 0.7, k - 0.06, s)
    ca.px = S.px
    ca.pz = S.pz
    ca.ps = S.ps
    STATES[k]!(grid, A, ca)
    if (b > 0) {
      const cb = this.cb
      cb.t = S.t
      cb.settle = smooth(k + 0.3, k + 0.94, s)
      cb.px = S.px
      cb.pz = S.pz
      cb.ps = S.ps
      STATES[k + 1]!(grid, B, cb)
    }

    const delay = k % 2 === 0 ? grid.radial : grid.sweep
    const spread = reduced ? 0 : 0.6
    const lift = reduced ? 0 : 0.85
    const mat = this.mesh.instanceMatrix.array as Float32Array
    const col = this.mesh.instanceColor!.array as Float32Array
    const intro = S.intro

    for (let i = 0; i < grid.N; i++) {
      let tb = 0
      if (b >= 1) tb = 1
      else if (b > 0) tb = ease(clamp01(b * (1 + spread) - spread * delay[i]!))
      const j = i * 3
      const px = A.pos[j]! + (B.pos[j]! - A.pos[j]!) * tb
      let py = A.pos[j + 1]! + (B.pos[j + 1]! - A.pos[j + 1]!) * tb
      const pz = A.pos[j + 2]! + (B.pos[j + 2]! - A.pos[j + 2]!) * tb
      const sx = A.scl[j]! + (B.scl[j]! - A.scl[j]!) * tb
      let sy = A.scl[j + 1]! + (B.scl[j + 1]! - A.scl[j + 1]!) * tb
      const sz = A.scl[j + 2]! + (B.scl[j + 2]! - A.scl[j + 2]!) * tb
      const rot = A.rot[i]! + (B.rot[i]! - A.rot[i]!) * tb
      if (tb > 0 && tb < 1) py += Math.sin(Math.PI * tb) * lift * (0.55 + 0.45 * grid.r2[i]!)
      if (intro < 1) {
        const iv = ease(clamp01(intro * 1.7 - grid.radial[i]! * 0.7))
        sy *= iv
        py *= iv
      }
      if (sy < 0.0001) sy = 0.0001
      const cr = Math.cos(rot)
      const sr = Math.sin(rot)
      const o = i * 16
      mat[o] = cr * sx
      mat[o + 1] = 0
      mat[o + 2] = -sr * sx
      mat[o + 3] = 0
      mat[o + 4] = 0
      mat[o + 5] = sy
      mat[o + 6] = 0
      mat[o + 7] = 0
      mat[o + 8] = sr * sz
      mat[o + 9] = 0
      mat[o + 10] = cr * sz
      mat[o + 11] = 0
      mat[o + 12] = px
      mat[o + 13] = py
      mat[o + 14] = pz
      mat[o + 15] = 1
      col[j] = A.col[j]! + (B.col[j]! - A.col[j]!) * tb
      col[j + 1] = A.col[j + 1]! + (B.col[j + 1]! - A.col[j + 1]!) * tb
      col[j + 2] = A.col[j + 2]! + (B.col[j + 2]! - A.col[j + 2]!) * tb
    }
    this.mesh.instanceMatrix.needsUpdate = true
    this.mesh.instanceColor!.needsUpdate = true

    const c0 = CAMS[k]!
    const c1 = CAMS[k + 1]!
    const e = ease(b)
    this.look.set(
      c0.t[0] + (c1.t[0] - c0.t[0]) * e,
      c0.t[1] + (c1.t[1] - c0.t[1]) * e,
      c0.t[2] + (c1.t[2] - c0.t[2]) * e
    )
    this.pos.set(
      c0.p[0] + (c1.p[0] - c0.p[0]) * e,
      c0.p[1] + (c1.p[1] - c0.p[1]) * e,
      c0.p[2] + (c1.p[2] - c0.p[2]) * e
    )
    const radius = c0.r + (c1.r - c0.r) * e
    this.pos.sub(this.look).normalize().multiplyScalar(this.fit(radius)).add(this.look)

    const x0 = c0.x ?? 0.16
    const shift = x0 + ((c1.x ?? 0.16) - x0) * e
    if (Number.isNaN(this.shift) || Math.abs(shift - this.shift) > 0.0005) {
      this.shift = shift
      const ox = this.wide ? -this.w * shift : 0
      const oy = this.opts.centered || this.wide ? 0 : this.h * 0.215
      this.camera.setViewOffset(this.w, this.h, ox, oy, this.w, this.h)
    }

    if (finePointer && !reduced) {
      const r = 1 - Math.exp(-dt * 2)
      S.lx += (pointer.x - S.lx) * r
      S.ly += (pointer.y - S.ly) * r
      this.pos.x += S.lx * 0.7
      this.pos.y += S.ly * 0.4
    }

    this.camera.position.copy(this.pos)
    this.camera.lookAt(this.look)
    this.renderer.render(this.scene, this.camera)

    if (this.first) {
      this.first = false
      requestAnimationFrame(() => this.onReady())
    }
  }
}
