import { useRef } from "react";
import { getEngine, peekEngine } from "@/lib/synth/engine";
import { useStudio } from "@/lib/synth/store";
import { midiToName, mod } from "@/lib/synth/theory";
import { cn } from "@/lib/cn";

const BLACK = new Set([1, 3, 6, 8, 10]);

function press(midi: number) {
  useStudio.getState().noteOn(midi);
  if (!useStudio.getState().playing) getEngine().previewDown(midi);
}

function release(midi: number) {
  useStudio.getState().noteOff(midi);
  peekEngine()?.previewUp(midi);
}

export function Keyboard() {
  const octave = useStudio((state) => state.octave);
  const held = useStudio((state) => state.held);
  const setOctave = useStudio((state) => state.setOctave);
  const base = (octave + 1) * 12;
  const current = useRef<number | null>(null);
  const whites: number[] = [];
  const blacks: { midi: number; after: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const midi = base + i;
    if (BLACK.has(mod(i, 12))) {
      blacks.push({ midi, after: whites.length - 1 });
    } else {
      whites.push(midi);
    }
  }

  function atPoint(x: number, y: number): number | null {
    const el = document.elementFromPoint(x, y);
    const key = el?.closest("[data-midi]");
    if (!key) return null;
    const midi = Number((key as HTMLElement).dataset.midi);
    return Number.isFinite(midi) ? midi : null;
  }

  function glide(midi: number | null) {
    if (current.current === midi) return;
    if (current.current != null) release(current.current);
    if (midi != null) press(midi);
    current.current = midi;
  }

  return (
    <footer className="shrink-0 border-t border-border bg-surface px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs text-muted">Клавиатура · {midiToName(base)}</p>
        <div className="flex gap-1">
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-sm border border-border bg-surface-2 text-sm"
            onClick={() => setOctave(octave - 1)}
            aria-label="Октавой ниже"
          >
            −
          </button>
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-sm border border-border bg-surface-2 text-sm"
            onClick={() => setOctave(octave + 1)}
            aria-label="Октавой выше"
          >
            +
          </button>
        </div>
      </div>
      <div
        className="relative h-28 touch-none select-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          glide(atPoint(event.clientX, event.clientY));
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          glide(atPoint(event.clientX, event.clientY));
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          glide(null);
        }}
        onPointerCancel={() => glide(null)}
      >
        <div className="flex h-full gap-px">
          {whites.map((midi) => {
            const name = midiToName(midi);
            const active = held.includes(midi);
            return (
              <button
                key={midi}
                type="button"
                data-midi={midi}
                aria-label={name}
                aria-pressed={active}
                className={cn(
                  "flex h-full min-w-0 flex-1 flex-col justify-end rounded-sm border border-border text-xs",
                  active ? "bg-accent text-bg" : "bg-fg text-bg",
                )}
              >
                <span className="mt-auto block pb-1 font-mono">{name.startsWith("C") && !name.startsWith("C#") ? name : ""}</span>
              </button>
            );
          })}
        </div>
        {blacks.map((key) => {
          const width = 100 / whites.length;
          const center = ((key.after + 1) / whites.length) * 100;
          const active = held.includes(key.midi);
          return (
            <button
              key={key.midi}
              type="button"
              data-midi={key.midi}
              aria-label={midiToName(key.midi)}
              aria-pressed={active}
              className={cn(
                "absolute top-0 z-10 h-[58%] rounded-sm border border-border",
                active ? "bg-accent" : "bg-bg",
              )}
              style={{ width: `${width * 0.62}%`, left: `${center - width * 0.31}%` }}
            />
          );
        })}
      </div>
    </footer>
  );
}
