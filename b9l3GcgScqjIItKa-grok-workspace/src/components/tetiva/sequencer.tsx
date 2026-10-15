import type { PointerEvent } from "react";
import { useRef } from "react";
import { Btn, Field, Panel, SelectField } from "@/components/tetiva/controls";
import { Scope } from "@/components/tetiva/scope";
import { usePlay } from "@/lib/synth/playhead";
import {
  applyEuclid,
  mutateSteps,
  randomMelody,
  randomRhythm,
  reverseSteps,
  setAllOn,
  shiftSteps,
} from "@/lib/synth/pattern";
import { useStudio } from "@/lib/synth/store";
import { MODE_LABELS, NOTE_NAMES, SCALE_LABELS, SCALE_ORDER, clamp, midiToName } from "@/lib/synth/theory";
import type { ArpMode, Harmony, Pattern, ScaleName, Step } from "@/lib/synth/types";
import { cn } from "@/lib/cn";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const LENGTHS = [8, 12, 16, 24, 32];
const RATES: { id: string; rate: number; triplet: boolean; dotted: boolean; label: string }[] = [
  { id: "4", rate: 4, triplet: false, dotted: false, label: "1/4" },
  { id: "4d", rate: 4, triplet: false, dotted: true, label: "1/4." },
  { id: "4t", rate: 4, triplet: true, dotted: false, label: "1/4T" },
  { id: "8", rate: 8, triplet: false, dotted: false, label: "1/8" },
  { id: "8d", rate: 8, triplet: false, dotted: true, label: "1/8." },
  { id: "8t", rate: 8, triplet: true, dotted: false, label: "1/8T" },
  { id: "16", rate: 16, triplet: false, dotted: false, label: "1/16" },
  { id: "16d", rate: 16, triplet: false, dotted: true, label: "1/16." },
  { id: "16t", rate: 16, triplet: true, dotted: false, label: "1/16T" },
  { id: "32", rate: 32, triplet: false, dotted: false, label: "1/32" },
  { id: "32t", rate: 32, triplet: true, dotted: false, label: "1/32T" },
];

function rateId(pattern: Pattern): string {
  return (
    RATES.find((rate) => rate.rate === pattern.rate && rate.triplet === pattern.triplet && rate.dotted === pattern.dotted)
      ?.id ?? "16"
  );
}

function semiTop(semi: number): number {
  return ((12 - clamp(semi, -12, 12)) / 24) * 100;
}

