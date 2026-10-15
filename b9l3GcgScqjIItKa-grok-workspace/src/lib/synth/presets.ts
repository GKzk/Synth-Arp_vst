import { defaultPattern, makeStep } from "./pattern";
import type { Pattern, Snapshot, Step, SynthParams } from "./types";

export function defaultSynth(): SynthParams {
  return {
    osc1: { wave: "sawtooth", oct: 0, detune: -4, level: 0.52 },
    osc2: { wave: "triangle", oct: 0, detune: 7, level: 0.26 },
    sub: { wave: "sine", oct: -1, level: 0.2 },
    noise: 0.02,
    filter: { type: "lowpass", cutoff: 2100, q: 0.85, env: 1600, keytrack: 0.3 },
    amp: { a: 0.006, d: 0.18, s: 0.28, r: 0.26 },
    fenv: { a: 0.004, d: 0.22, s: 0.18, r: 0.28 },
    lfo: { rate: 0.25, wave: "sine", dest: "cutoff", depth: 0.12 },
    glide: 0,
    drive: 0.05,
    delay: { mix: 0.16, beats: 0.75, feedback: 0.28 },
    reverb: 0.14,
    width: 0.4,
    master: 0.78,
    engineOn: true,
  };
}

type SynthOver = {
  osc1?: Partial<SynthParams["osc1"]>;
  osc2?: Partial<SynthParams["osc2"]>;
  sub?: Partial<SynthParams["sub"]>;
  filter?: Partial<SynthParams["filter"]>;
  amp?: Partial<SynthParams["amp"]>;
  fenv?: Partial<SynthParams["fenv"]>;
  lfo?: Partial<SynthParams["lfo"]>;
  delay?: Partial<SynthParams["delay"]>;
  noise?: number;
  glide?: number;
  drive?: number;
  reverb?: number;
  width?: number;
  master?: number;
};

function synth(over: SynthOver = {}): SynthParams {
  const base = defaultSynth();
  return {
    ...base,
    noise: over.noise ?? base.noise,
    glide: over.glide ?? base.glide,
    drive: over.drive ?? base.drive,
    reverb: over.reverb ?? base.reverb,
    width: over.width ?? base.width,
    master: over.master ?? base.master,
    osc1: { ...base.osc1, ...over.osc1 },
    osc2: { ...base.osc2, ...over.osc2 },
    sub: { ...base.sub, ...over.sub },
    filter: { ...base.filter, ...over.filter },
    amp: { ...base.amp, ...over.amp },
    fenv: { ...base.fenv, ...over.fenv },
    lfo: { ...base.lfo, ...over.lfo },
    delay: { ...base.delay, ...over.delay },
  };
}

function stepsOf(length: number, paint: (i: number) => Partial<Step>): Step[] {
  return Array.from({ length: 32 }, (_, i) => makeStep(i < length ? paint(i) : { on: false }));
}

function pattern(partial: Partial<Pattern>, length: number, paint: (i: number) => Partial<Step>): Pattern {
  return { ...defaultPattern(), ...partial, length, steps: stepsOf(length, paint) };
}

function pack(opts: { bpm: number; octave: number; latch?: boolean; synth: SynthParams; main: Pattern }): Snapshot {
  const main = structuredClone(opts.main);
  return {
    bpm: opts.bpm,
    latch: opts.latch ?? true,
    octave: opts.octave,
    patternIndex: 0,
    patterns: Array.from({ length: 8 }, () => structuredClone(main)),
    synth: opts.synth,
    chainEnabled: false,
    chain: [0, 1, 2, 3],
  };
}

export type FactoryPreset = { id: string; name: string; blurb: string; snap: Snapshot };

