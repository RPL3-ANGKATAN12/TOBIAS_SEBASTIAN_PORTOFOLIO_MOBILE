import { Color } from 'three'

export const W = 9

type RGB = [number, number, number]

const rgb = (h: string): RGB => {
  const c = new Color(h)
  return [c.r, c.g, c.b]
}

const C = {
  ink: rgb('#1a1917'),
  inkSoft: rgb('#3d3a35'),
  grey: rgb('#8c8578'),
  greyLight: rgb('#c9c2b2'),
  mask: rgb('#e4ddcd'),
  paper: rgb('#efeadd'),
  white: rgb('#fbf8f1'),
  red: rgb('#d0341c'),
  lightSq: rgb('#e2dbc9'),
  darkSq: rgb('#a69e8d')
}

export type Frame = {
  pos: Float32Array
  scl: Float32Array
  col: Float32Array
  rot: Float32Array
}

export type Ctx = { t: number; settle: number; px: number; pz: number; ps: number }

type VoxelPlan = {
  on: Uint8Array
  vx: Float32Array
  vy: Float32Array
  vz: Float32Array
  red: Uint8Array
  fx: Float32Array
  fz: Float32Array
  hidden: Uint8Array
  size: number
  fcell: number
  count: number
}

export type Grid = {
  G: number
  N: number
  cube: number
  x: Float32Array
  z: Float32Array
  u: Float32Array
  v: Float32Array
  ix: Int32Array
  iz: Int32Array
  r1: Float32Array
  r2: Float32Array
  r3: Float32Array
  radial: Float32Array
  sweep: Float32Array
  voxel: VoxelPlan
}

