import type { ArpState, Pattern, Step, TimedNote } from "./types";
import {
  SCALES,
  buildSequence,
  clamp,
  euclidean,
  foldMidi,
  mod,
  nearestInScale,
  scaleDegreeToSemi,
} from "./theory";

export function makeStep(partial: Partial<Step> = {}): Step {
  return {
    on: true,
    semi: 0,
    oct: 0,
    vel: 100,
    gate: 0.8,
    prob: 100,
    ratchet: 1,
    accent: false,
    slide: false,
    ...partial,
  };
}

export function defaultPattern(): Pattern {
  return {
    length: 16,
    steps: Array.from({ length: 32 }, (_, i) =>
      makeStep({
        on: i < 16,
        vel: i % 4 === 0 ? 116 : 88,
        accent: i % 4 === 0,
        gate: i % 2 === 0 ? 0.72 : 0.5,
      }),
    ),
    mode: "up",
    harmony: "arp",
    rate: 16,
    triplet: false,
    dotted: false,
    octaves: 2,
    gate: 0.62,
    swing: 0.08,
    strum: 0,
    humanize: 0.04,
    scale: "minor",
    root: 0,
    followRoot: true,
    quantize: false,
    euclidHits: 5,
    euclidRot: 0,
    fallback: [60, 64, 67, 71],
    useFallback: true,
    foldLow: 36,
    foldHigh: 96,
  };
}

export function currentNotes(args: {
  held: number[];
  latched: number[];
  latch: boolean;
  pattern: Pattern;
}): number[] {
  if (args.held.length) return args.held;
  if (args.latch && args.latched.length) return args.latched;
  if (args.pattern.useFallback && args.pattern.fallback.length) return args.pattern.fallback;
  return [];
}

function scaleRootMidi(pattern: Pattern, active: number[]): number {
  if (pattern.followRoot && active.length) return Math.min(...active);
  const pc = mod(pattern.root, 12);
  if (!active.length) return 48 + pc;
  const low = Math.min(...active);
  let rootMidi = low - mod(low, 12) + pc;
  if (rootMidi > low) rootMidi -= 12;
  return rootMidi;
}

function resolveMidis(
  pattern: Pattern,
  step: Step,
  active: number[],
  played: number[],
  arp: ArpState,
  rng: () => number,
): { list: number[]; arp: ArpState } {
  const scale = SCALES[pattern.scale] ?? SCALES.minor;
  let list: number[] = [];
  let cursor = arp.cursor;

  if (pattern.harmony === "scale") {
    const root = scaleRootMidi(pattern, active);
    list = [root + scaleDegreeToSemi(scale, step.semi) + step.oct * 12];
  } else if (pattern.harmony === "index") {
    const sorted = [...active].sort((a, b) => a - b);
    list = [sorted[mod(step.semi, sorted.length)] + step.oct * 12];
  } else {
    const seq = buildSequence(active, pattern.mode, pattern.octaves, played);
    if (seq.length === 0) return { list: [], arp };
    if (pattern.mode === "chord") {
      list = seq.map((n) => n + step.oct * 12 + step.semi);
    } else if (pattern.mode === "random") {
      list = [seq[Math.floor(rng() * seq.length)] + step.oct * 12 + step.semi];
    } else {
      list = [seq[mod(cursor, seq.length)] + step.oct * 12 + step.semi];
      cursor += 1;
    }
    if (pattern.quantize) {
      const rootPc =
        pattern.followRoot && active.length ? mod(Math.min(...active), 12) : mod(pattern.root, 12);
      list = list.map((n) => nearestInScale(n, rootPc, scale));
    }
  }

  list = list.map((n) => foldMidi(n, pattern.foldLow, pattern.foldHigh));
  return { list, arp: { cursor } };
}

