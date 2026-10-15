import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DCqYCoWs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var info = {
	step: -1,
	notes: []
};
var subs = /* @__PURE__ */ new Set();
function publishPlay(next) {
	if (next.step === info.step && next.notes.join("|") === info.notes.join("|")) return;
	info = next;
	for (const fn of subs) fn(next);
}
function usePlay() {
	const [value, setValue] = (0, import_react.useState)(info);
	(0, import_react.useEffect)(() => {
		subs.add(setValue);
		setValue(info);
		return () => {
			subs.delete(setValue);
		};
	}, []);
	return value;
}
var NOTE_NAMES = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B"
];
var SCALES = {
	chromatic: [
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11
	],
	major: [
		0,
		2,
		4,
		5,
		7,
		9,
		11
	],
	minor: [
		0,
		2,
		3,
		5,
		7,
		8,
		10
	],
	dorian: [
		0,
		2,
		3,
		5,
		7,
		9,
		10
	],
	phrygian: [
		0,
		1,
		3,
		5,
		7,
		8,
		10
	],
	lydian: [
		0,
		2,
		4,
		6,
		7,
		9,
		11
	],
	mixolydian: [
		0,
		2,
		4,
		5,
		7,
		9,
		10
	],
	locrian: [
		0,
		1,
		3,
		5,
		6,
		8,
		10
	],
	harmonicMinor: [
		0,
		2,
		3,
		5,
		7,
		8,
		11
	],
	melodicMinor: [
		0,
		2,
		3,
		5,
		7,
		9,
		11
	],
	pentMajor: [
		0,
		2,
		4,
		7,
		9
	],
	pentMinor: [
		0,
		3,
		5,
		7,
		10
	],
	blues: [
		0,
		3,
		5,
		6,
		7,
		10
	],
	whole: [
		0,
		2,
		4,
		6,
		8,
		10
	],
	diminished: [
		0,
		2,
		3,
		5,
		6,
		8,
		9,
		11
	]
};
var SCALE_ORDER = [
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
	"chromatic"
];
var SCALE_LABELS = {
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
	diminished: "Уменьшённая"
};
var MODE_LABELS = {
	up: "Вверх",
	down: "Вниз",
	updown: "Вверх-вниз",
	downup: "Вниз-вверх",
	played: "Как сыграно",
	random: "Случайно",
	converge: "К центру",
	diverge: "От центра",
	chord: "Аккорд"
};
function clamp(n, a, b) {
	if (!Number.isFinite(n)) return a;
	return Math.min(b, Math.max(a, n));
}
function mod(n, m) {
	if (m <= 0) return 0;
	return (n % m + m) % m;
}
function midiToName(midi) {
	const n = Math.round(midi);
	const pc = mod(n, 12);
	const oct = Math.floor(n / 12) - 1;
	return `${NOTE_NAMES[pc]}${oct}`;
}
function midiToFreq(midi) {
	return 440 * Math.pow(2, (midi - 69) / 12);
}
function scaleDegreeToSemi(scale, degree) {
	const len = scale.length || 1;
	const wrapped = mod(degree, len);
	const oct = Math.floor(degree / len);
	return scale[wrapped] + oct * 12;
}
function nearestInScale(midi, rootPc, scale) {
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
function foldMidi(midi, low, high) {
	let n = Math.round(midi);
	if (high - low < 11) return clamp(n, 0, 127);
	let guard = 0;
	while (n > high && guard++ < 24) n -= 12;
	guard = 0;
	while (n < low && guard++ < 24) n += 12;
	return clamp(n, 0, 127);
}
/** Evenly spaced hits. Rotates so a hit lands on step 0 when there is at least one. */
function euclidean(pulses, steps, rotate = 0) {
	const s = Math.max(1, Math.floor(steps));
	const p = clamp(Math.floor(pulses), 0, s);
	const out = Array(s).fill(false);
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
function buildSequence(notes, mode, octaves, played) {
	const oct = clamp(Math.round(octaves), 1, 5);
	const unique = [...new Set(notes.filter((n) => n >= 0 && n <= 127))].sort((a, b) => a - b);
	if (unique.length === 0) return [];
	const playedUnique = [];
	for (const n of played) if (unique.includes(n) && !playedUnique.includes(n)) playedUnique.push(n);
	const base = mode === "played" && playedUnique.length ? playedUnique : unique;
	const expanded = [];
	for (let o = 0; o < oct; o++) for (const n of base) {
		const v = n + 12 * o;
		if (v <= 127) expanded.push(v);
	}
	if (expanded.length === 0) return [];
	switch (mode) {
		case "down": return [...expanded].reverse();
		case "updown": return pendulum(expanded);
		case "downup": return pendulum([...expanded].reverse());
		case "converge": return converge(expanded);
		case "diverge": return diverge(expanded);
		default: return expanded;
	}
}
function pendulum(exp) {
	if (exp.length < 2) return exp;
	const down = exp.slice(0, -1).reverse().slice(0, -1);
	return [...exp, ...down];
}
function converge(exp) {
	const out = [];
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
function diverge(exp) {
	const out = [];
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
function stepBeats(pattern) {
	let beats = 4 / clamp(pattern.rate, 1, 32);
	if (pattern.triplet) beats *= 2 / 3;
	else if (pattern.dotted) beats *= 1.5;
	return beats;
}
function stepSeconds(bpm, pattern) {
	return stepBeats(pattern) * (60 / clamp(bpm, 20, 300));
}
function makeStep(partial = {}) {
	return {
		on: true,
		semi: 0,
		oct: 0,
		vel: 100,
		gate: .8,
		prob: 100,
		ratchet: 1,
		accent: false,
		slide: false,
		...partial
	};
}
function defaultPattern() {
	return {
		length: 16,
		steps: Array.from({ length: 32 }, (_, i) => makeStep({
			on: i < 16,
			vel: i % 4 === 0 ? 116 : 88,
			accent: i % 4 === 0,
			gate: i % 2 === 0 ? .72 : .5
		})),
		mode: "up",
		harmony: "arp",
		rate: 16,
		triplet: false,
		dotted: false,
		octaves: 2,
		gate: .62,
		swing: .08,
		strum: 0,
		humanize: .04,
		scale: "minor",
		root: 0,
		followRoot: true,
		quantize: false,
		euclidHits: 5,
		euclidRot: 0,
		fallback: [
			60,
			64,
			67,
			71
		],
		useFallback: true,
		foldLow: 36,
		foldHigh: 96
	};
}
function currentNotes(args) {
	if (args.held.length) return args.held;
	if (args.latch && args.latched.length) return args.latched;
	if (args.pattern.useFallback && args.pattern.fallback.length) return args.pattern.fallback;
	return [];
}
function scaleRootMidi(pattern, active) {
	if (pattern.followRoot && active.length) return Math.min(...active);
	const pc = mod(pattern.root, 12);
	if (!active.length) return 48 + pc;
	const low = Math.min(...active);
	let rootMidi = low - mod(low, 12) + pc;
	if (rootMidi > low) rootMidi -= 12;
	return rootMidi;
}
function resolveMidis(pattern, step, active, played, arp, rng) {
	const scale = SCALES[pattern.scale] ?? SCALES.minor;
	let list = [];
	let cursor = arp.cursor;
	if (pattern.harmony === "scale") list = [scaleRootMidi(pattern, active) + scaleDegreeToSemi(scale, step.semi) + step.oct * 12];
	else if (pattern.harmony === "index") {
		const sorted = [...active].sort((a, b) => a - b);
		list = [sorted[mod(step.semi, sorted.length)] + step.oct * 12];
	} else {
		const seq = buildSequence(active, pattern.mode, pattern.octaves, played);
		if (seq.length === 0) return {
			list: [],
			arp
		};
		if (pattern.mode === "chord") list = seq.map((n) => n + step.oct * 12 + step.semi);
		else if (pattern.mode === "random") list = [seq[Math.floor(rng() * seq.length)] + step.oct * 12 + step.semi];
		else {
			list = [seq[mod(cursor, seq.length)] + step.oct * 12 + step.semi];
			cursor += 1;
		}
		if (pattern.quantize) {
			const rootPc = pattern.followRoot && active.length ? mod(Math.min(...active), 12) : mod(pattern.root, 12);
			list = list.map((n) => nearestInScale(n, rootPc, scale));
		}
	}
	list = list.map((n) => foldMidi(n, pattern.foldLow, pattern.foldHigh));
	return {
		list,
		arp: { cursor }
	};
}
function scheduleStep(opts) {
	const { pattern, stepDur, active, played, rng } = opts;
	const length = clamp(Math.round(pattern.length), 1, 32);
	const stepIndex = mod(opts.stepIndex, length);
	const step = pattern.steps[stepIndex] ?? makeStep({ on: false });
	if (!step.on || active.length === 0 || rng() * 100 > clamp(step.prob, 0, 100)) return {
		notes: [],
		arp: opts.arp
	};
	const resolved = resolveMidis(pattern, step, active, played, opts.arp, rng);
	if (resolved.list.length === 0) return {
		notes: [],
		arp: resolved.arp
	};
	const swung = opts.stepTime + (stepIndex % 2 === 1 ? stepDur * clamp(pattern.swing, 0, .6) : 0);
	const ratchet = clamp(Math.round(step.ratchet), 1, 4);
	const notes = [];
	for (let r = 0; r < ratchet; r++) {
		const sliceT = swung + stepDur / ratchet * r;
		const human = (rng() - .5) * clamp(pattern.humanize, 0, 1) * .014;
		let dur = stepDur * clamp(pattern.gate, .05, 1.8) * clamp(step.gate, .05, 1.8);
		if (ratchet > 1) dur = Math.min(dur, stepDur / ratchet * .92);
		dur = Math.max(.03, dur);
		const velJ = 1 + (rng() - .5) * clamp(pattern.humanize, 0, 1) * .3;
		const vel = clamp(clamp(step.vel, 1, 127) / 127 * (step.accent ? 1.16 : 1) * velJ, .05, 1);
		resolved.list.forEach((midi, i) => {
			notes.push({
				midi,
				vel,
				time: sliceT + human + (resolved.list.length > 1 ? i * clamp(pattern.strum, 0, .05) : 0),
				dur,
				slide: step.slide,
				accent: step.accent
			});
		});
	}
	return {
		notes,
		arp: resolved.arp
	};
}
function applyEuclid(pattern) {
	const mask = euclidean(pattern.euclidHits, pattern.length, pattern.euclidRot);
	return pattern.steps.map((step, i) => i < pattern.length ? {
		...step,
		on: mask[i] ?? false
	} : step);
}
function randomRhythm(pattern, rng = Math.random) {
	return pattern.steps.map((step, i) => {
		if (i >= pattern.length) return step;
		return {
			...step,
			on: i === 0 || rng() < .62
		};
	});
}
function randomMelody(pattern, rng = Math.random) {
	let cursor = 0;
	const jumps = [
		0,
		0,
		1,
		-1,
		2,
		-2,
		3,
		4,
		-3
	];
	return pattern.steps.map((step, i) => {
		if (i >= pattern.length) return step;
		cursor = clamp(cursor + jumps[Math.floor(rng() * jumps.length)], -7, 9);
		return {
			...step,
			semi: cursor
		};
	});
}
function mutateSteps(pattern, rng = Math.random) {
	const steps = pattern.steps.map((step) => ({ ...step }));
	const edits = 2 + Math.floor(rng() * 3);
	for (let k = 0; k < edits; k++) {
		const i = Math.floor(rng() * pattern.length);
		const roll = rng();
		const step = steps[i];
		if (!step) continue;
		if (roll < .34) steps[i] = {
			...step,
			on: !step.on
		};
		else if (roll < .7) steps[i] = {
			...step,
			semi: clamp(step.semi + (rng() < .5 ? -1 : 1), -12, 12)
		};
		else steps[i] = {
			...step,
			vel: clamp(step.vel + (rng() < .5 ? -14 : 14), 24, 127)
		};
	}
	return steps;
}
function shiftSteps(pattern, direction) {
	const len = pattern.length;
	const head = pattern.steps.slice(0, len);
	const next = head.map((_, i) => head[mod(i - direction, len)]);
	return pattern.steps.map((step, i) => i < len ? { ...next[i] } : step);
}
function reverseSteps(pattern) {
	const head = pattern.steps.slice(0, pattern.length).reverse();
	return pattern.steps.map((step, i) => i < pattern.length ? { ...head[i] } : step);
}
function setAllOn(pattern, on) {
	return pattern.steps.map((step, i) => i < pattern.length ? {
		...step,
		on
	} : step);
}
function defaultSynth() {
	return {
		osc1: {
			wave: "sawtooth",
			oct: 0,
			detune: -4,
			level: .52
		},
		osc2: {
			wave: "triangle",
			oct: 0,
			detune: 7,
			level: .26
		},
		sub: {
			wave: "sine",
			oct: -1,
			level: .2
		},
		noise: .02,
		filter: {
			type: "lowpass",
			cutoff: 2100,
			q: .85,
			env: 1600,
			keytrack: .3
		},
		amp: {
			a: .006,
			d: .18,
			s: .28,
			r: .26
		},
		fenv: {
			a: .004,
			d: .22,
			s: .18,
			r: .28
		},
		lfo: {
			rate: .25,
			wave: "sine",
			dest: "cutoff",
			depth: .12
		},
		glide: 0,
		drive: .05,
		delay: {
			mix: .16,
			beats: .75,
			feedback: .28
		},
		reverb: .14,
		width: .4,
		master: .78,
		engineOn: true
	};
}
function synth(over = {}) {
	const base = defaultSynth();
	return {
		...base,
		noise: over.noise ?? base.noise,
		glide: over.glide ?? base.glide,
		drive: over.drive ?? base.drive,
		reverb: over.reverb ?? base.reverb,
		width: over.width ?? base.width,
		master: over.master ?? base.master,
		osc1: {
			...base.osc1,
			...over.osc1
		},
		osc2: {
			...base.osc2,
			...over.osc2
		},
		sub: {
			...base.sub,
			...over.sub
		},
		filter: {
			...base.filter,
			...over.filter
		},
		amp: {
			...base.amp,
			...over.amp
		},
		fenv: {
			...base.fenv,
			...over.fenv
		},
		lfo: {
			...base.lfo,
			...over.lfo
		},
		delay: {
			...base.delay,
			...over.delay
		}
	};
}
function stepsOf(length, paint) {
	return Array.from({ length: 32 }, (_, i) => makeStep(i < length ? paint(i) : { on: false }));
}
function pattern(partial, length, paint) {
	return {
		...defaultPattern(),
		...partial,
		length,
		steps: stepsOf(length, paint)
	};
}
function pack(opts) {
	const main = structuredClone(opts.main);
	return {
		bpm: opts.bpm,
		latch: opts.latch ?? true,
		octave: opts.octave,
		patternIndex: 0,
		patterns: Array.from({ length: 8 }, () => structuredClone(main)),
		synth: opts.synth,
		chainEnabled: false,
		chain: [
			0,
			1,
			2,
			3
		]
	};
}
var factoryPresets = [
	{
		id: "glass",
		name: "Стекло",
		blurb: "Светлый мажорный перебор на две октавы",
		snap: pack({
			bpm: 118,
			octave: 4,
			synth: synth({
				osc1: {
					wave: "sawtooth",
					level: .4
				},
				osc2: {
					wave: "triangle",
					detune: 8,
					level: .34
				},
				filter: {
					cutoff: 2800,
					q: .7,
					env: 1400
				},
				amp: {
					a: .004,
					d: .16,
					s: .22,
					r: .32
				},
				delay: {
					mix: .22,
					beats: .75,
					feedback: .34
				},
				reverb: .2
			}),
			main: pattern({
				harmony: "arp",
				mode: "up",
				octaves: 2,
				rate: 16,
				gate: .58,
				swing: .06,
				scale: "major",
				fallback: [
					60,
					64,
					67,
					71
				],
				humanize: .05
			}, 16, (i) => ({
				on: true,
				vel: i % 4 === 0 ? 120 : 84,
				accent: i % 4 === 0,
				gate: i % 2 === 0 ? .7 : .46
			}))
		})
	},
	{
		id: "acid",
		name: "Кислота",
		blurb: "Резонансная линия по минору со слайдами",
		snap: pack({
			bpm: 136,
			octave: 3,
			synth: synth({
				osc1: {
					wave: "sawtooth",
					level: .72,
					detune: 0
				},
				osc2: { level: 0 },
				sub: { level: .08 },
				noise: 0,
				filter: {
					type: "lowpass",
					cutoff: 280,
					q: 14,
					env: 3200,
					keytrack: .15
				},
				amp: {
					a: .003,
					d: .12,
					s: .05,
					r: .08
				},
				fenv: {
					a: .003,
					d: .18,
					s: .08,
					r: .1
				},
				glide: .07,
				drive: .22,
				delay: {
					mix: .08,
					beats: .75,
					feedback: .2
				},
				reverb: .04,
				lfo: {
					dest: "off",
					depth: 0,
					rate: .2,
					wave: "sine"
				}
			}),
			main: pattern({
				harmony: "scale",
				mode: "up",
				scale: "minor",
				octaves: 1,
				rate: 16,
				gate: .7,
				swing: .04,
				fallback: [48],
				followRoot: true
			}, 16, (i) => {
				return {
					on: true,
					semi: [
						0,
						0,
						7,
						0,
						3,
						7,
						10,
						7,
						0,
						3,
						7,
						10,
						7,
						3,
						-2,
						0
					][i],
					slide: [
						false,
						true,
						false,
						false,
						true,
						false,
						true,
						false,
						false,
						true,
						false,
						false,
						true,
						false,
						false,
						true
					][i],
					vel: i % 4 === 0 ? 122 : 96,
					accent: i % 8 === 0
				};
			})
		})
	},
	{
		id: "weave",
		name: "Плетение",
		blurb: "Шаги выбирают ноты зажатого аккорда",
		snap: pack({
			bpm: 112,
			octave: 3,
			synth: synth({
				osc1: {
					wave: "square",
					level: .28
				},
				osc2: {
					wave: "triangle",
					level: .36,
					detune: 4
				},
				filter: {
					cutoff: 1600,
					q: 1.1,
					env: 900
				},
				amp: {
					a: .01,
					d: .24,
					s: .4,
					r: .35
				},
				reverb: .22,
				delay: {
					mix: .18,
					beats: .5,
					feedback: .3
				}
			}),
			main: pattern({
				harmony: "index",
				scale: "minor",
				rate: 16,
				gate: .66,
				swing: .1,
				fallback: [
					48,
					51,
					55,
					58
				],
				octaves: 1
			}, 16, (i) => {
				return {
					on: i % 7 !== 5,
					semi: [
						0,
						1,
						2,
						1,
						0,
						2,
						3,
						1,
						2,
						0,
						1,
						3,
						2,
						1,
						0,
						2
					][i],
					oct: [
						0,
						0,
						0,
						0,
						1,
						0,
						0,
						1,
						0,
						0,
						1,
						0,
						0,
						0,
						0,
						1
					][i],
					vel: 100
				};
			})
		})
	},
	{
		id: "house",
		name: "Дом",
		blurb: "Короткие аккордовые стабы",
		snap: pack({
			bpm: 124,
			octave: 4,
			synth: synth({
				osc1: {
					wave: "sawtooth",
					level: .48
				},
				osc2: {
					wave: "square",
					level: .18,
					oct: -1
				},
				filter: {
					cutoff: 900,
					q: 2.4,
					env: 2800
				},
				amp: {
					a: .003,
					d: .09,
					s: 0,
					r: .08
				},
				fenv: {
					a: .003,
					d: .12,
					s: .05,
					r: .1
				},
				drive: .12,
				delay: {
					mix: .1,
					beats: .75,
					feedback: .22
				},
				reverb: .08
			}),
			main: pattern({
				harmony: "arp",
				mode: "chord",
				octaves: 1,
				rate: 16,
				gate: .42,
				swing: 0,
				strum: .014,
				fallback: [
					60,
					63,
					67,
					70
				],
				scale: "minor"
			}, 16, (i) => ({
				on: [
					0,
					3,
					6,
					8,
					11,
					14
				].includes(i),
				vel: i % 8 === 0 ? 124 : 100,
				accent: i % 8 === 0
			}))
		})
	},
	{
		id: "berlin",
		name: "Берлин",
		blurb: "Трёхоктавный пилообразный пульс",
		snap: pack({
			bpm: 128,
			octave: 3,
			synth: synth({
				osc1: {
					wave: "supersaw",
					level: .46,
					detune: -6
				},
				osc2: {
					wave: "sawtooth",
					level: .22,
					detune: 10,
					oct: 0
				},
				filter: {
					cutoff: 1400,
					q: 1.4,
					env: 700
				},
				amp: {
					a: .004,
					d: .14,
					s: .45,
					r: .18
				},
				lfo: {
					dest: "cutoff",
					rate: .15,
					depth: .28,
					wave: "sine"
				},
				delay: {
					mix: .2,
					beats: .5,
					feedback: .36
				},
				reverb: .1,
				drive: .08
			}),
			main: pattern({
				harmony: "arp",
				mode: "updown",
				octaves: 3,
				rate: 16,
				gate: .48,
				swing: .12,
				scale: "minor",
				quantize: true,
				fallback: [
					48,
					51,
					55
				]
			}, 16, () => ({
				on: true,
				vel: 104
			}))
		})
	},
	{
		id: "spark",
		name: "Искра",
		blurb: "Случайные брызги с дилеем",
		snap: pack({
			bpm: 108,
			octave: 5,
			synth: synth({
				osc1: {
					wave: "sine",
					level: .4,
					oct: 1
				},
				osc2: {
					wave: "triangle",
					level: .28,
					detune: 12
				},
				sub: { level: 0 },
				filter: {
					cutoff: 4200,
					q: .6,
					env: 800
				},
				amp: {
					a: .003,
					d: .2,
					s: 0,
					r: .4
				},
				delay: {
					mix: .34,
					beats: .75,
					feedback: .46
				},
				reverb: .28,
				width: .7
			}),
			main: pattern({
				harmony: "arp",
				mode: "random",
				octaves: 2,
				rate: 16,
				gate: .36,
				swing: 0,
				fallback: [
					72,
					76,
					79,
					84
				],
				scale: "pentMajor",
				quantize: true,
				humanize: .15
			}, 16, (i) => ({
				on: true,
				prob: i % 4 === 0 ? 100 : 42 + i * 17 % 40,
				vel: 70 + i * 13 % 50,
				oct: i % 5 === 0 ? 1 : 0
			}))
		})
	},
	{
		id: "night",
		name: "Ночь",
		blurb: "Евклидов рисунок, длинный хвост",
		snap: pack({
			bpm: 96,
			octave: 3,
			synth: synth({
				osc1: {
					wave: "sawtooth",
					level: .32,
					oct: -1
				},
				osc2: {
					wave: "sine",
					level: .24
				},
				filter: {
					cutoff: 700,
					q: 1.6,
					env: 500
				},
				amp: {
					a: .02,
					d: .4,
					s: .55,
					r: .9
				},
				fenv: {
					a: .05,
					d: .5,
					s: .3,
					r: .8
				},
				lfo: {
					dest: "cutoff",
					rate: .08,
					depth: .22,
					wave: "triangle"
				},
				delay: {
					mix: .26,
					beats: 1,
					feedback: .4
				},
				reverb: .36
			}),
			main: pattern({
				harmony: "arp",
				mode: "up",
				octaves: 2,
				rate: 8,
				gate: 1.15,
				swing: 0,
				scale: "dorian",
				quantize: true,
				euclidHits: 5,
				fallback: [
					48,
					55,
					62
				]
			}, 16, (i) => {
				return {
					on: [
						0,
						3,
						6,
						10,
						13
					].includes(i),
					vel: 108,
					gate: 1
				};
			})
		})
	},
	{
		id: "ratchet",
		name: "Рэтчет",
		blurb: "Повтор нот внутри шага, сухой техно-бас",
		snap: pack({
			bpm: 132,
			octave: 2,
			synth: synth({
				osc1: {
					wave: "sawtooth",
					level: .62,
					oct: -1
				},
				osc2: {
					wave: "square",
					level: .16,
					oct: -1,
					detune: 3
				},
				sub: {
					wave: "square",
					oct: -1,
					level: .28
				},
				filter: {
					cutoff: 480,
					q: 6,
					env: 1800,
					keytrack: .2
				},
				amp: {
					a: .003,
					d: .07,
					s: .1,
					r: .06
				},
				fenv: {
					a: .003,
					d: .09,
					s: .12,
					r: .08
				},
				drive: .28,
				delay: {
					mix: .06,
					beats: .375,
					feedback: .18
				},
				reverb: .03,
				lfo: {
					dest: "off",
					depth: 0,
					rate: .2,
					wave: "sine"
				}
			}),
			main: pattern({
				harmony: "arp",
				mode: "up",
				octaves: 2,
				rate: 16,
				gate: .4,
				swing: .05,
				fallback: [36, 43],
				scale: "minor",
				foldLow: 24,
				foldHigh: 72
			}, 16, (i) => {
				const rats = [
					2,
					1,
					1,
					2,
					1,
					3,
					1,
					1,
					2,
					1,
					1,
					2,
					1,
					4,
					1,
					1
				];
				return {
					on: true,
					ratchet: rats[i],
					vel: i % 4 === 0 ? 124 : 90,
					accent: rats[i] > 2
				};
			})
		})
	}
];
function cloneSnap(snap) {
	return structuredClone(snap);
}
var STORAGE_KEY = "tetiva.v1";
function blankState() {
	return cloneSnap(factoryPresets[0].snap);
}
function patchAt(state, index, recipe) {
	const patterns = state.patterns.slice();
	const current = patterns[index];
	if (!current) return {};
	patterns[index] = recipe(current);
	return { patterns };
}
function toSnap(state) {
	return {
		bpm: state.bpm,
		latch: state.latch,
		octave: state.octave,
		patternIndex: state.patternIndex,
		patterns: state.patterns,
		synth: state.synth,
		chainEnabled: state.chainEnabled,
		chain: state.chain
	};
}
function persistStudio() {
	if (typeof localStorage === "undefined") return;
	const state = useStudio.getState();
	const blob = {
		v: 1,
		presetId: state.presetId,
		snap: toSnap(state),
		users: state.userPresets,
		instantSwitch: state.instantSwitch,
		midiOut: state.midiOut
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
}
function isPattern(value) {
	if (!value || typeof value !== "object") return false;
	const pattern = value;
	return Array.isArray(pattern.steps) && pattern.steps.length === 32 && typeof pattern.harmony === "string";
}
var useStudio = create((set, get) => ({
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
	noteOn: (midi) => set((state) => {
		if (state.held.includes(midi)) return state;
		const fresh = state.held.length === 0;
		return {
			held: [...state.held, midi],
			playedOrder: fresh ? [midi] : [...state.playedOrder.filter((n) => n !== midi), midi],
			latched: !state.latch ? state.latched : fresh ? [midi] : [...state.latched.filter((n) => n !== midi), midi]
		};
	}),
	noteOff: (midi) => set((state) => ({ held: state.held.filter((n) => n !== midi) })),
	releaseAll: () => set({
		held: [],
		latched: [],
		playedOrder: []
	}),
	selectStep: (index) => set({ selectedStep: clamp(Math.round(index), 0, 31) }),
	setStep: (index, patch) => set((state) => {
		const i = clamp(Math.round(index), 0, 31);
		return {
			selectedStep: i,
			...patchAt(state, state.patternIndex, (pattern) => {
				const steps = pattern.steps.slice();
				steps[i] = {
					...steps[i],
					...patch
				};
				return {
					...pattern,
					steps
				};
			})
		};
	}),
	replaceSteps: (steps) => set((state) => patchAt(state, state.patternIndex, (pattern) => ({
		...pattern,
		steps
	}))),
	patchPattern: (patch) => set((state) => patchAt(state, state.patternIndex, (pattern) => {
		const next = {
			...pattern,
			...patch
		};
		next.length = clamp(Math.round(next.length), 1, 32);
		next.euclidHits = clamp(Math.round(next.euclidHits), 0, next.length);
		next.euclidRot = clamp(Math.round(next.euclidRot), 0, Math.max(0, next.length - 1));
		return next;
	})),
	updateSynth: (recipe) => set((state) => ({ synth: recipe(state.synth) })),
	requestPattern: (index) => set((state) => {
		const i = clamp(Math.round(index), 0, 7);
		if (!state.playing || state.instantSwitch) return {
			patternIndex: i,
			pendingPattern: null,
			selectedStep: 0
		};
		if (i === state.patternIndex) return { pendingPattern: null };
		return { pendingPattern: i };
	}),
	setChainEnabled: (on) => set({ chainEnabled: on }),
	setChainSlot: (slot, pattern) => set((state) => {
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
			playedOrder: get().held.slice()
		});
	},
	saveUser: (name) => set((state) => {
		const label = name.trim() || "Мой";
		const snap = cloneSnap(toSnap(state));
		const users = state.userPresets.filter((item) => item.name !== label);
		users.unshift({
			name: label,
			snap
		});
		return {
			userPresets: users.slice(0, 24),
			presetId: `user:${label}`
		};
	}),
	deleteUser: (name) => set((state) => ({
		userPresets: state.userPresets.filter((item) => item.name !== name),
		presetId: state.presetId === `user:${name}` ? factoryPresets[0].id : state.presetId
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
			playedOrder: get().held.slice()
		});
	},
	copyPattern: () => set((state) => ({ clipboard: structuredClone(state.patterns[state.patternIndex]) })),
	pastePattern: () => set((state) => {
		if (!state.clipboard) return state;
		return patchAt(state, state.patternIndex, () => structuredClone(state.clipboard));
	}),
	duplicateNext: () => set((state) => {
		const next = (state.patternIndex + 1) % 8;
		const patterns = state.patterns.slice();
		patterns[next] = structuredClone(state.patterns[state.patternIndex]);
		return {
			patterns,
			patternIndex: next,
			pendingPattern: null
		};
	}),
	captureFallback: () => set((state) => {
		const notes = state.held.length ? state.held : state.latched;
		if (!notes.length) return state;
		const fallback = [...notes].sort((a, b) => a - b);
		return patchAt(state, state.patternIndex, (pattern) => ({
			...pattern,
			fallback,
			useFallback: true
		}));
	}),
	hydrate: (raw) => {
		if (!raw) return;
		try {
			const blob = JSON.parse(raw);
			if (!blob.snap || !Array.isArray(blob.snap.patterns) || !blob.snap.patterns.every(isPattern)) return;
			if (!blob.snap.synth?.osc1 || !blob.snap.synth.filter) return;
			set({
				...cloneSnap(blob.snap),
				presetId: blob.presetId || factoryPresets[0].id,
				userPresets: Array.isArray(blob.users) ? blob.users.slice(0, 24) : [],
				instantSwitch: Boolean(blob.instantSwitch),
				midiOut: Boolean(blob.midiOut),
				playing: false,
				pendingPattern: null
			});
		} catch {}
	}
}));
var engine = null;
function peekEngine() {
	return engine;
}
function getEngine() {
	if (!engine) engine = new Engine();
	return engine;
}
var Engine = class {
	ctx;
	analyser;
	master;
	shaper;
	input;
	delay;
	delayFb;
	delayWet;
	reverbWet;
	lfo;
	pitchDepth;
	cutDepth;
	ampDepth;
	noiseBuffer;
	running = false;
	timer = 0;
	playTimers = [];
	nextTime = 0;
	step = 0;
	wrapped = false;
	arp = { cursor: 0 };
	prevMidi = 0;
	driveAmt = -1;
	engineOn = true;
	midiOut = false;
	midiPort = null;
	previews = /* @__PURE__ */ new Map();
	voices = [];
	alive = 0;
	warned = false;
	constructor() {
		const Ctx = window.AudioContext || window.webkitAudioContext;
		this.ctx = new Ctx();
		const ctx = this.ctx;
		this.master = ctx.createGain();
		this.master.gain.value = .78;
		this.analyser = ctx.createAnalyser();
		this.analyser.fftSize = 1024;
		this.analyser.smoothingTimeConstant = .75;
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
		comp.attack.value = .004;
		comp.release.value = .18;
		this.input.connect(this.shaper);
		const dry = ctx.createGain();
		dry.gain.value = 1;
		this.shaper.connect(dry);
		dry.connect(comp);
		this.delay = ctx.createDelay(2);
		this.delay.delayTime.value = .3;
		this.delayFb = ctx.createGain();
		this.delayFb.gain.value = .3;
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
		this.lfo.frequency.value = .3;
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
		this.updateDrive(.05);
	}
	buildReverb(dest) {
		const input = this.ctx.createGain();
		const sum = this.ctx.createGain();
		for (const time of [
			.029,
			.037,
			.041,
			.047
		]) {
			const delay = this.ctx.createDelay(.1);
			delay.delayTime.value = time;
			const fb = this.ctx.createGain();
			fb.gain.value = .62;
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
	setMidiPort(port) {
		this.midiPort = port;
	}
	sync(state = useStudio.getState()) {
		const now = this.ctx.currentTime;
		const p = state.synth;
		this.engineOn = p.engineOn;
		this.midiOut = state.midiOut;
		const master = p.engineOn ? clamp(p.master, 0, 1) : 0;
		this.master.gain.setTargetAtTime(master, now, .02);
		const beats = clamp(p.delay.beats, .05, 2);
		this.delay.delayTime.setTargetAtTime(Math.min(1.9, beats * 60 / clamp(state.bpm, 40, 240)), now, .03);
		this.delayFb.gain.setTargetAtTime(clamp(p.delay.feedback, 0, .9), now, .03);
		this.delayWet.gain.setTargetAtTime(clamp(p.delay.mix, 0, .8), now, .03);
		this.reverbWet.gain.setTargetAtTime(clamp(p.reverb, 0, .8), now, .03);
		this.lfo.frequency.setTargetAtTime(clamp(p.lfo.rate, .05, 18), now, .03);
		if (this.lfo.type !== p.lfo.wave) this.lfo.type = p.lfo.wave;
		const depth = p.lfo.dest === "off" ? 0 : clamp(p.lfo.depth, 0, 1);
		this.pitchDepth.gain.setTargetAtTime(p.lfo.dest === "pitch" ? depth * 700 : 0, now, .03);
		this.cutDepth.gain.setTargetAtTime(p.lfo.dest === "cutoff" ? depth * 4200 : 0, now, .03);
		this.ampDepth.gain.setTargetAtTime(p.lfo.dest === "amp" ? depth * .85 : 0, now, .03);
		this.updateDrive(p.drive);
	}
	updateDrive(amount) {
		if (Math.abs(amount - this.driveAmt) < .004) return;
		this.driveAmt = amount;
		const k = 1 + clamp(amount, 0, 1) * 24;
		const curve = /* @__PURE__ */ new Float32Array(256);
		for (let i = 0; i < curve.length; i++) {
			const x = i / (curve.length - 1) * 2 - 1;
			curve[i] = Math.tanh(x * k);
		}
		this.shaper.curve = curve;
	}
	start() {
		this.ctx.resume();
		this.sync();
		if (this.running) return;
		for (const midi of [...this.previews.keys()]) this.previewUp(midi);
		this.running = true;
		this.step = 0;
		this.wrapped = false;
		this.arp = { cursor: 0 };
		this.prevMidi = 0;
		this.nextTime = this.ctx.currentTime + .05;
		this.loop();
	}
	stop() {
		this.running = false;
		window.clearTimeout(this.timer);
		for (const id of this.playTimers) window.clearTimeout(id);
		this.playTimers = [];
		this.panic();
		publishPlay({
			step: -1,
			notes: []
		});
	}
	panic() {
		const t = this.ctx.currentTime;
		for (const voice of [...this.voices]) voice.silence(t);
		for (const voice of this.previews.values()) voice.stopLater(t);
		this.previews.clear();
		if (this.midiPort && this.midiOut) for (let n = 0; n < 128; n++) try {
			this.midiPort.send([
				128,
				n,
				0
			]);
		} catch {
			break;
		}
	}
	previewDown(midi, vel = .85) {
		this.ctx.resume();
		this.sync();
		this.previewUp(midi);
		if (this.midiOut) this.sendMidi(midi, vel, this.ctx.currentTime + .01, .4);
		if (!this.engineOn) return;
		const voice = this.spawn({
			midi,
			vel,
			time: this.ctx.currentTime + .008,
			dur: null,
			slide: false,
			accent: false,
			fromMidi: midi
		});
		if (voice) this.previews.set(midi, voice);
	}
	previewUp(midi) {
		const voice = this.previews.get(midi);
		if (!voice) return;
		voice.stopLater(this.ctx.currentTime);
		this.previews.delete(midi);
	}
	loop = () => {
		if (!this.running) return;
		const now = this.ctx.currentTime;
		if (this.nextTime < now - .25) {
			const state = useStudio.getState();
			const pattern = state.patterns[state.patternIndex];
			const dur = stepSeconds(state.bpm, pattern);
			const missed = Math.max(1, Math.floor((now - this.nextTime) / Math.max(.02, dur)));
			this.step = (this.step + missed) % Math.max(1, pattern.length);
			this.nextTime += missed * dur;
			if (this.nextTime < now) this.nextTime = now + .02;
		}
		const horizon = now + .12;
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
	applyChange() {
		const state = useStudio.getState();
		if (state.pendingPattern != null && state.pendingPattern !== state.patternIndex) {
			useStudio.setState({
				patternIndex: state.pendingPattern,
				pendingPattern: null
			});
			this.arp = { cursor: 0 };
			return;
		}
		if (!state.chainEnabled) return;
		const chain = state.chain.filter((n) => n >= 0 && n < state.patterns.length);
		if (chain.length === 0) return;
		const at = chain.indexOf(state.patternIndex);
		const next = chain[(at === -1 ? 0 : at + 1) % chain.length];
		if (next !== state.patternIndex) {
			useStudio.setState({
				patternIndex: next,
				pendingPattern: null
			});
			this.arp = { cursor: 0 };
		}
	}
	dispatch(time, stepIndex) {
		if (stepIndex === 0 && this.wrapped) {
			this.applyChange();
			this.wrapped = false;
		}
		const state = useStudio.getState();
		const pattern = state.patterns[state.patternIndex];
		if (!pattern) return;
		const length = Math.max(1, pattern.length);
		const idx = (stepIndex % length + length) % length;
		const active = currentNotes({
			held: state.held,
			latched: state.latched,
			latch: state.latch,
			pattern
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
				rng: Math.random
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
		const delayMs = Math.max(0, (time - this.ctx.currentTime) * 1e3);
		const timer = window.setTimeout(() => {
			this.playTimers = this.playTimers.filter((id) => id !== timer);
			if (!this.running) return;
			publishPlay({
				step: idx,
				notes: names
			});
		}, delayMs);
		this.playTimers.push(timer);
		for (const note of result.notes) {
			if (this.engineOn) this.spawn({
				midi: note.midi,
				vel: note.vel,
				time: note.time,
				dur: note.dur,
				slide: note.slide,
				accent: note.accent,
				fromMidi: from || note.midi
			});
			if (this.midiOut) this.sendMidi(note.midi, note.vel, note.time, note.dur);
		}
	}
	sendMidi(midi, vel, time, dur) {
		const port = this.midiPort;
		if (!port) return;
		const when = performance.now() + Math.max(0, time - this.ctx.currentTime) * 1e3;
		const velocity = clamp(Math.round(vel * 127), 1, 127);
		const note = clamp(Math.round(midi), 0, 127);
		try {
			port.send([
				144,
				note,
				velocity
			], when);
			port.send([
				128,
				note,
				0
			], when + Math.max(40, dur * 1e3));
		} catch {
			this.midiPort = null;
		}
	}
	spawn(opts) {
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
	spawnUnsafe(opts) {
		const synth = useStudio.getState().synth;
		const ctx = this.ctx;
		const time = Math.max(opts.time, ctx.currentTime + .005);
		const mix = ctx.createGain();
		mix.gain.value = 1;
		const glide = (opts.slide || synth.glide > .012) && opts.fromMidi > 0 ? Math.max(synth.glide, opts.slide ? .05 : 0) : 0;
		const from = glide > .012 ? opts.fromMidi : opts.midi;
		const oscs = [];
		const pushOsc = (wave, oct, detune, level) => {
			if (level <= .001) return;
			const spreads = wave === "supersaw" ? [
				-12,
				0,
				11
			] : [0];
			for (const spread of spreads) {
				const osc = ctx.createOscillator();
				osc.type = wave === "supersaw" ? "sawtooth" : wave;
				const target = Math.max(24, midiToFreq(opts.midi + oct * 12));
				const start = Math.max(24, midiToFreq(from + oct * 12));
				if (glide > .012 && Math.abs(start - target) > .4) {
					osc.frequency.setValueAtTime(start, time);
					osc.frequency.exponentialRampToValueAtTime(target, time + glide);
				} else osc.frequency.setValueAtTime(target, time);
				osc.detune.setValueAtTime(detune + spread, time);
				this.pitchDepth.connect(osc.detune);
				const gain = ctx.createGain();
				gain.gain.value = level * .45 / spreads.length;
				osc.connect(gain);
				gain.connect(mix);
				osc.start(time);
				oscs.push(osc);
			}
		};
		pushOsc(synth.osc1.wave, synth.osc1.oct, synth.osc1.detune, synth.osc1.level);
		pushOsc(synth.osc2.wave, synth.osc2.oct, synth.osc2.detune, synth.osc2.level);
		pushOsc(synth.sub.wave, synth.sub.oct, 0, synth.sub.level);
		let noise = null;
		if (synth.noise > .001) {
			noise = ctx.createBufferSource();
			noise.buffer = this.noiseBuffer;
			noise.loop = true;
			const gain = ctx.createGain();
			gain.gain.value = synth.noise * .18;
			noise.connect(gain);
			gain.connect(mix);
			noise.start(time);
		}
		if (oscs.length === 0 && !noise) {
			mix.disconnect();
			return {
				silence: () => void 0,
				stopLater: () => void 0
			};
		}
		const filter = ctx.createBiquadFilter();
		filter.type = synth.filter.type;
		filter.Q.setValueAtTime(clamp(synth.filter.q, .2, 22), time);
		const tracked = Math.pow(2, (opts.midi - 60) / 12 * clamp(synth.filter.keytrack, 0, 1));
		const bright = (opts.accent ? 1.28 : 1) * (.88 + opts.vel * .22);
		const base = clamp(synth.filter.cutoff * tracked * bright, 45, 15e3);
		const peak = clamp(base + synth.filter.env * (opts.accent ? 1.15 : 1), 45, 17e3);
		const a = Math.max(.004, synth.fenv.a);
		const d = Math.max(.004, synth.fenv.d);
		const sustainHz = clamp(base + (peak - base) * clamp(synth.fenv.s, 0, 1), 45, 17e3);
		filter.frequency.setValueAtTime(base, time);
		filter.frequency.linearRampToValueAtTime(peak, time + a);
		filter.frequency.linearRampToValueAtTime(sustainHz, time + a + d);
		this.cutDepth.connect(filter.frequency);
		const amp = ctx.createGain();
		const peakGain = Math.max(1e-4, opts.vel * .28);
		const aa = Math.max(.003, synth.amp.a);
		const ad = Math.max(.004, synth.amp.d);
		const sus = Math.max(1e-4, peakGain * clamp(synth.amp.s, 0, 1));
		const rel = Math.max(.02, synth.amp.r);
		amp.gain.setValueAtTime(1e-4, time);
		amp.gain.exponentialRampToValueAtTime(peakGain, time + aa);
		amp.gain.exponentialRampToValueAtTime(sus, time + aa + ad);
		const panner = ctx.createStereoPanner();
		panner.pan.setValueAtTime(clamp((opts.midi - 60) / 28 * synth.width, -1, 1), time);
		mix.connect(filter);
		filter.connect(amp);
		amp.connect(panner);
		panner.connect(this.input);
		const stopNodes = (when) => {
			const at = Math.max(when, time + .02);
			for (const osc of oscs) try {
				osc.stop(at);
			} catch {}
			if (noise) try {
				noise.stop(at);
			} catch {}
		};
		let ended = false;
		const cleanup = () => {
			if (ended) return;
			ended = true;
			this.alive = Math.max(0, this.alive - 1);
			for (const osc of oscs) try {
				this.pitchDepth.disconnect(osc.detune);
			} catch {}
			try {
				this.cutDepth.disconnect(filter.frequency);
			} catch {}
			try {
				panner.disconnect();
			} catch {}
		};
		const silence = (when) => {
			const t = Math.max(when, ctx.currentTime);
			try {
				amp.gain.cancelScheduledValues(t);
				amp.gain.setValueAtTime(Math.max(1e-4, amp.gain.value || 1e-4), t);
				amp.gain.exponentialRampToValueAtTime(1e-4, t + .03);
			} catch {}
		};
		if (opts.dur != null) {
			const noteOff = Math.max(time + aa + ad + .006, time + opts.dur);
			amp.gain.setValueAtTime(sus, noteOff);
			amp.gain.exponentialRampToValueAtTime(1e-4, noteOff + rel);
			const fRel = Math.max(.03, synth.fenv.r);
			filter.frequency.setValueAtTime(sustainHz, Math.max(time + a + d + .008, noteOff));
			filter.frequency.linearRampToValueAtTime(base, noteOff + fRel);
			stopNodes(noteOff + Math.max(rel, fRel) + .04);
		}
		const voice = {
			silence,
			stopLater: (when) => {
				const t = Math.max(when, ctx.currentTime);
				try {
					amp.gain.cancelScheduledValues(t);
					const current = Math.max(1e-4, amp.gain.value || sus);
					amp.gain.setValueAtTime(current, t);
					amp.gain.exponentialRampToValueAtTime(1e-4, t + rel);
					filter.frequency.cancelScheduledValues(t);
					filter.frequency.setValueAtTime(clamp(filter.frequency.value || base, 45, 17e3), t);
					filter.frequency.linearRampToValueAtTime(base, t + Math.max(.03, synth.fenv.r));
				} catch {}
				stopNodes(t + rel + .05);
			}
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
};
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var BLACK = /* @__PURE__ */ new Set([
	1,
	3,
	6,
	8,
	10
]);
function press(midi) {
	useStudio.getState().noteOn(midi);
	if (!useStudio.getState().playing) getEngine().previewDown(midi);
}
function release(midi) {
	useStudio.getState().noteOff(midi);
	peekEngine()?.previewUp(midi);
}
function Keyboard() {
	const octave = useStudio((state) => state.octave);
	const held = useStudio((state) => state.held);
	const setOctave = useStudio((state) => state.setOctave);
	const base = (octave + 1) * 12;
	const current = (0, import_react.useRef)(null);
	const whites = [];
	const blacks = [];
	for (let i = 0; i < 24; i++) {
		const midi = base + i;
		if (BLACK.has(mod(i, 12))) blacks.push({
			midi,
			after: whites.length - 1
		});
		else whites.push(midi);
	}
	function atPoint(x, y) {
		const key = document.elementFromPoint(x, y)?.closest("[data-midi]");
		if (!key) return null;
		const midi = Number(key.dataset.midi);
		return Number.isFinite(midi) ? midi : null;
	}
	function glide(midi) {
		if (current.current === midi) return;
		if (current.current != null) release(current.current);
		if (midi != null) press(midi);
		current.current = midi;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "shrink-0 border-t border-border bg-surface px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: ["Клавиатура · ", midiToName(base)]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 min-w-11 rounded-sm border border-border bg-surface-2 text-sm",
					onClick: () => setOctave(octave - 1),
					"aria-label": "Октавой ниже",
					children: "−"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 min-w-11 rounded-sm border border-border bg-surface-2 text-sm",
					onClick: () => setOctave(octave + 1),
					"aria-label": "Октавой выше",
					children: "+"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-28 touch-none select-none",
			onPointerDown: (event) => {
				event.currentTarget.setPointerCapture(event.pointerId);
				glide(atPoint(event.clientX, event.clientY));
			},
			onPointerMove: (event) => {
				if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
				glide(atPoint(event.clientX, event.clientY));
			},
			onPointerUp: (event) => {
				if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
				glide(null);
			},
			onPointerCancel: () => glide(null),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full gap-px",
				children: whites.map((midi) => {
					const name = midiToName(midi);
					const active = held.includes(midi);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-midi": midi,
						"aria-label": name,
						"aria-pressed": active,
						className: cn("flex h-full min-w-0 flex-1 flex-col justify-end rounded-sm border border-border text-xs", active ? "bg-accent text-bg" : "bg-fg text-bg"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-auto block pb-1 font-mono",
							children: name.startsWith("C") && !name.startsWith("C#") ? name : ""
						})
					}, midi);
				})
			}), blacks.map((key) => {
				const width = 100 / whites.length;
				const center = (key.after + 1) / whites.length * 100;
				const active = held.includes(key.midi);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-midi": key.midi,
					"aria-label": midiToName(key.midi),
					"aria-pressed": active,
					className: cn("absolute top-0 z-10 h-[58%] rounded-sm border border-border", active ? "bg-accent" : "bg-bg"),
					style: {
						width: `${width * .62}%`,
						left: `${center - width * .31}%`
					}
				}, key.midi);
			})]
		})]
	});
}
function Panel({ title, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rounded-lg border border-border bg-surface p-3", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 text-xs font-medium text-muted",
			children: title
		}), children]
	});
}
function Btn({ children, onClick, pressed, title, disabled, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		title,
		disabled,
		"aria-pressed": pressed,
		onClick,
		className: cn("min-h-11 rounded-sm border border-border px-3 text-sm transition-colors duration-150 disabled:opacity-40", pressed ? "bg-fg text-bg" : "bg-surface-2 text-fg hover:bg-surface-3", className),
		children
	});
}
function Field({ label, value, min, max, step, onChange, format, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)_2.75rem] items-center gap-2 text-xs",
		title,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "tetiva-range w-full min-w-0",
				type: "range",
				min,
				max,
				step,
				value: Number.isFinite(value) ? value : min,
				onChange: (event) => onChange(Number(event.target.value)),
				"aria-label": label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-right font-mono text-fg tabular-nums",
				children: format ? format(value) : String(value)
			})
		]
	});
}
function SelectField({ label, value, options, onChange, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-w-0 flex-col gap-1 text-xs text-muted",
		title,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			className: "tetiva-select min-h-11 w-full min-w-0 rounded-sm px-2 text-sm",
			value,
			onChange: (event) => onChange(event.target.value),
			children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: option.value,
				children: option.label
			}, option.value))
		})]
	});
}
function Scope() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const buffer = /* @__PURE__ */ new Uint8Array(1024);
		let frame = 0;
		const draw = () => {
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;
			const ratio = window.devicePixelRatio || 1;
			const nextW = Math.max(1, Math.floor(width * ratio));
			const nextH = Math.max(1, Math.floor(height * ratio));
			if (canvas.width !== nextW || canvas.height !== nextH) {
				canvas.width = nextW;
				canvas.height = nextH;
			}
			ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
			ctx.clearRect(0, 0, width, height);
			const accent = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#8ea3b8";
			const faint = getComputedStyle(document.documentElement).getPropertyValue("--color-border").trim() || "#2c2c32";
			ctx.beginPath();
			const audio = peekEngine();
			const live = Boolean(audio && audio.ctx.state === "running");
			ctx.strokeStyle = live ? accent : faint;
			ctx.lineWidth = 1.5;
			if (live && audio) {
				audio.analyser.getByteTimeDomainData(buffer);
				for (let i = 0; i < width; i++) {
					const sample = buffer[Math.floor(i / Math.max(1, width) * (buffer.length - 1))] / 128 - 1;
					const y = height / 2 + sample * height * .42;
					if (i === 0) ctx.moveTo(0, y);
					else ctx.lineTo(i, y);
				}
			} else {
				ctx.moveTo(0, height / 2);
				ctx.lineTo(width, height / 2);
			}
			ctx.stroke();
			frame = requestAnimationFrame(draw);
		};
		frame = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(frame);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "h-12 w-full",
		"aria-hidden": true
	});
}
var LETTERS = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H"
];
var LENGTHS = [
	8,
	12,
	16,
	24,
	32
];
var RATES = [
	{
		id: "4",
		rate: 4,
		triplet: false,
		dotted: false,
		label: "1/4"
	},
	{
		id: "4d",
		rate: 4,
		triplet: false,
		dotted: true,
		label: "1/4."
	},
	{
		id: "4t",
		rate: 4,
		triplet: true,
		dotted: false,
		label: "1/4T"
	},
	{
		id: "8",
		rate: 8,
		triplet: false,
		dotted: false,
		label: "1/8"
	},
	{
		id: "8d",
		rate: 8,
		triplet: false,
		dotted: true,
		label: "1/8."
	},
	{
		id: "8t",
		rate: 8,
		triplet: true,
		dotted: false,
		label: "1/8T"
	},
	{
		id: "16",
		rate: 16,
		triplet: false,
		dotted: false,
		label: "1/16"
	},
	{
		id: "16d",
		rate: 16,
		triplet: false,
		dotted: true,
		label: "1/16."
	},
	{
		id: "16t",
		rate: 16,
		triplet: true,
		dotted: false,
		label: "1/16T"
	},
	{
		id: "32",
		rate: 32,
		triplet: false,
		dotted: false,
		label: "1/32"
	},
	{
		id: "32t",
		rate: 32,
		triplet: true,
		dotted: false,
		label: "1/32T"
	}
];
function rateId(pattern) {
	return RATES.find((rate) => rate.rate === pattern.rate && rate.triplet === pattern.triplet && rate.dotted === pattern.dotted)?.id ?? "16";
}
function semiTop(semi) {
	return (12 - clamp(semi, -12, 12)) / 24 * 100;
}
function Sequencer() {
	const pattern = useStudio((state) => state.patterns[state.patternIndex]);
	const patternIndex = useStudio((state) => state.patternIndex);
	const pending = useStudio((state) => state.pendingPattern);
	const chain = useStudio((state) => state.chain);
	const chainEnabled = useStudio((state) => state.chainEnabled);
	const instant = useStudio((state) => state.instantSwitch);
	const selected = useStudio((state) => state.selectedStep);
	const requestPattern = useStudio((state) => state.requestPattern);
	const patchPattern = useStudio((state) => state.patchPattern);
	const setChainEnabled = useStudio((state) => state.setChainEnabled);
	const setChainSlot = useStudio((state) => state.setChainSlot);
	const setInstant = useStudio((state) => state.setInstant);
	const replaceSteps = useStudio((state) => state.replaceSteps);
	const copyPattern = useStudio((state) => state.copyPattern);
	const pastePattern = useStudio((state) => state.pastePattern);
	const duplicateNext = useStudio((state) => state.duplicateNext);
	const captureFallback = useStudio((state) => state.captureFallback);
	const clipboard = useStudio((state) => state.clipboard);
	const held = useStudio((state) => state.held);
	const latched = useStudio((state) => state.latched);
	if (!pattern) return null;
	const stepIndex = Math.min(selected, pattern.length - 1);
	const step = pattern.steps[stepIndex];
	const semiLabel = pattern.harmony === "scale" ? "Ступень" : pattern.harmony === "index" ? "Номер" : "Сдвиг";
	function edit(patch) {
		useStudio.getState().setStep(stepIndex, patch);
	}
	function withCurrent(recipe) {
		const current = useStudio.getState().patterns[useStudio.getState().patternIndex];
		replaceSteps(recipe(current));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Секвенция",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scope, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NowPlaying, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-8 gap-1",
						children: LETTERS.map((letter, index) => {
							const inChain = chainEnabled && chain.includes(index);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => requestPattern(index),
								"aria-pressed": patternIndex === index,
								className: cn("relative min-h-11 rounded-sm border text-sm font-medium transition-colors duration-150", patternIndex === index ? "border-fg bg-fg text-bg" : pending === index ? "border-fg bg-surface-2 text-fg" : "border-border bg-surface-2 text-muted hover:bg-surface-3"),
								children: [letter, inChain ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-accent" }) : null]
							}, letter);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
								label: "Источник",
								title: "Арп перебирает зажатые ноты. Гамма читает шаг как ступень. Ноты выбирают звук аккорда по номеру.",
								value: pattern.harmony,
								onChange: (harmony) => patchPattern({ harmony }),
								options: [
									{
										value: "arp",
										label: "Арпеджио"
									},
									{
										value: "scale",
										label: "Гамма"
									},
									{
										value: "index",
										label: "Ноты аккорда"
									}
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
								label: "Порядок",
								value: pattern.mode,
								onChange: (mode) => patchPattern({ mode }),
								options: Object.entries(MODE_LABELS).map(([value, label]) => ({
									value,
									label
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
								label: "Шаг",
								value: rateId(pattern),
								onChange: (id) => {
									const rate = RATES.find((item) => item.id === id);
									if (!rate) return;
									patchPattern({
										rate: rate.rate,
										triplet: rate.triplet,
										dotted: rate.dotted
									});
								},
								options: RATES.map((rate) => ({
									value: rate.id,
									label: rate.label
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
								label: "Гамма",
								value: pattern.scale,
								onChange: (scale) => patchPattern({ scale }),
								options: SCALE_ORDER.map((scale) => ({
									value: scale,
									label: SCALE_LABELS[scale]
								}))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lane, { kind: "semi" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lane, { kind: "vel" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lane, { kind: "gate" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lane, { kind: "prob" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-faint",
								children: "Верх — высота. Ниже — скорость, гейт, шанс. Тап включает шаг, жест вверх-вниз рисует."
							})
						]
					})
				]
			}),
			step ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: `Шаг ${stepIndex + 1}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							pressed: step.on,
							onClick: () => edit({ on: !step.on }),
							children: step.on ? "Включён" : "Выключен"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							pressed: step.accent,
							onClick: () => edit({ accent: !step.accent }),
							title: "Громче и ярче",
							children: "Акцент"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							pressed: step.slide,
							onClick: () => edit({ slide: !step.slide }),
							title: "Подъезд к ноте",
							children: "Слайд"
						}),
						[
							1,
							2,
							3,
							4
						].map((ratchet) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
							pressed: step.ratchet === ratchet,
							onClick: () => edit({ ratchet }),
							title: "Повторы внутри шага",
							children: ["×", ratchet]
						}, ratchet))
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: semiLabel,
							min: -12,
							max: 12,
							step: 1,
							value: step.semi,
							onChange: (semi) => edit({ semi })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Октава",
							min: -2,
							max: 2,
							step: 1,
							value: step.oct,
							onChange: (oct) => edit({ oct })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Скорость",
							min: 1,
							max: 127,
							step: 1,
							value: step.vel,
							onChange: (vel) => edit({ vel })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Гейт",
							min: .15,
							max: 1.5,
							step: .01,
							value: step.gate,
							onChange: (gate) => edit({ gate }),
							format: (n) => n.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Шанс",
							min: 0,
							max: 100,
							step: 1,
							value: step.prob,
							onChange: (prob) => edit({ prob }),
							format: (n) => `${Math.round(n)}%`
						})
					]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Фраза",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Октавы",
								min: 1,
								max: 4,
								step: 1,
								value: pattern.octaves,
								onChange: (octaves) => patchPattern({ octaves }),
								title: "Сколько октав проходит арпеджио"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Длина",
								min: .15,
								max: 1.6,
								step: .01,
								value: pattern.gate,
								onChange: (gate) => patchPattern({ gate }),
								format: (n) => n.toFixed(2),
								title: "Общий гейт"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Свинг",
								min: 0,
								max: .55,
								step: .01,
								value: pattern.swing,
								onChange: (swing) => patchPattern({ swing }),
								format: (n) => `${Math.round(n * 100)}%`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Струм",
								min: 0,
								max: .04,
								step: .001,
								value: pattern.strum,
								onChange: (strum) => patchPattern({ strum }),
								format: (n) => `${Math.round(n * 1e3)}`,
								title: "Задержка между нотами аккорда, мс"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Живость",
								min: 0,
								max: 1,
								step: .01,
								value: pattern.humanize,
								onChange: (humanize) => patchPattern({ humanize }),
								format: (n) => `${Math.round(n * 100)}%`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Низ",
								min: 24,
								max: 72,
								step: 1,
								value: pattern.foldLow,
								onChange: (foldLow) => patchPattern({ foldLow }),
								format: midiToName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Верх",
								min: 60,
								max: 108,
								step: 1,
								value: pattern.foldHigh,
								onChange: (foldHigh) => patchPattern({ foldHigh }),
								format: midiToName
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-2 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: "Корень",
							value: String(pattern.root),
							onChange: (root) => patchPattern({ root: Number(root) }),
							options: NOTE_NAMES.map((name, index) => ({
								value: String(index),
								label: name
							}))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-end gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
									pressed: pattern.followRoot,
									onClick: () => patchPattern({ followRoot: !pattern.followRoot }),
									title: "Корень гаммы — самая низкая зажатая нота",
									children: "От баса"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
									pressed: pattern.quantize,
									onClick: () => patchPattern({ quantize: !pattern.quantize }),
									title: "Притянуть арпеджио к гамме",
									children: "Квантайз"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
									pressed: pattern.useFallback,
									onClick: () => patchPattern({ useFallback: !pattern.useFallback }),
									title: "Играть запасной аккорд, если клавиши молчат",
									children: "Фон"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-xs text-muted",
						children: ["Фон: ", pattern.fallback.map((note) => midiToName(note)).join(" ")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							disabled: held.length === 0 && latched.length === 0,
							onClick: captureFallback,
							title: "Записать зажатый или защёлкнутый аккорд как фон",
							children: "Запомнить аккорд"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Ритм и цепочка",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 flex flex-wrap gap-2",
						children: LENGTHS.map((length) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							pressed: pattern.length === length,
							onClick: () => patchPattern({ length }),
							children: length
						}, length))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Евклид",
							min: 0,
							max: pattern.length,
							step: 1,
							value: pattern.euclidHits,
							onChange: (euclidHits) => patchPattern({ euclidHits }),
							title: "Число ударов на длину паттерна"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Поворот",
							min: 0,
							max: Math.max(0, pattern.length - 1),
							step: 1,
							value: pattern.euclidRot,
							onChange: (euclidRot) => patchPattern({ euclidRot })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => withCurrent(applyEuclid),
								children: "Евклид"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => withCurrent(randomRhythm),
								children: "Ритм"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => withCurrent(randomMelody),
								children: "Мелодия"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => withCurrent(mutateSteps),
								children: "Мутация"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => withCurrent((item) => shiftSteps(item, -1)),
								children: "Сдвиг ←"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => withCurrent((item) => shiftSteps(item, 1)),
								children: "Сдвиг →"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => withCurrent(reverseSteps),
								children: "Реверс"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => withCurrent((item) => setAllOn(item, true)),
								children: "Все"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => withCurrent((item) => setAllOn(item, false)),
								children: "Тишина"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: copyPattern,
								children: "Копия"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								disabled: !clipboard,
								onClick: pastePattern,
								children: "Вставить"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: duplicateNext,
								children: "Дубль"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								pressed: chainEnabled,
								onClick: () => setChainEnabled(!chainEnabled),
								title: "После круга переходить к следующему слоту",
								children: "Цепочка"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								pressed: instant,
								onClick: () => setInstant(!instant),
								title: "Менять паттерн сразу, не дожидаясь конца круга",
								children: "Сразу"
							}),
							pending != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: ["Далее ", LETTERS[pending]]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-4 gap-2",
						children: chain.slice(0, 4).map((value, slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: `${slot + 1}`,
							value: String(value),
							onChange: (next) => setChainSlot(slot, Number(next)),
							options: LETTERS.map((letter, index) => ({
								value: String(index),
								label: letter
							}))
						}, slot))
					})
				]
			})
		]
	});
}
function NowPlaying() {
	const play = usePlay();
	const text = play.step < 0 ? "—" : play.notes.length ? play.notes.join(" ") : "пауза";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-2 font-mono text-sm text-accent tabular-nums",
		children: ["Сейчас ", text]
	});
}
function Lane({ kind }) {
	const pattern = useStudio((state) => state.patterns[state.patternIndex]);
	const selected = useStudio((state) => state.selectedStep);
	const play = usePlay();
	const gesture = (0, import_react.useRef)(null);
	if (!pattern) return null;
	const length = pattern.length;
	const tall = kind === "semi";
	function point(event) {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, .999);
		const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
		return {
			index: Math.min(length - 1, Math.floor(x * length)),
			y
		};
	}
	function paint(index, y, enable) {
		const step = useStudio.getState().patterns[useStudio.getState().patternIndex]?.steps[index];
		if (!step) return;
		if (kind === "semi") {
			const semi = clamp(Math.round(12 - y * 24), -12, 12);
			useStudio.getState().setStep(index, {
				semi,
				on: enable ? true : step.on
			});
			return;
		}
		if (kind === "vel") {
			useStudio.getState().setStep(index, { vel: clamp(Math.round((1 - y) * 126 + 1), 1, 127) });
			return;
		}
		if (kind === "gate") {
			useStudio.getState().setStep(index, { gate: Math.round((.15 + (1 - y) * 1.35) * 100) / 100 });
			return;
		}
		useStudio.getState().setStep(index, { prob: clamp(Math.round((1 - y) * 100), 0, 100) });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "w-full max-w-full overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			style: { width: `max(100%, ${length * 44}px)` },
			children: [kind === "semi" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-1 grid",
				style: { gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` },
				children: Array.from({ length }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("h-6 font-mono text-xs tabular-nums", play.step === index ? "text-accent" : index === selected ? "text-fg" : "text-faint"),
					onClick: () => useStudio.getState().selectStep(index),
					children: index + 1
				}, index))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1 text-xs text-faint",
				children: kind === "vel" ? "Скорость" : kind === "gate" ? "Гейт" : "Шанс"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative touch-none rounded-sm border border-border bg-bg", tall ? "h-32" : "h-10"),
				style: {
					display: "grid",
					gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))`
				},
				onPointerDown: (event) => {
					event.currentTarget.setPointerCapture(event.pointerId);
					const hit = point(event);
					gesture.current = {
						x: event.clientX,
						y: event.clientY,
						moved: false
					};
					if (kind !== "semi") paint(hit.index, hit.y, true);
					else useStudio.getState().selectStep(hit.index);
				},
				onPointerMove: (event) => {
					const drag = gesture.current;
					if (!drag || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
					if (Math.abs(event.clientX - drag.x) > 4 || Math.abs(event.clientY - drag.y) > 4) drag.moved = true;
					if (!drag.moved) return;
					const hit = point(event);
					paint(hit.index, hit.y, true);
				},
				onPointerUp: (event) => {
					const drag = gesture.current;
					gesture.current = null;
					if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
					if (kind === "semi" && drag && !drag.moved) {
						const hit = point(event);
						const step = useStudio.getState().patterns[useStudio.getState().patternIndex]?.steps[hit.index];
						if (step) useStudio.getState().setStep(hit.index, { on: !step.on });
					}
				},
				children: [tall ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 top-1/2 z-0 h-px bg-border" }) : null, pattern.steps.slice(0, length).map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("relative", play.step === index && "bg-surface-3", index === selected && play.step !== index && "bg-surface-2"),
					children: [kind === "semi" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("absolute right-0.5 left-0.5 z-10 h-1.5 -translate-y-1/2 rounded-sm", step.on ? "bg-fg" : "bg-faint"),
						style: { top: `${semiTop(step.semi)}%` }
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("absolute inset-x-0.5 bottom-0", step.on ? "bg-fg" : "bg-faint"),
						style: { height: `${kind === "vel" ? step.vel / 127 * 100 : kind === "gate" ? (step.gate - .15) / 1.35 * 100 : step.prob}%` }
					}), tall && step.ratchet > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute bottom-0.5 left-0.5 font-mono text-xs text-muted",
						children: ["×", step.ratchet]
					}) : null]
				}, index))]
			})]
		})
	});
}
var WAVES = [
	{
		value: "sine",
		label: "Синус"
	},
	{
		value: "triangle",
		label: "Треуг."
	},
	{
		value: "sawtooth",
		label: "Пила"
	},
	{
		value: "square",
		label: "Квадрат"
	},
	{
		value: "supersaw",
		label: "Суперпила"
	}
];
var DELAYS = [
	{
		value: "0.25",
		label: "1/16"
	},
	{
		value: "0.375",
		label: "1/16."
	},
	{
		value: "0.5",
		label: "1/8"
	},
	{
		value: "0.75",
		label: "1/8."
	},
	{
		value: "1",
		label: "1/4"
	},
	{
		value: "1.5",
		label: "1/4."
	},
	{
		value: "2",
		label: "1/2"
	}
];
function num(value, digits = 0) {
	return digits > 0 ? value.toFixed(digits) : String(Math.round(value));
}
function SynthPanel() {
	const synth = useStudio((state) => state.synth);
	const update = useStudio((state) => state.updateSynth);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Осцилляторы",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OscEditor, {
						title: "OSC 1",
						wave: synth.osc1.wave,
						oct: synth.osc1.oct,
						detune: synth.osc1.detune,
						level: synth.osc1.level,
						onWave: (wave) => update((item) => ({
							...item,
							osc1: {
								...item.osc1,
								wave
							}
						})),
						onOct: (oct) => update((item) => ({
							...item,
							osc1: {
								...item.osc1,
								oct
							}
						})),
						onDetune: (detune) => update((item) => ({
							...item,
							osc1: {
								...item.osc1,
								detune
							}
						})),
						onLevel: (level) => update((item) => ({
							...item,
							osc1: {
								...item.osc1,
								level
							}
						}))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OscEditor, {
						title: "OSC 2",
						wave: synth.osc2.wave,
						oct: synth.osc2.oct,
						detune: synth.osc2.detune,
						level: synth.osc2.level,
						onWave: (wave) => update((item) => ({
							...item,
							osc2: {
								...item.osc2,
								wave
							}
						})),
						onOct: (oct) => update((item) => ({
							...item,
							osc2: {
								...item.osc2,
								oct
							}
						})),
						onDetune: (detune) => update((item) => ({
							...item,
							osc2: {
								...item.osc2,
								detune
							}
						})),
						onLevel: (level) => update((item) => ({
							...item,
							osc2: {
								...item.osc2,
								level
							}
						}))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: "Саб",
							value: synth.sub.wave,
							onChange: (wave) => update((item) => ({
								...item,
								sub: {
									...item.sub,
									wave
								}
							})),
							options: [{
								value: "sine",
								label: "Синус"
							}, {
								value: "square",
								label: "Квадрат"
							}]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Саб окт.",
							min: -2,
							max: -1,
							step: 1,
							value: synth.sub.oct,
							onChange: (oct) => update((item) => ({
								...item,
								sub: {
									...item.sub,
									oct: oct <= -2 ? -2 : -1
								}
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Саб",
							min: 0,
							max: 1,
							step: .01,
							value: synth.sub.level,
							onChange: (level) => update((item) => ({
								...item,
								sub: {
									...item.sub,
									level
								}
							})),
							format: (n) => num(n, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Шум",
							min: 0,
							max: 1,
							step: .01,
							value: synth.noise,
							onChange: (noise) => update((item) => ({
								...item,
								noise
							})),
							format: (n) => num(n, 2)
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Фильтр",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Тип",
					value: synth.filter.type,
					onChange: (type) => update((item) => ({
						...item,
						filter: {
							...item.filter,
							type
						}
					})),
					options: [
						{
							value: "lowpass",
							label: "Нижние"
						},
						{
							value: "highpass",
							label: "Верхние"
						},
						{
							value: "bandpass",
							label: "Полоса"
						}
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Срез",
							min: 60,
							max: 12e3,
							step: 1,
							value: synth.filter.cutoff,
							onChange: (cutoff) => update((item) => ({
								...item,
								filter: {
									...item.filter,
									cutoff
								}
							})),
							format: (n) => `${Math.round(n)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Резонанс",
							min: .4,
							max: 18,
							step: .1,
							value: synth.filter.q,
							onChange: (q) => update((item) => ({
								...item,
								filter: {
									...item.filter,
									q
								}
							})),
							format: (n) => num(n, 1)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Модуляция",
							min: -5e3,
							max: 7e3,
							step: 10,
							value: synth.filter.env,
							onChange: (env) => update((item) => ({
								...item,
								filter: {
									...item.filter,
									env
								}
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Слежение",
							min: 0,
							max: 1,
							step: .01,
							value: synth.filter.keytrack,
							onChange: (keytrack) => update((item) => ({
								...item,
								filter: {
									...item.filter,
									keytrack
								}
							})),
							format: (n) => num(n, 2)
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Огибающие",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs text-faint",
						children: "Громкость"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnvFields, {
						value: synth.amp,
						onChange: (amp) => update((item) => ({
							...item,
							amp
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 mb-2 text-xs text-faint",
						children: "Фильтр"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnvFields, {
						value: synth.fenv,
						onChange: (fenv) => update((item) => ({
							...item,
							fenv
						}))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Движение и пространство",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "LFO",
							min: .05,
							max: 12,
							step: .01,
							value: synth.lfo.rate,
							onChange: (rate) => update((item) => ({
								...item,
								lfo: {
									...item.lfo,
									rate
								}
							})),
							format: (n) => num(n, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: "Форма LFO",
							value: synth.lfo.wave,
							onChange: (wave) => update((item) => ({
								...item,
								lfo: {
									...item.lfo,
									wave
								}
							})),
							options: [
								{
									value: "sine",
									label: "Синус"
								},
								{
									value: "triangle",
									label: "Треуг."
								},
								{
									value: "sawtooth",
									label: "Пила"
								},
								{
									value: "square",
									label: "Квадрат"
								}
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: "Куда",
							value: synth.lfo.dest,
							onChange: (dest) => update((item) => ({
								...item,
								lfo: {
									...item.lfo,
									dest
								}
							})),
							options: [
								{
									value: "off",
									label: "Выкл"
								},
								{
									value: "cutoff",
									label: "Срез"
								},
								{
									value: "pitch",
									label: "Тон"
								},
								{
									value: "amp",
									label: "Громкость"
								}
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Глубина",
							min: 0,
							max: 1,
							step: .01,
							value: synth.lfo.depth,
							onChange: (depth) => update((item) => ({
								...item,
								lfo: {
									...item.lfo,
									depth
								}
							})),
							format: (n) => num(n, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Глайд",
							min: 0,
							max: .4,
							step: .005,
							value: synth.glide,
							onChange: (glide) => update((item) => ({
								...item,
								glide
							})),
							format: (n) => num(n, 3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Драйв",
							min: 0,
							max: 1,
							step: .01,
							value: synth.drive,
							onChange: (drive) => update((item) => ({
								...item,
								drive
							})),
							format: (n) => num(n, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Дилей",
							min: 0,
							max: .7,
							step: .01,
							value: synth.delay.mix,
							onChange: (mix) => update((item) => ({
								...item,
								delay: {
									...item.delay,
									mix
								}
							})),
							format: (n) => num(n, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: "Время",
							value: String(synth.delay.beats),
							onChange: (beats) => update((item) => ({
								...item,
								delay: {
									...item.delay,
									beats: Number(beats)
								}
							})),
							options: DELAYS
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Отдача",
							min: 0,
							max: .85,
							step: .01,
							value: synth.delay.feedback,
							onChange: (feedback) => update((item) => ({
								...item,
								delay: {
									...item.delay,
									feedback
								}
							})),
							format: (n) => num(n, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Реверб",
							min: 0,
							max: .6,
							step: .01,
							value: synth.reverb,
							onChange: (reverb) => update((item) => ({
								...item,
								reverb
							})),
							format: (n) => num(n, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Ширина",
							min: 0,
							max: 1,
							step: .01,
							value: synth.width,
							onChange: (width) => update((item) => ({
								...item,
								width
							})),
							format: (n) => num(n, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Громкость",
							min: 0,
							max: 1,
							step: .01,
							value: synth.master,
							onChange: (master) => update((item) => ({
								...item,
								master
							})),
							format: (n) => num(n, 2)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						pressed: synth.engineOn,
						onClick: () => update((item) => ({
							...item,
							engineOn: !item.engineOn
						})),
						children: synth.engineOn ? "Звук включён" : "Звук выключен"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MidiBar, {})
		]
	});
}
function OscEditor({ title, wave, oct, detune, level, onWave, onOct, onDetune, onLevel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm bg-surface-2 p-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs text-muted",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Волна",
				value: wave,
				onChange: onWave,
				options: WAVES
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Октава",
						min: -2,
						max: 2,
						step: 1,
						value: oct,
						onChange: onOct
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Детюн",
						min: -40,
						max: 40,
						step: 1,
						value: detune,
						onChange: onDetune
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Уровень",
						min: 0,
						max: 1,
						step: .01,
						value: level,
						onChange: onLevel,
						format: (n) => n.toFixed(2)
					})
				]
			})
		]
	});
}
function EnvFields({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Атака",
				min: .003,
				max: 1.5,
				step: .001,
				value: value.a,
				onChange: (a) => onChange({
					...value,
					a
				}),
				format: (n) => n.toFixed(3)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Спад",
				min: .01,
				max: 2,
				step: .01,
				value: value.d,
				onChange: (d) => onChange({
					...value,
					d
				}),
				format: (n) => n.toFixed(2)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Сустейн",
				min: 0,
				max: 1,
				step: .01,
				value: value.s,
				onChange: (s) => onChange({
					...value,
					s
				}),
				format: (n) => n.toFixed(2)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Релиз",
				min: .02,
				max: 3,
				step: .01,
				value: value.r,
				onChange: (r) => onChange({
					...value,
					r
				}),
				format: (n) => n.toFixed(2)
			})
		]
	});
}
function MidiBar() {
	const midiOut = useStudio((state) => state.midiOut);
	const setMidiOut = useStudio((state) => state.setMidiOut);
	const access = (0, import_react.useRef)(null);
	const [outputs, setOutputs] = (0, import_react.useState)([]);
	const [outId, setOutId] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("Контроллер и внешний инструмент через Web MIDI.");
	async function connect() {
		const nav = navigator;
		if (!nav.requestMIDIAccess) {
			setNote("В этом браузере нет Web MIDI.");
			return;
		}
		try {
			const midi = await nav.requestMIDIAccess();
			access.current = midi;
			const inputs = [...midi.inputs.values()];
			const outs = [...midi.outputs.values()].map((port) => ({
				id: port.id,
				name: port.name || "Выход"
			}));
			setOutputs(outs);
			for (const input of inputs) input.onmidimessage = (event) => {
				const data = event.data;
				if (!data || data.length < 2) return;
				const cmd = data[0] & 240;
				const key = data[1];
				const vel = data.length > 2 ? data[2] : 0;
				if (cmd === 144 && vel > 0) {
					useStudio.getState().noteOn(key);
					if (!useStudio.getState().playing) getEngine().previewDown(key, vel / 127);
				} else if (cmd === 128 || cmd === 144 && vel === 0) {
					useStudio.getState().noteOff(key);
					peekEngine()?.previewUp(key);
				}
			};
			if (outs[0]) {
				setOutId(outs[0].id);
				getEngine().setMidiPort(midi.outputs.get(outs[0].id) ?? null);
			}
			setNote(inputs.length ? `Входы: ${inputs.map((port) => port.name || "MIDI").join(", ")}` : "Входы не найдены. Выход можно выбрать.");
		} catch {
			setNote("Доступ к MIDI не дали.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "MIDI",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-muted",
				children: note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: () => void connect(),
					children: "Подключить"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					pressed: midiOut,
					onClick: () => setMidiOut(!midiOut),
					title: "Слать ноты арпеджиатора на выход",
					children: "Выход"
				})]
			}),
			outputs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Порт",
					value: outId,
					onChange: (id) => {
						setOutId(id);
						getEngine().setMidiPort(access.current?.outputs.get(id) ?? null);
						setMidiOut(true);
					},
					options: outputs.map((port) => ({
						value: port.id,
						label: port.name
					}))
				})
			}) : null
		]
	});
}
function writeVarLen(value) {
	let v = Math.max(0, Math.floor(value));
	const bytes = [v & 127];
	v >>= 7;
	while (v > 0) {
		bytes.push(v & 127 | 128);
		v >>= 7;
	}
	return bytes.reverse();
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function encodeMidi(opts) {
	const ppq = 480;
	const loops = opts.loops ?? 4;
	const pattern = opts.pattern;
	const beatsPerStep = stepBeats(pattern);
	const rng = mulberry32(517914);
	let arp = { cursor: 0 };
	let beat = 0;
	const events = [];
	const total = Math.max(1, pattern.length) * loops;
	for (let i = 0; i < total; i++) {
		const result = scheduleStep({
			pattern,
			stepIndex: i % pattern.length,
			stepTime: 0,
			stepDur: beatsPerStep,
			active: opts.notes,
			played: opts.notes,
			arp,
			rng
		});
		arp = result.arp;
		for (const note of result.notes) {
			const startBeat = beat + note.time / Math.max(1e-4, beatsPerStep) * beatsPerStep;
			const durBeats = Math.max(.05, note.dur / Math.max(1e-4, beatsPerStep) * beatsPerStep);
			const tick = Math.round(startBeat * ppq);
			const off = Math.round((startBeat + durBeats) * ppq);
			const midi = clamp(Math.round(note.midi), 0, 127);
			const vel = clamp(Math.round(note.vel * 127), 1, 127);
			events.push({
				tick,
				order: 1,
				data: [
					144,
					midi,
					vel
				]
			});
			events.push({
				tick: Math.max(tick + 1, off),
				order: 0,
				data: [
					128,
					midi,
					0
				]
			});
		}
		beat += beatsPerStep;
	}
	events.sort((a, b) => a.tick - b.tick || a.order - b.order);
	const track = [];
	const us = Math.round(6e7 / clamp(opts.bpm, 40, 240));
	track.push(...writeVarLen(0), 255, 81, 3, us >> 16 & 255, us >> 8 & 255, us & 255);
	let last = 0;
	for (const event of events) {
		track.push(...writeVarLen(event.tick - last), ...event.data);
		last = event.tick;
	}
	track.push(...writeVarLen(0), 255, 47, 0);
	const header = [
		77,
		84,
		104,
		100,
		0,
		0,
		0,
		6,
		0,
		0,
		0,
		1,
		1,
		224
	];
	const len = track.length;
	const body = [
		77,
		84,
		114,
		107,
		len >> 24 & 255,
		len >> 16 & 255,
		len >> 8 & 255,
		len & 255,
		...track
	];
	return Uint8Array.from([...header, ...body]);
}
function downloadMidi(bytes, filename) {
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
var NOTE_CODES = {
	KeyA: 0,
	KeyW: 1,
	KeyS: 2,
	KeyE: 3,
	KeyD: 4,
	KeyF: 5,
	KeyT: 6,
	KeyG: 7,
	KeyY: 8,
	KeyH: 9,
	KeyU: 10,
	KeyJ: 11,
	KeyK: 12,
	KeyO: 13,
	KeyL: 14,
	KeyP: 15,
	Semicolon: 16,
	Quote: 17
};
function pressKey(midi) {
	useStudio.getState().noteOn(midi);
	if (!useStudio.getState().playing) getEngine().previewDown(midi);
}
function releaseKey(midi) {
	useStudio.getState().noteOff(midi);
	peekEngine()?.previewUp(midi);
}
function Studio() {
	const [tab, setTab] = (0, import_react.useState)("seq");
	const playing = useStudio((state) => state.playing);
	const bpm = useStudio((state) => state.bpm);
	const latch = useStudio((state) => state.latch);
	const togglePlay = useStudio((state) => state.togglePlay);
	const setBpm = useStudio((state) => state.setBpm);
	const setLatch = useStudio((state) => state.setLatch);
	const taps = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		useStudio.getState().hydrate(localStorage.getItem(STORAGE_KEY));
		let timer = 0;
		const unsub = useStudio.subscribe((state, prev) => {
			window.clearTimeout(timer);
			timer = window.setTimeout(() => persistStudio(), 280);
			const audio = peekEngine();
			if (state.playing && !prev.playing) getEngine().start();
			else if (!state.playing && prev.playing) audio?.stop();
			else if (audio) audio.sync(state);
		});
		const down = /* @__PURE__ */ new Set();
		const onKeyDown = (event) => {
			if (event.target?.closest("input, textarea, select")) return;
			if (event.repeat || down.has(event.code)) return;
			if (event.code === "Space") {
				event.preventDefault();
				useStudio.getState().togglePlay();
				return;
			}
			if (event.code === "KeyZ") {
				useStudio.getState().setOctave(useStudio.getState().octave - 1);
				return;
			}
			if (event.code === "KeyX") {
				useStudio.getState().setOctave(useStudio.getState().octave + 1);
				return;
			}
			if (event.code.startsWith("Digit")) {
				const number = Number(event.code.slice(5));
				if (number >= 1 && number <= 8) {
					event.preventDefault();
					useStudio.getState().requestPattern(number - 1);
				}
				return;
			}
			if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
				event.preventDefault();
				const state = useStudio.getState();
				const length = state.patterns[state.patternIndex]?.length ?? 16;
				const next = event.code === "ArrowRight" ? state.selectedStep + 1 : state.selectedStep - 1;
				state.selectStep(clamp(next, 0, length - 1));
				return;
			}
			if (event.code === "ArrowUp" || event.code === "ArrowDown") {
				event.preventDefault();
				const state = useStudio.getState();
				const step = state.patterns[state.patternIndex]?.steps[state.selectedStep];
				if (!step) return;
				const delta = event.code === "ArrowUp" ? 1 : -1;
				state.setStep(state.selectedStep, { semi: clamp(step.semi + delta, -12, 12) });
				return;
			}
			const semi = NOTE_CODES[event.code];
			if (semi == null) return;
			event.preventDefault();
			down.add(event.code);
			pressKey((useStudio.getState().octave + 1) * 12 + semi);
		};
		const onKeyUp = (event) => {
			if (!down.has(event.code)) return;
			down.delete(event.code);
			const semi = NOTE_CODES[event.code];
			if (semi == null) return;
			releaseKey((useStudio.getState().octave + 1) * 12 + semi);
		};
		const onBlur = () => {
			down.clear();
			for (const midi of useStudio.getState().held) releaseKey(midi);
		};
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", onBlur);
		return () => {
			unsub();
			window.clearTimeout(timer);
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", onBlur);
			peekEngine()?.stop();
		};
	}, []);
	function tap() {
		const now = performance.now();
		const recent = taps.current.filter((stamp) => now - stamp < 2200);
		recent.push(now);
		taps.current = recent.slice(-5);
		if (recent.length < 2) return;
		const gaps = recent.slice(1).map((stamp, index) => stamp - recent[index]);
		const avg = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
		setBpm(clamp(Math.round(6e4 / avg), 40, 240));
	}
	function exportMidi() {
		const state = useStudio.getState();
		const pattern = state.patterns[state.patternIndex];
		const notes = currentNotes({
			held: state.held,
			latched: state.latched,
			latch: state.latch,
			pattern
		});
		if (!notes.length) return;
		downloadMidi(encodeMidi({
			pattern,
			notes,
			bpm: state.bpm,
			loops: 4
		}), "tetiva.mid");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh min-h-0 w-full flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "shrink-0 border-b border-border px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mr-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-lg font-medium tracking-tight",
									children: "TETIVA"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Арпеджиаторный синтезатор"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-testid": "play",
								onClick: togglePlay,
								className: "min-h-11 rounded-sm bg-fg px-4 text-sm font-medium text-bg transition-opacity duration-150 hover:opacity-90",
								children: playing ? "Стоп" : "Пуск"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 min-w-11 rounded-sm border border-border bg-surface-2",
										onClick: () => setBpm(bpm - 1),
										"aria-label": "Медленнее",
										children: "−"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										"aria-label": "Темп",
										inputMode: "numeric",
										className: "h-11 w-16 rounded-sm border border-border bg-surface-2 text-center font-mono text-sm tabular-nums",
										value: bpm,
										onChange: (event) => {
											const next = Number(event.target.value);
											if (Number.isFinite(next)) useStudio.setState({ bpm: Math.round(next) });
										},
										onBlur: () => setBpm(useStudio.getState().bpm)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 min-w-11 rounded-sm border border-border bg-surface-2",
										onClick: () => setBpm(bpm + 1),
										"aria-label": "Быстрее",
										children: "+"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: tap,
								title: "Нажмите несколько раз в темп",
								children: "Тап"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								pressed: latch,
								onClick: () => setLatch(!latch),
								title: "Держать последний аккорд",
								children: "Защёлка"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => {
									peekEngine()?.panic();
									useStudio.getState().releaseAll();
								},
								children: "Сброс"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-end gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presets, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChordReadout, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: exportMidi,
								title: "Четыре круга текущего паттерна",
								children: "MIDI"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "min-h-11 cursor-pointer py-2",
							children: "Как играть"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-3xl pb-2",
							children: "Пуск сразу играет фоновый аккорд. Нижний ряд клавиатуры — белые клавиши, ряд выше — диезы, в том числе в русской раскладке. Z и X сдвигают октаву, пробел запускает, цифры 1–8 выбирают паттерн, стрелки двигают шаг и высоту. Паттерн можно выгрузить в MIDI и унести в DAW."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 gap-2 px-3 py-2 lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
					active: tab === "seq",
					onClick: () => setTab("seq"),
					children: "Секвенция"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
					active: tab === "tone",
					onClick: () => setTab("tone"),
					children: "Синтез"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid w-full max-w-6xl gap-3 p-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.85fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("min-w-0", tab !== "seq" && "max-lg:hidden"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sequencer, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("min-w-0", tab !== "tone" && "max-lg:hidden"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SynthPanel, {})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, {})
		]
	});
}
function TabButton({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": active,
		onClick,
		className: cn("min-h-11 flex-1 rounded-sm border text-sm", active ? "border-fg bg-fg text-bg" : "border-border bg-surface-2 text-muted"),
		children
	});
}
function Presets() {
	const presetId = useStudio((state) => state.presetId);
	const users = useStudio((state) => state.userPresets);
	const loadFactory = useStudio((state) => state.loadFactory);
	const loadUser = useStudio((state) => state.loadUser);
	const saveUser = useStudio((state) => state.saveUser);
	const deleteUser = useStudio((state) => state.deleteUser);
	const [name, setName] = (0, import_react.useState)("");
	const factory = factoryPresets.find((preset) => preset.id === presetId);
	const userName = presetId.startsWith("user:") ? presetId.slice(5) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-1 flex-wrap items-end gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Пресет", factory ? ` · ${factory.blurb}` : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "tetiva-select min-h-11 w-full min-w-0 rounded-sm px-2 text-sm",
					value: presetId,
					onChange: (event) => {
						const value = event.target.value;
						if (value.startsWith("user:")) loadUser(value.slice(5));
						else loadFactory(value);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
						label: "Заводские",
						children: factoryPresets.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: preset.id,
							children: preset.name
						}, preset.id))
					}), users.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
						label: "Мои",
						children: users.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: `user:${preset.name}`,
							children: preset.name
						}, preset.name))
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				"aria-label": "Имя пресета",
				className: "h-11 w-full min-w-0 rounded-sm border border-border bg-surface-2 px-2 text-sm sm:w-40",
				placeholder: "Имя",
				value: name,
				onChange: (event) => setName(event.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				onClick: () => {
					saveUser(name || "Мой");
					setName("");
				},
				children: "Сохранить"
			}),
			userName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				onClick: () => deleteUser(userName),
				title: "Удалить выбранный свой пресет",
				children: "Удалить"
			}) : null
		]
	});
}
function ChordReadout() {
	const held = useStudio((state) => state.held);
	const latched = useStudio((state) => state.latched);
	const latch = useStudio((state) => state.latch);
	const pattern = useStudio((state) => state.patterns[state.patternIndex]);
	if (!pattern) return null;
	const notes = currentNotes({
		held,
		latched,
		latch,
		pattern
	});
	const source = held.length ? "Клавиши" : latch && latched.length ? "Защёлка" : pattern.useFallback ? "Фон" : "Тишина";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "min-h-11 font-mono text-xs text-muted tabular-nums",
		children: [source, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-1 block text-sm text-fg",
			children: notes.length ? notes.map((note) => midiToName(note)).join(" ") : "—"
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {});
}
//#endregion
export { Home as component };
