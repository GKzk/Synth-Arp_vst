import type { ArpMode, ScaleName } from "./types";

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const SCALES: Record<ScaleName, readonly number[]> = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  pentMajor: [0, 2, 4, 7, 9],
  pentMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  whole: [0, 2, 4, 6, 8, 10],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11],
};

export const SCALE_ORDER: ScaleName[] = [
  "minor",
  "major",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "locrian",
  "harmonicMinor",
  "melodicMinor",
  "pentMinor",
  "pentMajor",
  "blues",
  "whole",
  "diminished",
  "chromatic",
];

export const SCALE_LABELS: Record<ScaleName, string> = {
  chromatic: "Хроматика",
  major: "Мажор",
  minor: "Минор",
  dorian: "Дорийский",
  phrygian: "Фригийский",
  lydian: "Лидийский",
  mixolydian: "Миксолидийский",
  locrian: "Локрийский",
  harmonicMinor: "Гарм. минор",
  melodicMinor: "Мелод. минор",
  pentMajor: "Пента мажор",
  pentMinor: "Пента минор",
  blues: "Блюз",
  whole: "Целотоновая",
  diminished: "Уменьшённая",
};

export const MODE_LABELS: Record<ArpMode, string> = {
  up: "Вверх",
  down: "Вниз",
  updown: "Вверх-вниз",
  downup: "Вниз-вверх",
  played: "Как сыграно",
  random: "Случайно",
  converge: "К центру",
  diverge: "От центра",
  chord: "Аккорд",
};

export function clamp(n: number, a: number, b: number): number {
  if (!Number.isFinite(n)) return a;
  return Math.min(b, Math.max(a, n));
}

export function mod(n: number, m: number): number {
  if (m <= 0) return 0;
  return ((n % m) + m) % m;
}

export function midiToName(midi: number): string {
  const n = Math.round(midi);
  const pc = mod(n, 12);
  const oct = Math.floor(n / 12) - 1;
  return `${NOTE_NAMES[pc]}${oct}`;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function scaleDegreeToSemi(scale: readonly number[], degree: number): number {
  const len = scale.length || 1;
  const wrapped = mod(degree, len);
  const oct = Math.floor(degree / len);
  return scale[wrapped] + oct * 12;
}

export function nearestInScale(midi: number, rootPc: number, scale: readonly number[]): number {
  const rel = mod(Math.round(midi) - rootPc, 12);
  if (scale.includes(rel)) return Math.round(midi);
  let best = Math.round(midi);
  let bestDist = 99;
  for (let d = -6; d <= 6; d++) {
    const cand = Math.round(midi) + d;
    const crel = mod(cand - rootPc, 12);
    if (scale.includes(crel) && Math.abs(d) < bestDist) {
      best = cand;
      bestDist = Math.abs(d);
    }
  }
  return best;
}

export function foldMidi(midi: number, low: number, high: number): number {
  let n = Math.round(midi);
  if (high - low < 11) return clamp(n, 0, 127);
  let guard = 0;
  while (n > high && guard++ < 24) n -= 12;
  guard = 0;
  while (n < low && guard++ < 24) n += 12;
  return clamp(n, 0, 127);
}

/** Evenly spaced hits. Rotates so a hit lands on step 0 when there is at least one. */
export function euclidean(pulses: number, steps: number, rotate = 0): boolean[] {
  const s = Math.max(1, Math.floor(steps));
  const p = clamp(Math.floor(pulses), 0, s);
  const out = Array<boolean>(s).fill(false);
  if (p === 0) return out;
  let bucket = 0;
  for (let i = 0; i < s; i++) {
    bucket += p;
    if (bucket >= s) {
      bucket -= s;
      out[i] = true;
    }
  }
  let aligned = out;
  if (!aligned[0]) {
    const first = aligned.indexOf(true);
    aligned = aligned.map((_, i) => out[(i + first) % s]);
  }
  const r = mod(rotate, s);
  if (r === 0) return aligned;
  return aligned.map((_, i) => aligned[mod(i - r, s)]);
}

export function buildSequence(notes: number[], mode: ArpMode, octaves: number, played: number[]): number[] {
  const oct = clamp(Math.round(octaves), 1, 5);
  const unique = [...new Set(notes.filter((n) => n >= 0 && n <= 127))].sort((a, b) => a - b);
  if (unique.length === 0) return [];
  const playedUnique: number[] = [];
  for (const n of played) if (unique.includes(n) && !playedUnique.includes(n)) playedUnique.push(n);
  const base = mode === "played" && playedUnique.length ? playedUnique : unique;
  const expanded: number[] = [];
  for (let o = 0; o < oct; o++) {
    for (const n of base) {
      const v = n + 12 * o;
      if (v <= 127) expanded.push(v);
    }
  }
  if (expanded.length === 0) return [];
  switch (mode) {
    case "down":
      return [...expanded].reverse();
    case "updown":
      return pendulum(expanded);
    case "downup":
      return pendulum([...expanded].reverse());
    case "converge":
      return converge(expanded);
    case "diverge":
      return diverge(expanded);
    default:
      return expanded;
  }
}

function pendulum(exp: number[]): number[] {
  if (exp.length < 2) return exp;
  const down = exp.slice(0, -1).reverse().slice(0, -1);
  return [...exp, ...down];
}

function converge(exp: number[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = exp.length - 1;
  while (i <= j) {
    out.push(exp[i]);
    i += 1;
    if (i <= j) {
      out.push(exp[j]);
      j -= 1;
    }
  }
  return out;
}

function diverge(exp: number[]): number[] {
  const out: number[] = [];
  const mid = Math.floor((exp.length - 1) / 2);
  let left = mid;
  let right = exp.length % 2 === 1 ? mid + 1 : mid + 1;
  if (exp.length % 2 === 1) {
    out.push(exp[mid]);
    left = mid - 1;
  } else {
    left = mid;
    right = mid + 1;
  }
  while (left >= 0 || right < exp.length) {
    if (right < exp.length) {
      out.push(exp[right]);
      right += 1;
    }
    if (left >= 0) {
      out.push(exp[left]);
      left -= 1;
    }
  }
  return out;
}

export function stepBeats(pattern: { rate: number; triplet: boolean; dotted: boolean }): number {
  const rate = clamp(pattern.rate, 1, 32);
  let beats = 4 / rate;
  if (pattern.triplet) beats *= 2 / 3;
  else if (pattern.dotted) beats *= 1.5;
  return beats;
}

export function stepSeconds(bpm: number, pattern: { rate: number; triplet: boolean; dotted: boolean }): number {
  return stepBeats(pattern) * (60 / clamp(bpm, 20, 300));
}
