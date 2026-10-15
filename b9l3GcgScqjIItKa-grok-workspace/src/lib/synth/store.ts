import { create } from "zustand";
import { cloneSnap, factoryPresets } from "./presets";
import type { Pattern, Snapshot, Step, SynthParams } from "./types";
import { clamp } from "./theory";

export type UserPreset = { name: string; snap: Snapshot };

type Studio = Snapshot & {
  playing: boolean;
  held: number[];
  latched: number[];
  playedOrder: number[];
  selectedStep: number;
  presetId: string;
  userPresets: UserPreset[];
  pendingPattern: number | null;
  instantSwitch: boolean;
  clipboard: Pattern | null;
  midiOut: boolean;
  togglePlay: () => void;
  setBpm: (bpm: number) => void;
  setLatch: (on: boolean) => void;
  setOctave: (octave: number) => void;
  setInstant: (on: boolean) => void;
  setMidiOut: (on: boolean) => void;
  noteOn: (midi: number) => void;
  noteOff: (midi: number) => void;
  releaseAll: () => void;
  selectStep: (index: number) => void;
  setStep: (index: number, patch: Partial<Step>) => void;
  replaceSteps: (steps: Step[]) => void;
  patchPattern: (patch: Partial<Pattern>) => void;
  updateSynth: (recipe: (synth: SynthParams) => SynthParams) => void;
  requestPattern: (index: number) => void;
  setChainEnabled: (on: boolean) => void;
  setChainSlot: (slot: number, pattern: number) => void;
  loadFactory: (id: string) => void;
  saveUser: (name: string) => void;
  deleteUser: (name: string) => void;
  loadUser: (name: string) => void;
  copyPattern: () => void;
  pastePattern: () => void;
  duplicateNext: () => void;
  captureFallback: () => void;
  hydrate: (raw: string | null) => void;
};

const STORAGE_KEY = "tetiva.v1";

function blankState(): Snapshot {
  return cloneSnap(factoryPresets[0].snap);
}

function patchAt(state: Studio, index: number, recipe: (pattern: Pattern) => Pattern): Partial<Studio> {
  const patterns = state.patterns.slice();
  const current = patterns[index];
  if (!current) return {};
  patterns[index] = recipe(current);
  return { patterns };
}

export function toSnap(state: Snapshot): Snapshot {
  return {
    bpm: state.bpm,
    latch: state.latch,
    octave: state.octave,
    patternIndex: state.patternIndex,
    patterns: state.patterns,
    synth: state.synth,
    chainEnabled: state.chainEnabled,
    chain: state.chain,
  };
}

