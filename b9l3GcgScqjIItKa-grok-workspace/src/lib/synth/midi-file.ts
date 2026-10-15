import { scheduleStep } from "./pattern";
import { clamp, stepBeats } from "./theory";
import type { ArpState, Pattern } from "./types";

function writeVarLen(value: number): number[] {
  let v = Math.max(0, Math.floor(value));
  const bytes = [v & 0x7f];
  v >>= 7;
  while (v > 0) {
    bytes.push((v & 0x7f) | 0x80);
    v >>= 7;
  }
  return bytes.reverse();
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function encodeMidi(opts: { pattern: Pattern; notes: number[]; bpm: number; loops?: number }): Uint8Array {
  const ppq = 480;
  const loops = opts.loops ?? 4;
  const pattern = opts.pattern;
  const beatsPerStep = stepBeats(pattern);
  const rng = mulberry32(0x7e71a);
  let arp: ArpState = { cursor: 0 };
  let beat = 0;
  const events: { tick: number; order: number; data: number[] }[] = [];
  const total = Math.max(1, pattern.length) * loops;
  for (let i = 0; i < total; i++) {
    const stepIndex = i % pattern.length;
    const result = scheduleStep({
      pattern,
      stepIndex,
      stepTime: 0,
      stepDur: beatsPerStep,
      active: opts.notes,
      played: opts.notes,
      arp,
      rng,
    });
    arp = result.arp;
    for (const note of result.notes) {
      const startBeat = beat + (note.time / Math.max(0.0001, beatsPerStep)) * beatsPerStep;
      const durBeats = Math.max(0.05, (note.dur / Math.max(0.0001, beatsPerStep)) * beatsPerStep);
      const tick = Math.round(startBeat * ppq);
      const off = Math.round((startBeat + durBeats) * ppq);
      const midi = clamp(Math.round(note.midi), 0, 127);
      const vel = clamp(Math.round(note.vel * 127), 1, 127);
      events.push({ tick, order: 1, data: [0x90, midi, vel] });
      events.push({ tick: Math.max(tick + 1, off), order: 0, data: [0x80, midi, 0] });
    }
    beat += beatsPerStep;
  }

  events.sort((a, b) => a.tick - b.tick || a.order - b.order);
  const track: number[] = [];
  const us = Math.round(60000000 / clamp(opts.bpm, 40, 240));
  track.push(...writeVarLen(0), 0xff, 0x51, 0x03, (us >> 16) & 0xff, (us >> 8) & 0xff, us & 0xff);
  let last = 0;
  for (const event of events) {
    track.push(...writeVarLen(event.tick - last), ...event.data);
    last = event.tick;
  }
  track.push(...writeVarLen(0), 0xff, 0x2f, 0x00);

  const header = [
    0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, (ppq >> 8) & 0xff, ppq & 0xff,
  ];
  const len = track.length;
  const body = [0x4d, 0x54, 0x72, 0x6b, (len >> 24) & 0xff, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff, ...track];
  return Uint8Array.from([...header, ...body]);
}

export function downloadMidi(bytes: Uint8Array, filename: string) {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  const blob = new Blob([copy], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