export function Sequencer() {
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

  function edit(patch: Partial<Step>) {
    useStudio.getState().setStep(stepIndex, patch);
  }

  function withCurrent(recipe: (current: Pattern) => Step[]) {
    const current = useStudio.getState().patterns[useStudio.getState().patternIndex];
    replaceSteps(recipe(current));
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Panel title="Секвенция">
        <Scope />
        <NowPlaying />
        <div className="mt-3 grid grid-cols-8 gap-1">
          {LETTERS.map((letter, index) => {
            const inChain = chainEnabled && chain.includes(index);
            return (
              <button
                key={letter}
                type="button"
                onClick={() => requestPattern(index)}
                aria-pressed={patternIndex === index}
                className={cn(
                  "relative min-h-11 rounded-sm border text-sm font-medium transition-colors duration-150",
                  patternIndex === index
                    ? "border-fg bg-fg text-bg"
                    : pending === index
                      ? "border-fg bg-surface-2 text-fg"
                      : "border-border bg-surface-2 text-muted hover:bg-surface-3",
                )}
              >
                {letter}
                {inChain ? <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-accent" /> : null}
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Источник"
            title="Арп перебирает зажатые ноты. Гамма читает шаг как ступень. Ноты выбирают звук аккорда по номеру."
            value={pattern.harmony}
            onChange={(harmony) => patchPattern({ harmony: harmony as Harmony })}
            options={[
              { value: "arp", label: "Арпеджио" },
              { value: "scale", label: "Гамма" },
              { value: "index", label: "Ноты аккорда" },
            ]}
          />
          <SelectField
            label="Порядок"
            value={pattern.mode}
            onChange={(mode) => patchPattern({ mode: mode as ArpMode })}
            options={Object.entries(MODE_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <SelectField
            label="Шаг"
            value={rateId(pattern)}
            onChange={(id) => {
              const rate = RATES.find((item) => item.id === id);
              if (!rate) return;
              patchPattern({ rate: rate.rate, triplet: rate.triplet, dotted: rate.dotted });
            }}
            options={RATES.map((rate) => ({ value: rate.id, label: rate.label }))}
          />
          <SelectField
            label="Гамма"
            value={pattern.scale}
            onChange={(scale) => patchPattern({ scale: scale as ScaleName })}
            options={SCALE_ORDER.map((scale) => ({ value: scale, label: SCALE_LABELS[scale] }))}
          />
        </div>
        <div className="mt-3">
          <Lane kind="semi" />
          <div className="mt-1">
            <Lane kind="vel" />
          </div>
          <div className="mt-1">
            <Lane kind="gate" />
          </div>
          <div className="mt-1">
            <Lane kind="prob" />
          </div>
          <p className="mt-2 text-xs text-faint">Верх — высота. Ниже — скорость, гейт, шанс. Тап включает шаг, жест вверх-вниз рисует.</p>
        </div>
      </Panel>

      {step ? (
        <Panel title={`Шаг ${stepIndex + 1}`}>
          <div className="mb-3 flex flex-wrap gap-2">
            <Btn pressed={step.on} onClick={() => edit({ on: !step.on })}>
              {step.on ? "Включён" : "Выключен"}
            </Btn>
            <Btn pressed={step.accent} onClick={() => edit({ accent: !step.accent })} title="Громче и ярче">
              Акцент
            </Btn>
            <Btn pressed={step.slide} onClick={() => edit({ slide: !step.slide })} title="Подъезд к ноте">
              Слайд
            </Btn>
            {[1, 2, 3, 4].map((ratchet) => (
              <Btn key={ratchet} pressed={step.ratchet === ratchet} onClick={() => edit({ ratchet })} title="Повторы внутри шага">
                ×{ratchet}
              </Btn>
            ))}
          </div>
          <div className="grid gap-1 sm:grid-cols-2">
            <Field label={semiLabel} min={-12} max={12} step={1} value={step.semi} onChange={(semi) => edit({ semi })} />
            <Field label="Октава" min={-2} max={2} step={1} value={step.oct} onChange={(oct) => edit({ oct })} />
            <Field label="Скорость" min={1} max={127} step={1} value={step.vel} onChange={(vel) => edit({ vel })} />
            <Field label="Гейт" min={0.15} max={1.5} step={0.01} value={step.gate} onChange={(gate) => edit({ gate })} format={(n) => n.toFixed(2)} />
            <Field label="Шанс" min={0} max={100} step={1} value={step.prob} onChange={(prob) => edit({ prob })} format={(n) => `${Math.round(n)}%`} />
          </div>
        </Panel>
      ) : null}

      <Panel title="Фраза">
        <div className="grid gap-1 sm:grid-cols-2">
          <Field label="Октавы" min={1} max={4} step={1} value={pattern.octaves} onChange={(octaves) => patchPattern({ octaves })} title="Сколько октав проходит арпеджио" />
          <Field label="Длина" min={0.15} max={1.6} step={0.01} value={pattern.gate} onChange={(gate) => patchPattern({ gate })} format={(n) => n.toFixed(2)} title="Общий гейт" />
          <Field label="Свинг" min={0} max={0.55} step={0.01} value={pattern.swing} onChange={(swing) => patchPattern({ swing })} format={(n) => `${Math.round(n * 100)}%`} />
          <Field label="Струм" min={0} max={0.04} step={0.001} value={pattern.strum} onChange={(strum) => patchPattern({ strum })} format={(n) => `${Math.round(n * 1000)}`} title="Задержка между нотами аккорда, мс" />
          <Field label="Живость" min={0} max={1} step={0.01} value={pattern.humanize} onChange={(humanize) => patchPattern({ humanize })} format={(n) => `${Math.round(n * 100)}%`} />
          <Field label="Низ" min={24} max={72} step={1} value={pattern.foldLow} onChange={(foldLow) => patchPattern({ foldLow })} format={midiToName} />
          <Field label="Верх" min={60} max={108} step={1} value={pattern.foldHigh} onChange={(foldHigh) => patchPattern({ foldHigh })} format={midiToName} />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <SelectField
            label="Корень"
            value={String(pattern.root)}
            onChange={(root) => patchPattern({ root: Number(root) })}
            options={NOTE_NAMES.map((name, index) => ({ value: String(index), label: name }))}
          />
          <div className="flex flex-wrap items-end gap-2">
            <Btn pressed={pattern.followRoot} onClick={() => patchPattern({ followRoot: !pattern.followRoot })} title="Корень гаммы — самая низкая зажатая нота">
              От баса
            </Btn>
            <Btn pressed={pattern.quantize} onClick={() => patchPattern({ quantize: !pattern.quantize })} title="Притянуть арпеджио к гамме">
              Квантайз
            </Btn>
            <Btn pressed={pattern.useFallback} onClick={() => patchPattern({ useFallback: !pattern.useFallback })} title="Играть запасной аккорд, если клавиши молчат">
              Фон
            </Btn>
          </div>
        </div>
        <p className="mt-2 font-mono text-xs text-muted">
          Фон: {pattern.fallback.map((note) => midiToName(note)).join(" ")}
        </p>
        <div className="mt-2">
          <Btn disabled={held.length === 0 && latched.length === 0} onClick={captureFallback} title="Записать зажатый или защёлкнутый аккорд как фон">
            Запомнить аккорд
          </Btn>
        </div>
      </Panel>

      <Panel title="Ритм и цепочка">
        <div className="mb-3 flex flex-wrap gap-2">
          {LENGTHS.map((length) => (
            <Btn key={length} pressed={pattern.length === length} onClick={() => patchPattern({ length })}>
              {length}
            </Btn>
          ))}
        </div>
        <div className="grid gap-1 sm:grid-cols-2">
          <Field label="Евклид" min={0} max={pattern.length} step={1} value={pattern.euclidHits} onChange={(euclidHits) => patchPattern({ euclidHits })} title="Число ударов на длину паттерна" />
          <Field label="Поворот" min={0} max={Math.max(0, pattern.length - 1)} step={1} value={pattern.euclidRot} onChange={(euclidRot) => patchPattern({ euclidRot })} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={() => withCurrent(applyEuclid)}>Евклид</Btn>
          <Btn onClick={() => withCurrent(randomRhythm)}>Ритм</Btn>
          <Btn onClick={() => withCurrent(randomMelody)}>Мелодия</Btn>
          <Btn onClick={() => withCurrent(mutateSteps)}>Мутация</Btn>
          <Btn onClick={() => withCurrent((item) => shiftSteps(item, -1))}>Сдвиг ←</Btn>
          <Btn onClick={() => withCurrent((item) => shiftSteps(item, 1))}>Сдвиг →</Btn>
          <Btn onClick={() => withCurrent(reverseSteps)}>Реверс</Btn>
          <Btn onClick={() => withCurrent((item) => setAllOn(item, true))}>Все</Btn>
          <Btn onClick={() => withCurrent((item) => setAllOn(item, false))}>Тишина</Btn>
          <Btn onClick={copyPattern}>Копия</Btn>
          <Btn disabled={!clipboard} onClick={pastePattern}>Вставить</Btn>
          <Btn onClick={duplicateNext}>Дубль</Btn>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Btn pressed={chainEnabled} onClick={() => setChainEnabled(!chainEnabled)} title="После круга переходить к следующему слоту">
            Цепочка
          </Btn>
          <Btn pressed={instant} onClick={() => setInstant(!instant)} title="Менять паттерн сразу, не дожидаясь конца круга">
            Сразу
          </Btn>
          {pending != null ? <span className="text-xs text-muted">Далее {LETTERS[pending]}</span> : null}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {chain.slice(0, 4).map((value, slot) => (
            <SelectField
              key={slot}
              label={`${slot + 1}`}
              value={String(value)}
              onChange={(next) => setChainSlot(slot, Number(next))}
              options={LETTERS.map((letter, index) => ({ value: String(index), label: letter }))}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function NowPlaying() {
  const play = usePlay();
  const text = play.step < 0 ? "—" : play.notes.length ? play.notes.join(" ") : "пауза";
  return (
    <p className="mt-2 font-mono text-sm text-accent tabular-nums">
      Сейчас {text}
    </p>
  );
}

type LaneKind = "semi" | "vel" | "gate" | "prob";

function Lane({ kind }: { kind: LaneKind }) {
  const pattern = useStudio((state) => state.patterns[state.patternIndex]);
  const selected = useStudio((state) => state.selectedStep);
  const play = usePlay();
  const gesture = useRef<{ y: number; x: number; moved: boolean } | null>(null);
  if (!pattern) return null;
  const length = pattern.length;
  const tall = kind === "semi";

  function point(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 0.999);
    const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
    return { index: Math.min(length - 1, Math.floor(x * length)), y };
  }

  function paint(index: number, y: number, enable: boolean) {
    const current = useStudio.getState().patterns[useStudio.getState().patternIndex];
    const step = current?.steps[index];
    if (!step) return;
    if (kind === "semi") {
      const semi = clamp(Math.round(12 - y * 24), -12, 12);
      useStudio.getState().setStep(index, { semi, on: enable ? true : step.on });
      return;
    }
    if (kind === "vel") {
      useStudio.getState().setStep(index, { vel: clamp(Math.round((1 - y) * 126 + 1), 1, 127) });
      return;
    }
    if (kind === "gate") {
      useStudio.getState().setStep(index, { gate: Math.round((0.15 + (1 - y) * 1.35) * 100) / 100 });
      return;
    }
    useStudio.getState().setStep(index, { prob: clamp(Math.round((1 - y) * 100), 0, 100) });
  }

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="relative" style={{ width: `max(100%, ${length * 44}px)` }}>
        {kind === "semi" ? (
          <div className="mb-1 grid" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
            {Array.from({ length }, (_, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "h-6 font-mono text-xs tabular-nums",
                  play.step === index ? "text-accent" : index === selected ? "text-fg" : "text-faint",
                )}
                onClick={() => useStudio.getState().selectStep(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        ) : (
          <p className="mb-1 text-xs text-faint">{kind === "vel" ? "Скорость" : kind === "gate" ? "Гейт" : "Шанс"}</p>
        )}
        <div
          className={cn("relative touch-none rounded-sm border border-border bg-bg", tall ? "h-32" : "h-10")}
          style={{ display: "grid", gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            const hit = point(event);
            gesture.current = { x: event.clientX, y: event.clientY, moved: false };
            if (kind !== "semi") paint(hit.index, hit.y, true);
            else useStudio.getState().selectStep(hit.index);
          }}
          onPointerMove={(event) => {
            const drag = gesture.current;
            if (!drag || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
            if (Math.abs(event.clientX - drag.x) > 4 || Math.abs(event.clientY - drag.y) > 4) drag.moved = true;
            if (!drag.moved) return;
            const hit = point(event);
            paint(hit.index, hit.y, true);
          }}
          onPointerUp={(event) => {
            const drag = gesture.current;
            gesture.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            if (kind === "semi" && drag && !drag.moved) {
              const hit = point(event);
              const current = useStudio.getState().patterns[useStudio.getState().patternIndex];
              const step = current?.steps[hit.index];
              if (step) useStudio.getState().setStep(hit.index, { on: !step.on });
            }
          }}
        >
          {tall ? <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-px bg-border" /> : null}
          {pattern.steps.slice(0, length).map((step, index) => (
            <div
              key={index}
              className={cn(
                "relative",
                play.step === index && "bg-surface-3",
                index === selected && play.step !== index && "bg-surface-2",
              )}
            >
              {kind === "semi" ? (
                <div
                  className={cn(
                    "absolute right-0.5 left-0.5 z-10 h-1.5 -translate-y-1/2 rounded-sm",
                    step.on ? "bg-fg" : "bg-faint",
                  )}
                  style={{ top: `${semiTop(step.semi)}%` }}
                />
              ) : (
                <div
                  className={cn("absolute inset-x-0.5 bottom-0", step.on ? "bg-fg" : "bg-faint")}
                  style={{
                    height: `${kind === "vel" ? (step.vel / 127) * 100 : kind === "gate" ? ((step.gate - 0.15) / 1.35) * 100 : step.prob}%`,
                  }}
                />
              )}
              {tall && step.ratchet > 1 ? (
                <span className="absolute bottom-0.5 left-0.5 font-mono text-xs text-muted">×{step.ratchet}</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
