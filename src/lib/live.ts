import { onMounted, ref } from 'vue'

export type Live = {
  hf: Record<string, { downloads: number; likes: number }>
  gh: Record<string, number>
  spaces: Record<string, number>
}

const FALLBACK: Live = {
  hf: {
    'bench-labs/cagliostro-v3': { downloads: 1816, likes: 34 },
    'bench-labs/tinctura-v1': { downloads: 462, likes: 11 },
    'bench-labs/PixelModel-v6': { downloads: 88, likes: 20 },
    'bench-labs/VoxelModel-v1': { downloads: 62, likes: 21 },
    'bench-labs/AudioModel-v1': { downloads: 37, likes: 10 },
    'bench-labs/objectmodel-v1': { downloads: 35, likes: 10 },
    'TobiasLogic/chessmamba-v2': { downloads: 101, likes: 4 },
    'TobiasLogic/Qwen2.5-Coder-32B-abliterated': { downloads: 795, likes: 9 },
    'TobiasLogic/Museko-125M': { downloads: 239, likes: 9 }
  },
  gh: {
    aplotita: 3,
    famulus: 1,
    SPFgraph: 3,
    'ZeroShot-124M': 2,
    'ZeroShot-350M': 4,
    'webgl-volumetric-stress': 1,
    rustfetch: 1,
    'system-sweeper': 1
  },
  spaces: { 'TobiasLogic/chess-arena-gpu': 8 }
}

type HFModel = { id: string; likes?: number; downloadsAllTime?: number }
type GHRepo = { name: string; stargazers_count: number }

async function json<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url)
    return r.ok ? ((await r.json()) as T) : null
  } catch {
    return null
  }
}

const KEY = 'live-counts'
const MAX_AGE = 60 * 60 * 1000

function cached(): Live | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const { at, data } = JSON.parse(raw) as { at: number; data: Live }
    return Date.now() - at < MAX_AGE ? data : null
  } catch {
    return null
  }
}

function remember(data: Live) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {
    return
  }
}

const hit = typeof localStorage !== 'undefined' ? cached() : null
const live = ref<Live>(hit ?? FALLBACK)
let loaded = hit !== null

async function load() {
  const models = (author: string) =>
    json<HFModel[]>(`https://huggingface.co/api/models?author=${author}&limit=100&expand[]=downloadsAllTime&expand[]=likes`)
  const [a, b, repos, arena] = await Promise.all([
    models('bench-labs'),
    models('TobiasLogic'),
    json<GHRepo[]>('https://api.github.com/users/TobiasLogic/repos?per_page=100'),
    json<{ likes?: number }>('https://huggingface.co/api/spaces/TobiasLogic/chess-arena-gpu')
  ])
  const prev = live.value
  const next: Live = { hf: { ...prev.hf }, gh: { ...prev.gh }, spaces: { ...prev.spaces } }
  for (const m of [...(a ?? []), ...(b ?? [])]) {
    if (typeof m.downloadsAllTime === 'number') {
      next.hf[m.id] = { downloads: m.downloadsAllTime, likes: m.likes ?? 0 }
    }
  }
  for (const r of repos ?? []) next.gh[r.name] = r.stargazers_count
  if (arena && typeof arena.likes === 'number') next.spaces['TobiasLogic/chess-arena-gpu'] = arena.likes
  live.value = next
  if (a || b || repos) remember(next)
}

export function useLive() {
  onMounted(() => {
    if (loaded) return
    loaded = true
    load()
  })
  return live
}

export const fmt = (n: number) => n.toLocaleString('en-US')