export function scheduleStep(opts: {
  pattern: Pattern;
  stepIndex: number;
  stepTime: number;
  stepDur: number;
  active: number[];
  played: number[];
  arp: ArpState;
  rng: () => number;
}): { notes: TimedNote[]; arp: ArpState } {
  const { pattern, stepDur, active, played, rng } = opts;
  const length = clamp(Math.round(pattern.length), 1, 32);
  const stepIndex = mod(opts.stepIndex, length);
  const step = pattern.steps[stepIndex] ?? makeStep({ on: false });
  if (!step.on || active.length === 0 || rng() * 100 > clamp(step.prob, 0, 100)) {
    return { notes: [], arp: opts.arp };
  }

  const resolved = resolveMidis(pattern, step, active, played, opts.arp, rng);
  if (resolved.list.length === 0) return { notes: [], arp: resolved.arp };

  const swung = opts.stepTime + (stepIndex % 2 === 1 ? stepDur * clamp(pattern.swing, 0, 0.6) : 0);
  const ratchet = clamp(Math.round(step.ratchet), 1, 4);
  const notes: TimedNote[] = [];
  for (let r = 0; r < ratchet; r++) {
    const sliceT = swung + (stepDur / ratchet) * r;
    const human = (rng() - 0.5) * clamp(pattern.humanize, 0, 1) * 0.014;
    let dur = stepDur * clamp(pattern.gate, 0.05, 1.8) * clamp(step.gate, 0.05, 1.8);
    if (ratchet > 1) dur = Math.min(dur, (stepDur / ratchet) * 0.92);
    dur = Math.max(0.03, dur);
    const velJ = 1 + (rng() - 0.5) * clamp(pattern.humanize, 0, 1) * 0.3;
    const vel = clamp((clamp(step.vel, 1, 127) / 127) * (step.accent ? 1.16 : 1) * velJ, 0.05, 1);
    resolved.list.forEach((midi, i) => {
      notes.push({
        midi,
        vel,
        time: sliceT + human + (resolved.list.length > 1 ? i * clamp(pattern.strum, 0, 0.05) : 0),
        dur,
        slide: step.slide,
        accent: step.accent,
      });
    });
  }
  return { notes, arp: resolved.arp };
}

export function applyEuclid(pattern: Pattern): Step[] {
  const mask = euclidean(pattern.euclidHits, pattern.length, pattern.euclidRot);
  return pattern.steps.map((step, i) => (i < pattern.length ? { ...step, on: mask[i] ?? false } : step));
}

export function randomRhythm(pattern: Pattern, rng: () => number = Math.random): Step[] {
  return pattern.steps.map((step, i) => {
    if (i >= pattern.length) return step;
    return { ...step, on: i === 0 || rng() < 0.62 };
  });
}

export function randomMelody(pattern: Pattern, rng: () => number = Math.random): Step[] {
  let cursor = 0;
  const jumps = [0, 0, 1, -1, 2, -2, 3, 4, -3];
  return pattern.steps.map((step, i) => {
    if (i >= pattern.length) return step;
    cursor = clamp(cursor + jumps[Math.floor(rng() * jumps.length)], -7, 9);
    return { ...step, semi: cursor };
  });
}

export function mutateSteps(pattern: Pattern, rng: () => number = Math.random): Step[] {
  const steps = pattern.steps.map((step) => ({ ...step }));
  const edits = 2 + Math.floor(rng() * 3);
  for (let k = 0; k < edits; k++) {
    const i = Math.floor(rng() * pattern.length);
    const roll = rng();
    const step = steps[i];
    if (!step) continue;
    if (roll < 0.34) steps[i] = { ...step, on: !step.on };
    else if (roll < 0.7) steps[i] = { ...step, semi: clamp(step.semi + (rng() < 0.5 ? -1 : 1), -12, 12) };
    else steps[i] = { ...step, vel: clamp(step.vel + (rng() < 0.5 ? -14 : 14), 24, 127) };
  }
  return steps;
}

export function shiftSteps(pattern: Pattern, direction: number): Step[] {
  const len = pattern.length;
  const head = pattern.steps.slice(0, len);
  const next = head.map((_, i) => head[mod(i - direction, len)]);
  return pattern.steps.map((step, i) => (i < len ? { ...next[i] } : step));
}

export function reverseSteps(pattern: Pattern): Step[] {
  const head = pattern.steps.slice(0, pattern.length).reverse();
  return pattern.steps.map((step, i) => (i < pattern.length ? { ...head[i] } : step));
}

export function setAllOn(pattern: Pattern, on: boolean): Step[] {
  return pattern.steps.map((step, i) => (i < pattern.length ? { ...step, on } : step));
}
