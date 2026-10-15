import { publishPlay } from "./playhead";
import { currentNotes, scheduleStep } from "./pattern";
import { useStudio } from "./store";
import { midiToFreq, midiToName, stepSeconds, clamp } from "./theory";
import type { ArpState, Wave } from "./types";

type Voice = {
  silence: (when: number) => void;
  stopLater: (when: number) => void;
};

let engine: Engine | null = null;

export function peekEngine(): Engine | null {
  return engine;
}

export function getEngine(): Engine {
  if (!engine) engine = new Engine();
  return engine;
}

export class Engine {
  readonly ctx: AudioContext;
  readonly analyser: AnalyserNode;
  private master: GainNode;
  private shaper: WaveShaperNode;
  private input: GainNode;
  private delay: DelayNode;
  private delayFb: GainNode;
  private delayWet: GainNode;
  private reverbWet: GainNode;
  private lfo: OscillatorNode;
  private pitchDepth: GainNode;
  private cutDepth: GainNode;
  private ampDepth: GainNode;
  private noiseBuffer: AudioBuffer;
  private running = false;
  private timer = 0;
  private playTimers: number[] = [];
  private nextTime = 0;
  private step = 0;
  private wrapped = false;
  private arp: ArpState = { cursor: 0 };
  private prevMidi = 0;
  private driveAmt = -1;
  private engineOn = true;
  private midiOut = false;
  private midiPort: MIDIOutput | null = null;
  private previews = new Map<number, Voice>();
  private voices: Voice[] = [];
  private alive = 0;
  private warned = false;

  constructor() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    const ctx = this.ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0.78;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.75;

    this.shaper = ctx.createWaveShaper();
    this.shaper.oversample = "2x";
    this.input = ctx.createGain();
    this.input.gain.value = 0;

    const offset = ctx.createConstantSource();
    offset.offset.value = 1;
    this.ampDepth = ctx.createGain();
    this.ampDepth.gain.value = 0;
    offset.connect(this.input.gain);
    this.ampDepth.connect(this.input.gain);
    offset.start();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 16;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.18;

    this.input.connect(this.shaper);
    const dry = ctx.createGain();
    dry.gain.value = 1;
    this.shaper.connect(dry);
    dry.connect(comp);

    this.delay = ctx.createDelay(2);
    this.delay.delayTime.value = 0.3;
    this.delayFb = ctx.createGain();
    this.delayFb.gain.value = 0.3;
    this.delayWet = ctx.createGain();
    this.delayWet.gain.value = 0;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = "lowpass";
    delayFilter.frequency.value = 3200;
    this.shaper.connect(this.delay);
    this.delay.connect(delayFilter);
    delayFilter.connect(this.delayFb);
    this.delayFb.connect(this.delay);
    delayFilter.connect(this.delayWet);
    this.delayWet.connect(comp);

    this.reverbWet = ctx.createGain();
    this.reverbWet.gain.value = 0;
    this.buildReverb(comp);
    comp.connect(this.master);
    this.master.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    this.lfo = ctx.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.value = 0.3;
    this.pitchDepth = ctx.createGain();
    this.cutDepth = ctx.createGain();
    this.pitchDepth.gain.value = 0;
    this.cutDepth.gain.value = 0;
    this.lfo.connect(this.pitchDepth);
    this.lfo.connect(this.cutDepth);
    this.lfo.connect(this.ampDepth);
    this.lfo.start();

