// ─── RNG determinístico (mulberry32) ─────────────────────────────────────────
// PRNG pequeno e reprodutível: mesma seed → mesma sequência. Usado para gerar as
// câmaras de cada torre a partir de `camaraSeed` (por-save), de modo que dois
// jogadores tenham câmaras diferentes — inviabilizando guias "faça X,Y,Z".
// Sem dependências externas (KISS). Interface `() => number` (0..1), injetável e
// testável, no mesmo espírito de `sortearRecompensaCamara(rng)`.

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash estável de string → uint32 (para derivar a seed do deviceId + salt).
export function hashSeed(str: string): number {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Rng derivado de uma seed base + um "canal" (ex.: andar) — dá independência
// entre andares mantendo tudo determinístico a partir da seed do save.
export function rngPara(seedBase: number, canal: number): Rng {
  return mulberry32((seedBase ^ Math.imul(canal + 1, 0x9e3779b1)) >>> 0);
}

export function rngInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function rngPick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function rngWeighted<T>(rng: Rng, entries: ReadonlyArray<{ item: T; peso: number }>): T {
  const total = entries.reduce((s, e) => s + e.peso, 0);
  let r = rng() * total;
  for (const e of entries) {
    r -= e.peso;
    if (r <= 0) return e.item;
  }
  return entries[entries.length - 1].item;
}
