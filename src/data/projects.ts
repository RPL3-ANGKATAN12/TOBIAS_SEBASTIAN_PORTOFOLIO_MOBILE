import { GH, HF } from './site'

export type Stat = [string, string]

export type Chapter = {
  id: string
  kind: string
  title: string
  repo: string
  text: string
  stats: Stat[]
  fig: string
  extra?: { label: string; href: string }
  also?: { title: string; repo: string; text: string }
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'cagliostro',
    kind: 'Language model',
    title: 'cagliostro-v3',
    repo: 'bench-labs/cagliostro-v3',
    text: 'A 146M parameter language model pretrained from scratch on 75B tokens of web, textbook and maths data. It lands within 0.58 Index of SmolLM2-135M, which saw roughly 27 times as many tokens.',
    stats: [['Parameters', '146M'], ['Tokens', '75B'], ['SLM Index', '26.55']],
    fig: 'Causal attention, one query row at a time',
    also: {
      title: 'tinctura-v1',
      repo: 'bench-labs/tinctura-v1',
      text: 'The same recipe at two thirds the size. 96.2M parameters, Index 20.81, 0.26 behind the best model under 100M.'
    }
  },
  {
    id: 'pixelmodel',
    kind: 'Text to image',
    title: 'PixelModel v6',
    repo: 'bench-labs/PixelModel-v6',
    text: 'A diffusion transformer that turns a sentence into a 256×256 image, using joint image and text attention, T5 text features and rectified flow. FID on 5,000 COCO images dropped from 34.06 in v5 to 23.62.',
    stats: [['Parameters', '155.1M'], ['Resolution', '256²'], ['COCO FID', '23.62']],
    fig: 'Noise flowing into an image along straight lines'
  },
  {
    id: 'voxelmodel',
    kind: 'Text to 3D',
    title: 'VoxelModel v1',
    repo: 'bench-labs/VoxelModel-v1',
    text: 'Short prompts become 32×32×32 occupancy grids. The diffusion transformer works on voxels directly, with no autoencoder in between, and takes its text conditioning from a frozen CLIP.',
    stats: [['Parameters', '40.05M'], ['Grid', '32³'], ['Training', '9.7 h']],
    fig: 'A chair, one cube per voxel'
  },
  {
    id: 'audiomodel',
    kind: 'Text to audio',
    title: 'AudioModel v1',
    repo: 'bench-labs/AudioModel-v1',
    text: 'Treats a mel spectrogram as an image and learns to generate it with a diffusion transformer and rectified flow, conditioned on CLAP. Each sample turns into 17.8 seconds of sound.',
    stats: [['Parameters', '40.3M'], ['Length', '17.8 s'], ['Training', '3.85 h']],
    fig: 'A spectrogram, harmonics stacked over time'
  },
  {
    id: 'chessmamba',
    kind: 'Chess evaluation',
    title: 'ChessMamba v2',
    repo: 'TobiasLogic/chessmamba-v2',
    text: 'A small evaluation model that reads the board with selective state-space scans along ranks and files. It learns judgement from human games and their results, with no engine labels and no hand-set piece values.',
    stats: [['Parameters', '4.3M'], ['Architecture', 'SSM'], ['Engine labels', 'None']],
    fig: 'A scan along the ranks, then the files',
    extra: { label: 'Play it in the arena', href: HF + 'spaces/TobiasLogic/chess-arena-gpu' }
  },
  {
    id: 'objectmodel',
    kind: 'Object detection',
    title: 'ObjectModel v1',
    repo: 'bench-labs/objectmodel-v1',
    text: 'An end-to-end detector with no NMS step. A fixed latent memory does the global reasoning, and query-conditioned sampling pulls geometry back out of full-resolution feature pyramids. 100 epochs on COCO, from scratch.',
    stats: [['Parameters', '40.8M'], ['Peak val AP', '0.358'], ['Speed', '32.5 FPS']],
    fig: 'One box per object, nothing to suppress'
  }
]

