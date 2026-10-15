export type Wave = "sine" | "triangle" | "sawtooth" | "square" | "supersaw";
export type SimpleWave = "sine" | "triangle" | "sawtooth" | "square";
export type ArpMode =
  | "up"
  | "down"
  | "updown"
  | "downup"
  | "played"
  | "random"
  | "converge"
  | "diverge"
  | "chord";
export type Harmony = "arp" | "scale" | "index";
export type ScaleName =
  | "chromatic"
  | "major"
  | "minor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "locrian"
  | "harmonicMinor"
  | "melodicMinor"
  | "pentMajor"
  | "pentMinor"
  | "blues"
  | "whole"
  | "diminished";

export type OscParams = {
  wave: Wave;
  oct: number;
  detune: number;
  level: number;
};

export type ADSR = { a: number; d: number; s: number; r: number };

export type SynthParams = {
  osc1: OscParams;
  osc2: OscParams;
  sub: { wave: "sine" | "square"; oct: -1 | -2; level: number };
  noise: number;
  filter: {
    type: "lowpass" | "highpass" | "bandpass";
    cutoff: number;
    q: number;
    env: number;
    keytrack: number;
  };
  amp: ADSR;
  fenv: ADSR;
  lfo: { rate: number; wave: SimpleWave; dest: "off" | "pitch" | "cutoff" | "amp"; depth: number };
  glide: number;
  drive: number;
  delay: { mix: number; beats: number; feedback: number };
  reverb: number;
  width: number;
  master: number;
  engineOn: boolean;
};

export type Step = {
  on: boolean;
  semi: number;
  oct: number;
  vel: number;
  gate: number;
  prob: number;
  ratchet: number;
  accent: boolean;
  slide: boolean;
};

export type Pattern = {
  length: number;
  steps: Step[];
  mode: ArpMode;
  harmony: Harmony;
  rate: number;
  triplet: boolean;
  dotted: boolean;
  octaves: number;
  gate: number;
  swing: number;
  strum: number;
  humanize: number;
  scale: ScaleName;
  root: number;
  followRoot: boolean;
  quantize: boolean;
  euclidHits: number;
  euclidRot: number;
  fallback: number[];
  useFallback: boolean;
  foldLow: number;
  foldHigh: number;
};

export type Snapshot = {
  bpm: number;
  latch: boolean;
  octave: number;
  patternIndex: number;
  patterns: Pattern[];
  synth: SynthParams;
  chainEnabled: boolean;
  chain: number[];
};

export type TimedNote = {
  midi: number;
  vel: number;
  time: number;
  dur: number;
  slide: boolean;
  accent: boolean;
};

export type ArpState = { cursor: number };