export const factoryPresets: FactoryPreset[] = [
  {
    id: "glass",
    name: "Стекло",
    blurb: "Светлый мажорный перебор на две октавы",
    snap: pack({
      bpm: 118,
      octave: 4,
      synth: synth({
        osc1: { wave: "sawtooth", level: 0.4 },
        osc2: { wave: "triangle", detune: 8, level: 0.34 },
        filter: { cutoff: 2800, q: 0.7, env: 1400 },
        amp: { a: 0.004, d: 0.16, s: 0.22, r: 0.32 },
        delay: { mix: 0.22, beats: 0.75, feedback: 0.34 },
        reverb: 0.2,
      }),
      main: pattern(
        {
          harmony: "arp",
          mode: "up",
          octaves: 2,
          rate: 16,
          gate: 0.58,
          swing: 0.06,
          scale: "major",
          fallback: [60, 64, 67, 71],
          humanize: 0.05,
        },
        16,
        (i) => ({
          on: true,
          vel: i % 4 === 0 ? 120 : 84,
          accent: i % 4 === 0,
          gate: i % 2 === 0 ? 0.7 : 0.46,
        }),
      ),
    }),
  },
  {
    id: "acid",
    name: "Кислота",
    blurb: "Резонансная линия по минору со слайдами",
    snap: pack({
      bpm: 136,
      octave: 3,
      synth: synth({
        osc1: { wave: "sawtooth", level: 0.72, detune: 0 },
        osc2: { level: 0 },
        sub: { level: 0.08 },
        noise: 0,
        filter: { type: "lowpass", cutoff: 280, q: 14, env: 3200, keytrack: 0.15 },
        amp: { a: 0.003, d: 0.12, s: 0.05, r: 0.08 },
        fenv: { a: 0.003, d: 0.18, s: 0.08, r: 0.1 },
        glide: 0.07,
        drive: 0.22,
        delay: { mix: 0.08, beats: 0.75, feedback: 0.2 },
        reverb: 0.04,
        lfo: { dest: "off", depth: 0, rate: 0.2, wave: "sine" },
      }),
      main: pattern(
        {
          harmony: "scale",
          mode: "up",
          scale: "minor",
          octaves: 1,
          rate: 16,
          gate: 0.7,
          swing: 0.04,
          fallback: [48],
          followRoot: true,
        },
        16,
        (i) => {
          const degrees = [0, 0, 7, 0, 3, 7, 10, 7, 0, 3, 7, 10, 7, 3, -2, 0];
          const slides = [false, true, false, false, true, false, true, false, false, true, false, false, true, false, false, true];
          return { on: true, semi: degrees[i], slide: slides[i], vel: i % 4 === 0 ? 122 : 96, accent: i % 8 === 0 };
        },
      ),
    }),
  },
  {
    id: "weave",
    name: "Плетение",
    blurb: "Шаги выбирают ноты зажатого аккорда",
    snap: pack({
      bpm: 112,
      octave: 3,
      synth: synth({
        osc1: { wave: "square", level: 0.28 },
        osc2: { wave: "triangle", level: 0.36, detune: 4 },
        filter: { cutoff: 1600, q: 1.1, env: 900 },
        amp: { a: 0.01, d: 0.24, s: 0.4, r: 0.35 },
        reverb: 0.22,
        delay: { mix: 0.18, beats: 0.5, feedback: 0.3 },
      }),
      main: pattern(
        {
          harmony: "index",
          scale: "minor",
          rate: 16,
          gate: 0.66,
          swing: 0.1,
          fallback: [48, 51, 55, 58],
          octaves: 1,
        },
        16,
        (i) => {
          const idx = [0, 1, 2, 1, 0, 2, 3, 1, 2, 0, 1, 3, 2, 1, 0, 2];
          const oct = [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1];
          return { on: i % 7 !== 5, semi: idx[i], oct: oct[i], vel: 100 };
        },
      ),
    }),
  },
  {
    id: "house",
    name: "Дом",
    blurb: "Короткие аккордовые стабы",
    snap: pack({
      bpm: 124,
      octave: 4,
      synth: synth({
        osc1: { wave: "sawtooth", level: 0.48 },
        osc2: { wave: "square", level: 0.18, oct: -1 },
        filter: { cutoff: 900, q: 2.4, env: 2800 },
        amp: { a: 0.003, d: 0.09, s: 0, r: 0.08 },
        fenv: { a: 0.003, d: 0.12, s: 0.05, r: 0.1 },
        drive: 0.12,
        delay: { mix: 0.1, beats: 0.75, feedback: 0.22 },
        reverb: 0.08,
      }),
      main: pattern(
        {
          harmony: "arp",
          mode: "chord",
          octaves: 1,
          rate: 16,
          gate: 0.42,
          swing: 0,
          strum: 0.014,
          fallback: [60, 63, 67, 70],
          scale: "minor",
        },
        16,
        (i) => ({ on: [0, 3, 6, 8, 11, 14].includes(i), vel: i % 8 === 0 ? 124 : 100, accent: i % 8 === 0 }),
      ),
    }),
  },
  {
    id: "berlin",
    name: "Берлин",
    blurb: "Трёхоктавный пилообразный пульс",
    snap: pack({
      bpm: 128,
      octave: 3,
      synth: synth({
        osc1: { wave: "supersaw", level: 0.46, detune: -6 },
        osc2: { wave: "sawtooth", level: 0.22, detune: 10, oct: 0 },
        filter: { cutoff: 1400, q: 1.4, env: 700 },
        amp: { a: 0.004, d: 0.14, s: 0.45, r: 0.18 },
        lfo: { dest: "cutoff", rate: 0.15, depth: 0.28, wave: "sine" },
        delay: { mix: 0.2, beats: 0.5, feedback: 0.36 },
        reverb: 0.1,
        drive: 0.08,
      }),
      main: pattern(
        {
          harmony: "arp",
          mode: "updown",
          octaves: 3,
          rate: 16,
          gate: 0.48,
          swing: 0.12,
          scale: "minor",
          quantize: true,
          fallback: [48, 51, 55],
        },
        16,
        () => ({ on: true, vel: 104 }),
      ),
    }),
  },
  {
    id: "spark",
    name: "Искра",
    blurb: "Случайные брызги с дилеем",
    snap: pack({
      bpm: 108,
      octave: 5,
      synth: synth({
        osc1: { wave: "sine", level: 0.4, oct: 1 },
        osc2: { wave: "triangle", level: 0.28, detune: 12 },
        sub: { level: 0 },
        filter: { cutoff: 4200, q: 0.6, env: 800 },
        amp: { a: 0.003, d: 0.2, s: 0, r: 0.4 },
        delay: { mix: 0.34, beats: 0.75, feedback: 0.46 },
        reverb: 0.28,
        width: 0.7,
      }),
      main: pattern(
        {
          harmony: "arp",
          mode: "random",
          octaves: 2,
          rate: 16,
          gate: 0.36,
          swing: 0,
          fallback: [72, 76, 79, 84],
          scale: "pentMajor",
          quantize: true,
          humanize: 0.15,
        },
        16,
        (i) => ({
          on: true,
          prob: i % 4 === 0 ? 100 : 42 + ((i * 17) % 40),
          vel: 70 + ((i * 13) % 50),
          oct: i % 5 === 0 ? 1 : 0,
        }),
      ),
    }),
  },
  {
    id: "night",
    name: "Ночь",
    blurb: "Евклидов рисунок, длинный хвост",
    snap: pack({
      bpm: 96,
      octave: 3,
      synth: synth({
        osc1: { wave: "sawtooth", level: 0.32, oct: -1 },
        osc2: { wave: "sine", level: 0.24 },
        filter: { cutoff: 700, q: 1.6, env: 500 },
        amp: { a: 0.02, d: 0.4, s: 0.55, r: 0.9 },
        fenv: { a: 0.05, d: 0.5, s: 0.3, r: 0.8 },
        lfo: { dest: "cutoff", rate: 0.08, depth: 0.22, wave: "triangle" },
        delay: { mix: 0.26, beats: 1, feedback: 0.4 },
        reverb: 0.36,
      }),
      main: pattern(
        {
          harmony: "arp",
          mode: "up",
          octaves: 2,
          rate: 8,
          gate: 1.15,
          swing: 0,
          scale: "dorian",
          quantize: true,
          euclidHits: 5,
          fallback: [48, 55, 62],
        },
        16,
        (i) => {
          const hits = [0, 3, 6, 10, 13];
          return { on: hits.includes(i), vel: 108, gate: 1 };
        },
      ),
    }),
  },
  {
    id: "ratchet",
    name: "Рэтчет",
    blurb: "Повтор нот внутри шага, сухой техно-бас",
    snap: pack({
      bpm: 132,
      octave: 2,
      synth: synth({
        osc1: { wave: "sawtooth", level: 0.62, oct: -1 },
        osc2: { wave: "square", level: 0.16, oct: -1, detune: 3 },
        sub: { wave: "square", oct: -1, level: 0.28 },
        filter: { cutoff: 480, q: 6, env: 1800, keytrack: 0.2 },
        amp: { a: 0.003, d: 0.07, s: 0.1, r: 0.06 },
        fenv: { a: 0.003, d: 0.09, s: 0.12, r: 0.08 },
        drive: 0.28,
        delay: { mix: 0.06, beats: 0.375, feedback: 0.18 },
        reverb: 0.03,
        lfo: { dest: "off", depth: 0, rate: 0.2, wave: "sine" },
      }),
      main: pattern(
        {
          harmony: "arp",
          mode: "up",
          octaves: 2,
          rate: 16,
          gate: 0.4,
          swing: 0.05,
          fallback: [36, 43],
          scale: "minor",
          foldLow: 24,
          foldHigh: 72,
        },
        16,
        (i) => {
          const rats = [2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 1, 2, 1, 4, 1, 1];
          return { on: true, ratchet: rats[i], vel: i % 4 === 0 ? 124 : 90, accent: rats[i] > 2 };
        },
      ),
    }),
  },
];

export function cloneSnap(snap: Snapshot): Snapshot {
  return structuredClone(snap);
}