export type Item = {
  name: string
  href: string
  text: string
  tag: string
  hf?: string
  gh?: string
  space?: string
}

export const MORE: Item[] = [
  {
    name: 'Qwen2.5-Coder-32B abliterated',
    href: HF + 'TobiasLogic/Qwen2.5-Coder-32B-abliterated',
    text: 'The refusal direction projected out of the weights. The 4-bit GGUF lands about 3 points behind the base on HumanEval and edges past it on MBPP.',
    tag: 'Model',
    hf: 'TobiasLogic/Qwen2.5-Coder-32B-abliterated'
  },
  {
    name: 'aplotita',
    href: GH + '/aplotita',
    text: 'A terminal coding assistant with an animated TUI. It maps your codebase, runs tools and edits files, with whichever model you bring.',
    tag: 'JavaScript',
    gh: 'aplotita'
  },
  {
    name: 'famulus',
    href: GH + '/famulus',
    text: 'A Minecraft agent that gathers materials and builds schematics on request.',
    tag: 'Java',
    gh: 'famulus'
  },
  {
    name: 'SPFgraph',
    href: GH + '/SPFgraph',
    text: 'Run LLMs locally in your terminal, from GPT-2 .pt checkpoints to GGUF, with a live dashboard.',
    tag: 'JavaScript',
    gh: 'SPFgraph'
  },
  {
    name: 'ZeroShot-124M',
    href: GH + '/ZeroShot-124M',
    text: 'From random weights to a chatbot in 30 hours on one RTX 5060 Ti, for $6.77.',
    tag: 'Python',
    gh: 'ZeroShot-124M'
  },
  {
    name: 'ZeroShot-350M',
    href: GH + '/ZeroShot-350M',
    text: 'A 337M decoder trained from scratch. Pretraining, mid-training and SFT on one rented GPU for under $8.',
    tag: 'Python',
    gh: 'ZeroShot-350M'
  },
  {
    name: 'Museko-125M',
    href: HF + 'TobiasLogic/Museko-125M',
    text: 'A 123M Llama-style model trained on FineWeb-Edu with a little synthetic arithmetic mixed in.',
    tag: 'Model',
    hf: 'TobiasLogic/Museko-125M'
  },
  {
    name: 'Chess Arena',
    href: HF + 'spaces/TobiasLogic/chess-arena-gpu',
    text: 'Any chess model on the Hub, playing each other and you.',
    tag: 'Space',
    space: 'TobiasLogic/chess-arena-gpu'
  },
  {
    name: 'webgl-volumetric-stress',
    href: GH + '/webgl-volumetric-stress',
    text: 'A raymarched Mandelbulb in raw WebGL and GLSL, all in a single HTML file.',
    tag: 'HTML',
    gh: 'webgl-volumetric-stress'
  },
  {
    name: 'rustfetch',
    href: GH + '/rustfetch',
    text: 'A system info tool in Rust, in the spirit of neofetch.',
    tag: 'Rust',
    gh: 'rustfetch'
  },
  {
    name: 'system-sweeper',
    href: GH + '/system-sweeper',
    text: 'A friendly cleanup tool in Rust, with a small pet companion.',
    tag: 'Rust',
    gh: 'system-sweeper'
  }
]

export const EARLIER: { name: string; href: string }[] = [
  { name: 'cagliostro-v1', href: HF + 'bench-labs/cagliostro-v1' },
  { name: 'cagliostro-v2', href: HF + 'bench-labs/cagliostro-v2' },
  { name: 'PixelModel v5', href: HF + 'bench-labs/PixelModel-v5' },
  { name: 'PixelModel v4', href: HF + 'bench-labs/PixelModel-v4' },
  { name: 'PixelModel v3', href: HF + 'bench-labs/PixelModel-v3' },
  { name: 'TextModel-v1', href: HF + 'TobiasLogic/TextModel-v1' },
  { name: 'GCTokenizer-v1', href: HF + 'bench-labs/GCTokenizer-v1' },
  { name: 'ChessMamba v1', href: HF + 'TobiasLogic/chessmamba' }
]