    this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.updateDrive(0.05);
  }

  private buildReverb(dest: AudioNode) {
    const input = this.ctx.createGain();
    const sum = this.ctx.createGain();
    for (const time of [0.029, 0.037, 0.041, 0.047]) {
      const delay = this.ctx.createDelay(0.1);
      delay.delayTime.value = time;
      const fb = this.ctx.createGain();
      fb.gain.value = 0.62;
      const tone = this.ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 3800;
      input.connect(delay);
      delay.connect(tone);
      tone.connect(fb);
      fb.connect(delay);
      tone.connect(sum);
    }
    const allpass = this.ctx.createBiquadFilter();
    allpass.type = "allpass";
    allpass.frequency.value = 1100;
    sum.connect(allpass);
    allpass.connect(this.reverbWet);
    this.reverbWet.connect(dest);
    this.shaper.connect(input);
  }

  setMidiPort(port: MIDIOutput | null) {
    this.midiPort = port;
  }

  sync(state = useStudio.getState()) {
    const now = this.ctx.currentTime;
    const p = state.synth;
    this.engineOn = p.engineOn;
    this.midiOut = state.midiOut;
    const master = p.engineOn ? clamp(p.master, 0, 1) : 0;
    this.master.gain.setTargetAtTime(master, now, 0.02);
    const beats = clamp(p.delay.beats, 0.05, 2);
    this.delay.delayTime.setTargetAtTime(Math.min(1.9, (beats * 60) / clamp(state.bpm, 40, 240)), now, 0.03);
    this.delayFb.gain.setTargetAtTime(clamp(p.delay.feedback, 0, 0.9), now, 0.03);
    this.delayWet.gain.setTargetAtTime(clamp(p.delay.mix, 0, 0.8), now, 0.03);
    this.reverbWet.gain.setTargetAtTime(clamp(p.reverb, 0, 0.8), now, 0.03);
    this.lfo.frequency.setTargetAtTime(clamp(p.lfo.rate, 0.05, 18), now, 0.03);
    if (this.lfo.type !== p.lfo.wave) this.lfo.type = p.lfo.wave;
    const depth = p.lfo.dest === "off" ? 0 : clamp(p.lfo.depth, 0, 1);
    this.pitchDepth.gain.setTargetAtTime(p.lfo.dest === "pitch" ? depth * 700 : 0, now, 0.03);
    this.cutDepth.gain.setTargetAtTime(p.lfo.dest === "cutoff" ? depth * 4200 : 0, now, 0.03);
    this.ampDepth.gain.setTargetAtTime(p.lfo.dest === "amp" ? depth * 0.85 : 0, now, 0.03);
    this.updateDrive(p.drive);
  }

  private updateDrive(amount: number) {
    if (Math.abs(amount - this.driveAmt) < 0.004) return;
    this.driveAmt = amount;
    const k = 1 + clamp(amount, 0, 1) * 24;
    const curve = new Float32Array(256);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(x * k);
    }
    this.shaper.curve = curve;
  }

  start() {
    void this.ctx.resume();
    this.sync();
    if (this.running) return;
    for (const midi of [...this.previews.keys()]) this.previewUp(midi);
    this.running = true;
    this.step = 0;
    this.wrapped = false;
    this.arp = { cursor: 0 };
    this.prevMidi = 0;
    this.nextTime = this.ctx.currentTime + 0.05;
    this.loop();
  }

  stop() {
    this.running = false;
    window.clearTimeout(this.timer);
    for (const id of this.playTimers) window.clearTimeout(id);
    this.playTimers = [];
    this.panic();
    publishPlay({ step: -1, notes: [] });
  }

  panic() {
    const t = this.ctx.currentTime;
    for (const voice of [...this.voices]) voice.silence(t);
    for (const voice of this.previews.values()) voice.stopLater(t);
    this.previews.clear();
    if (this.midiPort && this.midiOut) {
      for (let n = 0; n < 128; n++) {
        try {
          this.midiPort.send([0x80, n, 0]);
        } catch {
          break;
        }
      }
    }
  }

  previewDown(midi: number, vel = 0.85) {
    void this.ctx.resume();
    this.sync();
    this.previewUp(midi);
    if (this.midiOut) this.sendMidi(midi, vel, this.ctx.currentTime + 0.01, 0.4);
    if (!this.engineOn) return;
    const voice = this.spawn({
      midi,
      vel,
      time: this.ctx.currentTime + 0.008,
      dur: null,
      slide: false,
      accent: false,
      fromMidi: midi,
    });
    if (voice) this.previews.set(midi, voice);
  }

  previewUp(midi: number) {
    const voice = this.previews.get(midi);
    if (!voice) return;
    voice.stopLater(this.ctx.currentTime);
    this.previews.delete(midi);
  }

  private loop = () => {
    if (!this.running) return;
    const now = this.ctx.currentTime;
    if (this.nextTime < now - 0.25) {
      const state = useStudio.getState();
      const pattern = state.patterns[state.patternIndex];
      const dur = stepSeconds(state.bpm, pattern);
      const missed = Math.max(1, Math.floor((now - this.nextTime) / Math.max(0.02, dur)));
      this.step = (this.step + missed) % Math.max(1, pattern.length);
      this.nextTime += missed * dur;
      if (this.nextTime < now) this.nextTime = now + 0.02;
    }
    const horizon = now + 0.12;
    let guard = 0;
    while (this.nextTime < horizon && this.running && guard++ < 48) {
      this.dispatch(this.nextTime, this.step);
      const state = useStudio.getState();
      const pattern = state.patterns[state.patternIndex];
      const dur = stepSeconds(state.bpm, pattern);
      this.nextTime += dur;
      this.step += 1;
      if (this.step >= Math.max(1, pattern.length)) {
        this.step = 0;
        this.wrapped = true;
      }
    }
    this.timer = window.setTimeout(this.loop, 25);
  };

  private applyChange() {
    const state = useStudio.getState();
    if (state.pendingPattern != null && state.pendingPattern !== state.patternIndex) {
      useStudio.setState({ patternIndex: state.pendingPattern, pendingPattern: null });
      this.arp = { cursor: 0 };
      return;
    }
    if (!state.chainEnabled) return;
    const chain = state.chain.filter((n) => n >= 0 && n < state.patterns.length);
    if (chain.length === 0) return;
    const at = chain.indexOf(state.patternIndex);
    const next = chain[(at === -1 ? 0 : at + 1) % chain.length];
    if (next !== state.patternIndex) {
      useStudio.setState({ patternIndex: next, pendingPattern: null });
      this.arp = { cursor: 0 };
    }
  }

  private dispatch(time: number, stepIndex: number) {
    if (stepIndex === 0 && this.wrapped) {
      this.applyChange();
      this.wrapped = false;
    }
    const state = useStudio.getState();
    const pattern = state.patterns[state.patternIndex];
    if (!pattern) return;
    const length = Math.max(1, pattern.length);
    const idx = ((stepIndex % length) + length) % length;
    const active = currentNotes({
      held: state.held,
      latched: state.latched,
      latch: state.latch,
      pattern,
    });
    const played = state.held.length ? state.playedOrder : active;
    let result;
    try {
      result = scheduleStep({
        pattern,
        stepIndex: idx,
        stepTime: time,
        stepDur: stepSeconds(state.bpm, pattern),
        active,
        played,
        arp: this.arp,
        rng: Math.random,
      });
    } catch (error) {
      if (!this.warned) {
        this.warned = true;
        console.warn("tetiva", error);
      }
      return;
    }
    this.arp = result.arp;
    const from = this.prevMidi;
    if (result.notes.length) this.prevMidi = result.notes[0].midi;
    const names = [...new Set(result.notes.map((note) => midiToName(note.midi)))];
    const delayMs = Math.max(0, (time - this.ctx.currentTime) * 1000);
    const timer = window.setTimeout(() => {
      this.playTimers = this.playTimers.filter((id) => id !== timer);
      if (!this.running) return;
      publishPlay({ step: idx, notes: names });
    }, delayMs);
    this.playTimers.push(timer);

    for (const note of result.notes) {
      if (this.engineOn) {
        this.spawn({
          midi: note.midi,
          vel: note.vel,
          time: note.time,
          dur: note.dur,
          slide: note.slide,
          accent: note.accent,
          fromMidi: from || note.midi,
        });
      }
      if (this.midiOut) this.sendMidi(note.midi, note.vel, note.time, note.dur);
    }
  }

  private sendMidi(midi: number, vel: number, time: number, dur: number) {
    const port = this.midiPort;
    if (!port) return;
    const when = performance.now() + Math.max(0, time - this.ctx.currentTime) * 1000;
    const velocity = clamp(Math.round(vel * 127), 1, 127);
    const note = clamp(Math.round(midi), 0, 127);
    try {
      port.send([0x90, note, velocity], when);
      port.send([0x80, note, 0], when + Math.max(40, dur * 1000));
    } catch {
      this.midiPort = null;
    }
  }

  private spawn(opts: {
    midi: number;
    vel: number;
    time: number;
    dur: number | null;
    slide: boolean;
    accent: boolean;
    fromMidi: number;
  }): Voice | null {
    if (this.alive > 28) return null;
    try {
      return this.spawnUnsafe(opts);
    } catch (error) {
      if (!this.warned) {
        this.warned = true;
        console.warn("tetiva voice", error);
      }
      return null;
    }
  }

  private spawnUnsafe(opts: {
    midi: number;
    vel: number;
    time: number;
    dur: number | null;
    slide: boolean;
    accent: boolean;
    fromMidi: number;
  }): Voice {
    const synth = useStudio.getState().synth;
    const ctx = this.ctx;
    const time = Math.max(opts.time, ctx.currentTime + 0.005);
    const mix = ctx.createGain();
    mix.gain.value = 1;

    const glide =
      (opts.slide || synth.glide > 0.012) && opts.fromMidi > 0 ? Math.max(synth.glide, opts.slide ? 0.05 : 0) : 0;
    const from = glide > 0.012 ? opts.fromMidi : opts.midi;

    const oscs: OscillatorNode[] = [];
    const pushOsc = (wave: Wave, oct: number, detune: number, level: number) => {
      if (level <= 0.001) return;
      const spreads = wave === "supersaw" ? [-12, 0, 11] : [0];
      for (const spread of spreads) {
        const osc = ctx.createOscillator();
        osc.type = (wave === "supersaw" ? "sawtooth" : wave) as OscillatorType;
        const target = Math.max(24, midiToFreq(opts.midi + oct * 12));
        const start = Math.max(24, midiToFreq(from + oct * 12));
        if (glide > 0.012 && Math.abs(start - target) > 0.4) {
          osc.frequency.setValueAtTime(start, time);
          osc.frequency.exponentialRampToValueAtTime(target, time + glide);
        } else {
          osc.frequency.setValueAtTime(target, time);
        }
        osc.detune.setValueAtTime(detune + spread, time);
        this.pitchDepth.connect(osc.detune);
        const gain = ctx.createGain();
        gain.gain.value = (level * 0.45) / spreads.length;
        osc.connect(gain);
        gain.connect(mix);
        osc.start(time);
        oscs.push(osc);
      }
    };

    pushOsc(synth.osc1.wave, synth.osc1.oct, synth.osc1.detune, synth.osc1.level);
    pushOsc(synth.osc2.wave, synth.osc2.oct, synth.osc2.detune, synth.osc2.level);
    pushOsc(synth.sub.wave, synth.sub.oct, 0, synth.sub.level);

    let noise: AudioBufferSourceNode | null = null;
    if (synth.noise > 0.001) {
      noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      noise.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = synth.noise * 0.18;
      noise.connect(gain);
      gain.connect(mix);
      noise.start(time);
    }

    if (oscs.length === 0 && !noise) {
      mix.disconnect();
      return { silence: () => undefined, stopLater: () => undefined };
    }

    const filter = ctx.createBiquadFilter();
    filter.type = synth.filter.type;
    filter.Q.setValueAtTime(clamp(synth.filter.q, 0.2, 22), time);
    const tracked = Math.pow(2, ((opts.midi - 60) / 12) * clamp(synth.filter.keytrack, 0, 1));
    const bright = (opts.accent ? 1.28 : 1) * (0.88 + opts.vel * 0.22);
    const base = clamp(synth.filter.cutoff * tracked * bright, 45, 15000);
    const peak = clamp(base + synth.filter.env * (opts.accent ? 1.15 : 1), 45, 17000);
    const a = Math.max(0.004, synth.fenv.a);
    const d = Math.max(0.004, synth.fenv.d);
    const sustainHz = clamp(base + (peak - base) * clamp(synth.fenv.s, 0, 1), 45, 17000);
    filter.frequency.setValueAtTime(base, time);
    filter.frequency.linearRampToValueAtTime(peak, time + a);
    filter.frequency.linearRampToValueAtTime(sustainHz, time + a + d);
    this.cutDepth.connect(filter.frequency);

    const amp = ctx.createGain();
    const peakGain = Math.max(0.0001, opts.vel * 0.28);
    const aa = Math.max(0.003, synth.amp.a);
    const ad = Math.max(0.004, synth.amp.d);
    const sus = Math.max(0.0001, peakGain * clamp(synth.amp.s, 0, 1));
    const rel = Math.max(0.02, synth.amp.r);
    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(peakGain, time + aa);
    amp.gain.exponentialRampToValueAtTime(sus, time + aa + ad);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(clamp(((opts.midi - 60) / 28) * synth.width, -1, 1), time);

    mix.connect(filter);
    filter.connect(amp);
    amp.connect(panner);
    panner.connect(this.input);

    const stopNodes = (when: number) => {
      const at = Math.max(when, time + 0.02);
      for (const osc of oscs) {
        try {
          osc.stop(at);
        } catch {
          /* already scheduled */
        }
      }
      if (noise) {
        try {
          noise.stop(at);
        } catch {
          /* already scheduled */
        }
      }
    };

    let ended = false;
    const cleanup = () => {
      if (ended) return;
      ended = true;
      this.alive = Math.max(0, this.alive - 1);
      for (const osc of oscs) {
        try {
          this.pitchDepth.disconnect(osc.detune);
        } catch {
          /* gone */
        }
      }
      try {
        this.cutDepth.disconnect(filter.frequency);
      } catch {
        /* gone */
      }
      try {
        panner.disconnect();
      } catch {
        /* gone */
      }
    };
    const silence = (when: number) => {
      const t = Math.max(when, ctx.currentTime);
      try {
        amp.gain.cancelScheduledValues(t);
        amp.gain.setValueAtTime(Math.max(0.0001, amp.gain.value || 0.0001), t);
        amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      } catch {
        /* param race */
      }
    };

    if (opts.dur != null) {
      const noteOff = Math.max(time + aa + ad + 0.006, time + opts.dur);
      amp.gain.setValueAtTime(sus, noteOff);
      amp.gain.exponentialRampToValueAtTime(0.0001, noteOff + rel);
      const fRel = Math.max(0.03, synth.fenv.r);
      filter.frequency.setValueAtTime(sustainHz, Math.max(time + a + d + 0.008, noteOff));
      filter.frequency.linearRampToValueAtTime(base, noteOff + fRel);
      stopNodes(noteOff + Math.max(rel, fRel) + 0.04);
    }

    const voice: Voice = {
      silence,
      stopLater: (when: number) => {
        const t = Math.max(when, ctx.currentTime);
        try {
          amp.gain.cancelScheduledValues(t);
          const current = Math.max(0.0001, amp.gain.value || sus);
          amp.gain.setValueAtTime(current, t);
          amp.gain.exponentialRampToValueAtTime(0.0001, t + rel);
          filter.frequency.cancelScheduledValues(t);
          filter.frequency.setValueAtTime(clamp(filter.frequency.value || base, 45, 17000), t);
          filter.frequency.linearRampToValueAtTime(base, t + Math.max(0.03, synth.fenv.r));
        } catch {
          /* param race */
        }
        stopNodes(t + rel + 0.05);
      },
    };
    this.voices.push(voice);
    const wrapped = () => {
      this.voices = this.voices.filter((item) => item !== voice);
      cleanup();
    };
    if (oscs[0]) oscs[0].addEventListener("ended", wrapped, { once: true });
    else if (noise) noise.addEventListener("ended", wrapped, { once: true });

    this.alive += 1;
    return voice;
  }
}