export function persistStudio() {
  if (typeof localStorage === "undefined") return;
  const state = useStudio.getState();
  const blob = {
    v: 1,
    presetId: state.presetId,
    snap: toSnap(state),
    users: state.userPresets,
    instantSwitch: state.instantSwitch,
    midiOut: state.midiOut,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
}

function isPattern(value: unknown): value is Pattern {
  if (!value || typeof value !== "object") return false;
  const pattern = value as Pattern;
  return Array.isArray(pattern.steps) && pattern.steps.length === 32 && typeof pattern.harmony === "string";
}

export const useStudio = create<Studio>((set, get) => ({
  ...blankState(),
  playing: false,
  held: [],
  latched: [],
  playedOrder: [],
  selectedStep: 0,
  presetId: factoryPresets[0].id,
  userPresets: [],
  pendingPattern: null,
  instantSwitch: false,
  clipboard: null,
  midiOut: false,

  togglePlay: () => set((state) => ({ playing: !state.playing })),
  setBpm: (bpm) => set({ bpm: clamp(Math.round(bpm), 40, 240) }),
  setLatch: (on) => set({ latch: on }),
  setOctave: (octave) => set({ octave: clamp(Math.round(octave), 1, 6) }),
  setInstant: (on) => set({ instantSwitch: on }),
  setMidiOut: (on) => set({ midiOut: on }),

  noteOn: (midi) =>
    set((state) => {
      if (state.held.includes(midi)) return state;
      const fresh = state.held.length === 0;
      const held = [...state.held, midi];
      const playedOrder = fresh ? [midi] : [...state.playedOrder.filter((n) => n !== midi), midi];
      const latched = !state.latch ? state.latched : fresh ? [midi] : [...state.latched.filter((n) => n !== midi), midi];
      return { held, playedOrder, latched };
    }),

  noteOff: (midi) =>
    set((state) => ({
      held: state.held.filter((n) => n !== midi),
    })),

  releaseAll: () => set({ held: [], latched: [], playedOrder: [] }),

  selectStep: (index) => set({ selectedStep: clamp(Math.round(index), 0, 31) }),

  setStep: (index, patch) =>
    set((state) => {
      const i = clamp(Math.round(index), 0, 31);
      return {
        selectedStep: i,
        ...patchAt(state, state.patternIndex, (pattern) => {
          const steps = pattern.steps.slice();
          steps[i] = { ...steps[i], ...patch };
          return { ...pattern, steps };
        }),
      };
    }),

  replaceSteps: (steps) =>
    set((state) => patchAt(state, state.patternIndex, (pattern) => ({ ...pattern, steps }))),

  patchPattern: (patch) =>
    set((state) =>
      patchAt(state, state.patternIndex, (pattern) => {
        const next = { ...pattern, ...patch };
        next.length = clamp(Math.round(next.length), 1, 32);
        next.euclidHits = clamp(Math.round(next.euclidHits), 0, next.length);
        next.euclidRot = clamp(Math.round(next.euclidRot), 0, Math.max(0, next.length - 1));
        return next;
      }),
    ),

  updateSynth: (recipe) => set((state) => ({ synth: recipe(state.synth) })),

  requestPattern: (index) =>
    set((state) => {
      const i = clamp(Math.round(index), 0, 7);
      if (!state.playing || state.instantSwitch) {
        return { patternIndex: i, pendingPattern: null, selectedStep: 0 };
      }
      if (i === state.patternIndex) return { pendingPattern: null };
      return { pendingPattern: i };
    }),

  setChainEnabled: (on) => set({ chainEnabled: on }),
  setChainSlot: (slot, pattern) =>
    set((state) => {
      const chain = state.chain.slice(0, 4);
      while (chain.length < 4) chain.push(0);
      chain[slot] = clamp(pattern, 0, 7);
      return { chain };
    }),

  loadFactory: (id) => {
    const preset = factoryPresets.find((item) => item.id === id);
    if (!preset) return;
    const playing = get().playing;
    set({
      ...cloneSnap(preset.snap),
      presetId: preset.id,
      playing,
      pendingPattern: null,
      selectedStep: 0,
      latched: [],
      playedOrder: get().held.slice(),
    });
  },

  saveUser: (name) =>
    set((state) => {
      const label = name.trim() || "Мой";
      const snap = cloneSnap(toSnap(state));
      const users = state.userPresets.filter((item) => item.name !== label);
      users.unshift({ name: label, snap });
      return { userPresets: users.slice(0, 24), presetId: `user:${label}` };
    }),

  deleteUser: (name) =>
    set((state) => ({
      userPresets: state.userPresets.filter((item) => item.name !== name),
      presetId: state.presetId === `user:${name}` ? factoryPresets[0].id : state.presetId,
    })),

  loadUser: (name) => {
    const preset = get().userPresets.find((item) => item.name === name);
    if (!preset) return;
    const playing = get().playing;
    set({
      ...cloneSnap(preset.snap),
      presetId: `user:${name}`,
      playing,
      pendingPattern: null,
      selectedStep: 0,
      latched: [],
      playedOrder: get().held.slice(),
    });
  },

  copyPattern: () =>
    set((state) => ({ clipboard: structuredClone(state.patterns[state.patternIndex]) })),

  pastePattern: () =>
    set((state) => {
      if (!state.clipboard) return state;
      return patchAt(state, state.patternIndex, () => structuredClone(state.clipboard as Pattern));
    }),

  duplicateNext: () =>
    set((state) => {
      const next = (state.patternIndex + 1) % 8;
      const patterns = state.patterns.slice();
      patterns[next] = structuredClone(state.patterns[state.patternIndex]);
      return { patterns, patternIndex: next, pendingPattern: null };
    }),

  captureFallback: () =>
    set((state) => {
      const notes = state.held.length ? state.held : state.latched;
      if (!notes.length) return state;
      const fallback = [...notes].sort((a, b) => a - b);
      return patchAt(state, state.patternIndex, (pattern) => ({ ...pattern, fallback, useFallback: true }));
    }),

  hydrate: (raw) => {
    if (!raw) return;
    try {
      const blob = JSON.parse(raw) as {
        v?: number;
        snap?: Snapshot;
        users?: UserPreset[];
        presetId?: string;
        instantSwitch?: boolean;
        midiOut?: boolean;
      };
      if (!blob.snap || !Array.isArray(blob.snap.patterns) || !blob.snap.patterns.every(isPattern)) return;
      if (!blob.snap.synth?.osc1 || !blob.snap.synth.filter) return;
      set({
        ...cloneSnap(blob.snap),
        presetId: blob.presetId || factoryPresets[0].id,
        userPresets: Array.isArray(blob.users) ? blob.users.slice(0, 24) : [],
        instantSwitch: Boolean(blob.instantSwitch),
        midiOut: Boolean(blob.midiOut),
        playing: false,
        pendingPattern: null,
      });
    } catch {
      /* ignore broken session */
    }
  },
}));

export { STORAGE_KEY };