export function makeFrame(n: number): Frame {
  return {
    pos: new Float32Array(n * 3),
    scl: new Float32Array(n * 3),
    col: new Float32Array(n * 3),
    rot: new Float32Array(n)
  }
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash = (k: number) => {
  const s = Math.sin(k * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

function put(f: Frame, i: number, x: number, base: number, z: number, sx: number, h: number, sz: number, rot = 0) {
  const j = i * 3
  f.pos[j] = x
  f.pos[j + 1] = base + h / 2
  f.pos[j + 2] = z
  f.scl[j] = sx
  f.scl[j + 1] = h
  f.scl[j + 2] = sz
  f.rot[i] = rot
}

function paint(f: Frame, i: number, a: RGB, b: RGB, t: number) {
  const j = i * 3
  f.col[j] = a[0] + (b[0] - a[0]) * t
  f.col[j + 1] = a[1] + (b[1] - a[1]) * t
  f.col[j + 2] = a[2] + (b[2] - a[2]) * t
}

function chair(): [number, number, number, boolean][] {
  const out: [number, number, number, boolean][] = []
  for (const [x, z] of [[1, 1], [1, 8], [8, 1], [8, 8]]) {
    for (let y = 0; y < 4; y++) out.push([x, y, z, false])
  }
  for (let x = 1; x <= 8; x++) for (let z = 1; z <= 8; z++) out.push([x, 4, z, true])
  for (let y = 5; y <= 10; y++) {
    for (let x = 1; x <= 8; x++) {
      if (x === 1 || x === 8 || y === 10 || y === 7) out.push([x, y, 1, false])
    }
  }
  return out
}

function planVoxels(G: number, N: number, x: Float32Array, z: Float32Array): VoxelPlan {
  const size = G >= 32 ? 0.36 : 0.4
  const vox = chair()
  const on = new Uint8Array(N)
  const vx = new Float32Array(N)
  const vy = new Float32Array(N)
  const vz = new Float32Array(N)
  const red = new Uint8Array(N)
  const taken = new Uint8Array(N)
  vox.sort((a, b) => a[1] - b[1])
  for (const [a, b, c, r] of vox) {
    const wx = (a - 4.5) * size
    const wz = (c - 4.5) * size
    let best = -1
    let bd = Infinity
    for (let i = 0; i < N; i++) {
      if (taken[i]) continue
      const d = (x[i] - wx) ** 2 + (z[i] - wz) ** 2
      if (d < bd) {
        bd = d
        best = i
      }
    }
    taken[best] = 1
    on[best] = 1
    vx[best] = wx
    vy[best] = b * size
    vz[best] = wz
    red[best] = r ? 1 : 0
  }
  const rest: number[] = []
  for (let i = 0; i < N; i++) if (!taken[i]) rest.push(i)
  const gf = Math.floor(Math.sqrt(rest.length))
  const span = W * 0.82
  const fcell = span / gf
  const fx = new Float32Array(N)
  const fz = new Float32Array(N)
  const hidden = new Uint8Array(N)
  rest.forEach((i, k) => {
    if (k >= gf * gf) {
      hidden[i] = 1
      fx[i] = x[i]
      fz[i] = z[i]
      return
    }
    fx[i] = ((k % gf) + 0.5) * fcell - span / 2
    fz[i] = (Math.floor(k / gf) + 0.5) * fcell - span / 2
  })
  return { on, vx, vy, vz, red, fx, fz, hidden, size, fcell, count: vox.length }
}

export function buildGrid(G: number): Grid {
  const N = G * G
  const cell = W / G
  const r = rng(20260929)
  const g: Grid = {
    G,
    N,
    cube: cell * 0.84,
    x: new Float32Array(N),
    z: new Float32Array(N),
    u: new Float32Array(N),
    v: new Float32Array(N),
    ix: new Int32Array(N),
    iz: new Int32Array(N),
    r1: new Float32Array(N),
    r2: new Float32Array(N),
    r3: new Float32Array(N),
    radial: new Float32Array(N),
    sweep: new Float32Array(N),
    voxel: undefined as unknown as VoxelPlan
  }
  for (let i = 0; i < N; i++) {
    const ix = i % G
    const iz = Math.floor(i / G)
    const u = ix / (G - 1)
    const v = iz / (G - 1)
    g.ix[i] = ix
    g.iz[i] = iz
    g.u[i] = u
    g.v[i] = v
    g.x[i] = (ix + 0.5) * cell - W / 2
    g.z[i] = (iz + 0.5) * cell - W / 2
    g.r1[i] = r()
    g.r2[i] = r()
    g.r3[i] = r()
    const d = Math.hypot(u - 0.5, v - 0.5) / Math.SQRT1_2
    g.radial[i] = clamp01(d * 0.72 + g.r1[i] * 0.28)
    g.sweep[i] = clamp01(((u + (1 - v)) / 2) * 0.75 + g.r2[i] * 0.25)
  }
  g.voxel = planVoxels(G, N, g.x, g.z)
  return g
}

function weights(g: Grid, f: Frame, c: Ctx) {
  const t = c.t
  for (let i = 0; i < g.N; i++) {
    const x = g.x[i]
    const z = g.z[i]
    const n =
      Math.sin(x * 0.8 + t * 0.5) * Math.cos(z * 0.65 - t * 0.35) +
      0.45 * Math.sin((x - z) * 1.3 + t * 0.8) +
      0.25 * Math.sin(x * 2.7 - t * 0.6 + z * 0.4)
    const m = clamp01((n + 1.7) / 3.4)
    const dx = x - c.px
    const dz = z - c.pz
    const d = Math.sqrt(dx * dx + dz * dz)
    const bump = c.ps * Math.exp(-(d * d) / 1.3)
    const ring = c.ps * 0.3 * Math.sin(d * 3.2 - t * 5) * Math.exp(-d * 0.55)
    let h = 0.1 + 0.95 * m * m + 1.55 * bump + Math.max(0, ring)
    if (g.r1[i] < 0.02) {
      h += 0.9 + 0.35 * Math.sin(t * 1.1 + g.r2[i] * 6.283)
      paint(f, i, C.red, C.red, 0)
    } else {
      paint(f, i, C.greyLight, C.ink, clamp01(m * 1.25 + bump * 0.6))
    }
    put(f, i, x, 0, z, g.cube, h, g.cube)
  }
}

function attention(g: Grid, f: Frame, c: Ctx) {
  const G = g.G
  const q = ((c.t * 4.2) % (G + 10)) - 5
  for (let i = 0; i < g.N; i++) {
    const ix = g.ix[i]
    const iz = g.iz[i]
    if (ix <= iz) {
      const d = iz - ix
      let a = 0.85 * Math.exp(-d / 2.4) + (ix === 0 ? 0.6 : 0) + (ix % 7 === 3 ? 0.16 : 0) + 0.14 * g.r1[i]
      a = Math.min(a, 1.15)
      const row = Math.exp(-((iz - q) ** 2) / 1.1)
      const h = 0.05 + 1.2 * a + 0.4 * row * a
      paint(f, i, C.greyLight, C.ink, Math.min(1, a * 1.1))
      if (row > 0.02) {
        const j = i * 3
        const k = row * 0.9
        f.col[j] += (C.red[0] - f.col[j]) * k
        f.col[j + 1] += (C.red[1] - f.col[j + 1]) * k
        f.col[j + 2] += (C.red[2] - f.col[j + 2]) * k
      }
      put(f, i, g.x[i], 0, g.z[i], g.cube, h, g.cube)
    } else {
      paint(f, i, C.mask, C.mask, 0)
      put(f, i, g.x[i], 0, g.z[i], g.cube, 0.03, g.cube)
    }
  }
}

function pixels(g: Grid, f: Frame, c: Ctx) {
  const s = c.settle
  const clean = s * s * (3 - 2 * s)
  const img: RGB = [0, 0, 0]
  const noise: RGB = [0, 0, 0]
  for (let i = 0; i < g.N; i++) {
    const u = g.u[i]
    const v = g.v[i]
    let col = C.paper
    let ih = 0.1
    const du = u - 0.63
    const dv = v - 0.34
    if (du * du + dv * dv < 0.17 * 0.17) {
      col = C.red
      ih = 0.26
    }
    const far = 0.5 + 0.07 * Math.sin(u * 7.5 + 1) + 0.04 * Math.sin(u * 15.3)
    const near = 0.66 + 0.09 * Math.sin(u * 4.1 - 0.7) + 0.025 * Math.sin(u * 19)
    if (v > far) {
      col = C.grey
      ih = 0.2
    }
    if (v > near) {
      col = C.ink
      ih = 0.32
    }
    img[0] = col[0]
    img[1] = col[1]
    img[2] = col[2]
    const nv = g.r1[i]
    const nc = g.r2[i] < 0.07 ? C.red : null
    if (nc) {
      noise[0] = nc[0]
      noise[1] = nc[1]
      noise[2] = nc[2]
    } else {
      noise[0] = C.paper[0] + (C.ink[0] - C.paper[0]) * nv
      noise[1] = C.paper[1] + (C.ink[1] - C.paper[1]) * nv
      noise[2] = C.paper[2] + (C.ink[2] - C.paper[2]) * nv
    }
    paint(f, i, noise, img, clean)
    const nh = 0.08 + 0.55 * g.r3[i]
    const h = nh + (ih - nh) * clean
    const lift = g.r3[i] * 1.3 * (1 - clean)
    put(f, i, g.x[i], lift, g.z[i], g.cube, h, g.cube)
  }
}

function voxels(g: Grid, f: Frame, c: Ctx) {
  const p = g.voxel
  const a = 0.55 + c.t * 0.3
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  const q = Math.PI / 2
  let rot = a % q
  if (rot > q / 2) rot -= q
  const plate = 0.06
  for (let i = 0; i < g.N; i++) {
    if (p.on[i]) {
      const X = p.vx[i]
      const Z = p.vz[i]
      const s = p.size * 0.94
      put(f, i, X * ca + Z * sa, plate + p.vy[i], -X * sa + Z * ca, s, s, s, rot)
      if (p.red[i]) paint(f, i, C.red, C.red, 0)
      else paint(f, i, C.ink, C.ink, 0)
    } else {
      const X = p.fx[i]
      const Z = p.fz[i]
      const s = p.hidden[i] ? 0.0001 : p.fcell * 0.9
      put(f, i, X * ca + Z * sa, 0, -X * sa + Z * ca, s, p.hidden[i] ? 0.0001 : plate, s, rot)
      paint(f, i, C.mask, C.mask, 0)
    }
  }
}

function spectrogram(g: Grid, f: Frame, c: Ctx) {
  const len = 1.4
  const sig = 0.7 / (g.G - 1)
  const inv = 1 / (2 * sig * sig)
  for (let i = 0; i < g.N; i++) {
    const fr = 1 - g.v[i]
    const tau = g.u[i] * 5 + c.t * 0.8
    const k = Math.floor(tau / len)
    let E = 0
    for (let back = 0; back < 2; back++) {
      const kk = k - back
      const lt = tau - kk * len
      const f0 = (0.1 + 0.05 * hash(kk)) * (1 + 0.03 * Math.sin(lt * 7 + kk))
      const env = Math.min(1, lt / 0.08) * (0.45 + 0.55 * Math.exp(-lt * 2)) * (back ? Math.exp(-lt * 2.5) : 1)
      for (let hN = 1; hN <= 10; hN++) {
        const fh = hN * f0
        if (fh > 1.02) break
        const d = fr - fh
        const formant = 0.6 + 0.4 * Math.exp(-(((fh - 0.35) / 0.18) ** 2))
        E += (1.25 * Math.exp(-d * d * inv) / Math.pow(hN, 0.4)) * formant * env
      }
    }
    E += 0.035 * g.r1[i] * (1 - fr * 0.6)
    E = Math.min(E, 1.2)
    const h = 0.04 + 1.25 * E
    paint(f, i, C.mask, C.ink, clamp01((E - 0.08) * 1.7))
    if (E > 0.85) {
      const j = i * 3
      const w = clamp01((E - 0.85) * 3)
      f.col[j] += (C.red[0] - f.col[j]) * w
      f.col[j + 1] += (C.red[1] - f.col[j + 1]) * w
      f.col[j + 2] += (C.red[2] - f.col[j + 2]) * w
    }
    put(f, i, g.x[i], 0, g.z[i], g.cube, h, g.cube)
  }
}

const PIECE_H: Record<string, number> = { p: 0.5, n: 0.8, b: 0.9, r: 0.72, q: 1.1, k: 1.3 }

const BOARD: (string | null)[] = (() => {
  const rows = [
    'r.bqkbnr',
    '.ppp.ppp',
    'p.n.....',
    '.B..p...',
    '....P...',
    '.....N..',
    'PPPP.PPP',
    'RNBQK..R'
  ]
  const b: (string | null)[] = new Array(64).fill(null)
  rows.forEach((row, r) => {
    const rank = 7 - r
    for (let file = 0; file < 8; file++) {
      const ch = row[file]
      b[rank * 8 + file] = ch === '.' ? null : ch
    }
  })
  return b
})()

function chess(g: Grid, f: Frame, c: Ctx) {
  const s = g.G / 8
  const P = (c.t * 0.28) % 2
  const byRank = P < 1
  const head = (P % 1) * 72
  const tile = 0.1
  for (let i = 0; i < g.N; i++) {
    const ix = g.ix[i]
    const iz = g.iz[i]
    const file = Math.floor(ix / s)
    const rank = 7 - Math.floor(iz / s)
    const lx = ix % s
    const lz = iz % s
    const order = byRank ? rank * 8 + file : file * 8 + rank
    const d = head - order
    const glow = d >= 0 && d < 8 ? Math.exp(-d * 0.42) : 0
    const dark = (file + rank) % 2 === 0
    const base = dark ? C.darkSq : C.lightSq
    const piece = BOARD[rank * 8 + file]
    const center = s >= 4 ? (lx === 1 || lx === 2) && (lz === 1 || lz === 2) : lx === 1 && lz === 1
    let h = tile + 0.14 * glow
    if (piece && center) {
      const type = piece.toLowerCase()
      h = tile + PIECE_H[type] + (type === 'n' && lx === 2 && lz === 1 ? 0.22 : 0)
      paint(f, i, piece === type ? C.ink : C.white, C.red, 0)
    } else {
      paint(f, i, base, C.red, glow * 0.9)
    }
    put(f, i, g.x[i], 0, g.z[i], g.cube, h, g.cube)
  }
}

type Box = { u0: number; u1: number; v0: number; v1: number }

const OBJECTS: { box: Box; height: (u: number, v: number) => number; col: RGB }[] = [
  {
    box: { u0: 0.19, u1: 0.35, v0: 0.3, v1: 0.52 },
    height: (u, v) => {
      const d = Math.hypot(u - 0.27, v - 0.41)
      return d < 0.07 ? 1.75 : 0
    },
    col: C.ink
  },
  {
    box: { u0: 0.44, u1: 0.83, v0: 0.51, v1: 0.77 },
    height: (u, v) => {
      if (u < 0.48 || u > 0.79 || v < 0.55 || v > 0.73) return 0
      return u > 0.56 && u < 0.72 ? 1.0 : 0.55
    },
    col: C.inkSoft
  },
  {
    box: { u0: 0.6, u1: 0.84, v0: 0.14, v1: 0.39 },
    height: (u, v) => {
      const d = Math.hypot(u - 0.72, v - 0.265) / 0.1
      return d < 1 ? 0.95 * Math.sqrt(1 - d * d) + 0.05 : 0
    },
    col: C.ink
  }
]

function detection(g: Grid, f: Frame, c: Ctx) {
  const G1 = g.G - 1
  for (let i = 0; i < g.N; i++) {
    const u = g.u[i]
    const v = g.v[i]
    const ix = g.ix[i]
    const iz = g.iz[i]
    let h = 0.05
    let done = false
    for (let k = 0; k < OBJECTS.length && !done; k++) {
      const o = OBJECTS[k]
      const oh = o.height(u, v)
      if (oh > 0) {
        h = 0.05 + oh
        paint(f, i, o.col, o.col, 0)
        done = true
        break
      }
      const x0 = Math.round(o.box.u0 * G1)
      const x1 = Math.round(o.box.u1 * G1)
      const z0 = Math.round(o.box.v0 * G1)
      const z1 = Math.round(o.box.v1 * G1)
      if (ix >= x0 && ix <= x1 && iz >= z0 && iz <= z1 && (ix === x0 || ix === x1 || iz === z0 || iz === z1)) {
        const ang = Math.atan2(iz - (z0 + z1) / 2, ix - (x0 + x1) / 2)
        const p = (ang + Math.PI) / (2 * Math.PI)
        const draw = clamp01(c.settle * 1.35 - k * 0.14)
        if (p <= draw) {
          h = 0.2 + 0.04 * Math.sin(c.t * 3 + k)
          paint(f, i, C.red, C.red, 0)
          done = true
        }
      }
    }
    if (!done) paint(f, i, C.mask, C.mask, 0)
    put(f, i, g.x[i], 0, g.z[i], g.cube, h, g.cube)
  }
}

export const STATES = [weights, attention, pixels, voxels, spectrogram, chess, detection]

export type Cam = { p: [number, number, number]; t: [number, number, number]; r: number; x?: number }

export const CAMS: Cam[] = [
  { p: [6.4, 8.4, 9.4], t: [0, 0.3, 0], r: 5.2, x: 0.2 },
  { p: [-6.4, 9.6, 8.4], t: [0, 0.3, 0.2], r: 4.85 },
  { p: [0.001, 13.4, 2.6], t: [0, 0, 0.15], r: 4.75 },
  { p: [6.2, 5.4, 8.8], t: [0, 1.3, 0], r: 3.9 },
  { p: [-3.2, 7.4, 10.6], t: [0, 0.3, 0], r: 4.6 },
  { p: [0, 9.8, 9.9], t: [0, 0, 0.4], r: 4.75 },
  { p: [6.4, 10.4, 7.0], t: [0, 0.4, 0], r: 4.8 }
]
