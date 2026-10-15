import { useEffect, useRef, useState } from "react";
import { Keyboard } from "@/components/tetiva/keyboard";
import { Sequencer } from "@/components/tetiva/sequencer";
import { SynthPanel } from "@/components/tetiva/synth-panel";
import { Btn } from "@/components/tetiva/controls";
import { getEngine, peekEngine } from "@/lib/synth/engine";
import { downloadMidi, encodeMidi } from "@/lib/synth/midi-file";
import { currentNotes } from "@/lib/synth/pattern";
import { factoryPresets } from "@/lib/synth/presets";
import { STORAGE_KEY, persistStudio, useStudio } from "@/lib/synth/store";
import { clamp, midiToName } from "@/lib/synth/theory";
import { cn } from "@/lib/cn";

const NOTE_CODES: Record<string, number> = {
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
  Quote: 17,
};

function pressKey(midi: number) {
  useStudio.getState().noteOn(midi);
  if (!useStudio.getState().playing) getEngine().previewDown(midi);
}

function releaseKey(midi: number) {
  useStudio.getState().noteOff(midi);
  peekEngine()?.previewUp(midi);
}

export function Studio() {
  const [tab, setTab] = useState<"seq" | "tone">("seq");
  const playing = useStudio((state) => state.playing);
  const bpm = useStudio((state) => state.bpm);
  const latch = useStudio((state) => state.latch);
  const togglePlay = useStudio((state) => state.togglePlay);
  const setBpm = useStudio((state) => state.setBpm);
  const setLatch = useStudio((state) => state.setLatch);
  const taps = useRef<number[]>([]);

  useEffect(() => {
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
    const down = new Set<string>();
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
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
    const onKeyUp = (event: KeyboardEvent) => {
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
    setBpm(clamp(Math.round(60000 / avg), 40, 240));
  }

  function exportMidi() {
    const state = useStudio.getState();
    const pattern = state.patterns[state.patternIndex];
    const notes = currentNotes({ held: state.held, latched: state.latched, latch: state.latch, pattern });
    if (!notes.length) return;
    downloadMidi(encodeMidi({ pattern, notes, bpm: state.bpm, loops: 4 }), "tetiva.mid");
  }

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col bg-bg text-fg">
      <header className="shrink-0 border-b border-border px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-1 min-w-0">
            <h1 className="text-lg font-medium tracking-tight">TETIVA</h1>
            <p className="text-xs text-muted">Арпеджиаторный синтезатор</p>
          </div>
          <button
            type="button"
            data-testid="play"
            onClick={togglePlay}
            className="min-h-11 rounded-sm bg-fg px-4 text-sm font-medium text-bg transition-opacity duration-150 hover:opacity-90"
          >
            {playing ? "Стоп" : "Пуск"}
          </button>
          <div className="flex items-center gap-1">
            <button type="button" className="min-h-11 min-w-11 rounded-sm border border-border bg-surface-2" onClick={() => setBpm(bpm - 1)} aria-label="Медленнее">
              −
            </button>
            <input
              aria-label="Темп"
              inputMode="numeric"
              className="h-11 w-16 rounded-sm border border-border bg-surface-2 text-center font-mono text-sm tabular-nums"
              value={bpm}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isFinite(next)) useStudio.setState({ bpm: Math.round(next) });
              }}
              onBlur={() => setBpm(useStudio.getState().bpm)}
            />
            <button type="button" className="min-h-11 min-w-11 rounded-sm border border-border bg-surface-2" onClick={() => setBpm(bpm + 1)} aria-label="Быстрее">
              +
            </button>
          </div>
          <Btn onClick={tap} title="Нажмите несколько раз в темп">
            Тап
          </Btn>
          <Btn pressed={latch} onClick={() => setLatch(!latch)} title="Держать последний аккорд">
            Защёлка
          </Btn>
          <Btn
            onClick={() => {
              peekEngine()?.panic();
              useStudio.getState().releaseAll();
            }}
          >
            Сброс
          </Btn>
        </div>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <Presets />
          <ChordReadout />
          <Btn onClick={exportMidi} title="Четыре круга текущего паттерна">
            MIDI
          </Btn>
        </div>
        <details className="mt-2 text-xs text-muted">
          <summary className="min-h-11 cursor-pointer py-2">Как играть</summary>
          <p className="max-w-3xl pb-2">
            Пуск сразу играет фоновый аккорд. Нижний ряд клавиатуры — белые клавиши, ряд выше — диезы, в том числе в русской раскладке. Z и X сдвигают октаву, пробел запускает, цифры 1–8 выбирают паттерн, стрелки двигают шаг и высоту. Паттерн можно выгрузить в MIDI и унести в DAW.
          </p>
        </details>
      </header>
      <div className="flex shrink-0 gap-2 px-3 py-2 lg:hidden">
        <TabButton active={tab === "seq"} onClick={() => setTab("seq")}>
          Секвенция
        </TabButton>
        <TabButton active={tab === "tone"} onClick={() => setTab("tone")}>
          Синтез
        </TabButton>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto grid w-full max-w-6xl gap-3 p-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.85fr)]">
          <div className={cn("min-w-0", tab !== "seq" && "max-lg:hidden")}>
            <Sequencer />
          </div>
          <div className={cn("min-w-0", tab !== "tone" && "max-lg:hidden")}>
            <SynthPanel />
          </div>
        </div>
      </div>
      <Keyboard />
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-11 flex-1 rounded-sm border text-sm",
        active ? "border-fg bg-fg text-bg" : "border-border bg-surface-2 text-muted",
      )}
    >
      {children}
    </button>
  );
}

function Presets() {
  const presetId = useStudio((state) => state.presetId);
  const users = useStudio((state) => state.userPresets);
  const loadFactory = useStudio((state) => state.loadFactory);
  const loadUser = useStudio((state) => state.loadUser);
  const saveUser = useStudio((state) => state.saveUser);
  const deleteUser = useStudio((state) => state.deleteUser);
  const [name, setName] = useState("");
  const factory = factoryPresets.find((preset) => preset.id === presetId);
  const userName = presetId.startsWith("user:") ? presetId.slice(5) : "";

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted">
        <span>Пресет{factory ? ` · ${factory.blurb}` : ""}</span>
        <select
          className="tetiva-select min-h-11 w-full min-w-0 rounded-sm px-2 text-sm"
          value={presetId}
          onChange={(event) => {
            const value = event.target.value;
            if (value.startsWith("user:")) loadUser(value.slice(5));
            else loadFactory(value);
          }}
        >
          <optgroup label="Заводские">
            {factoryPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </optgroup>
          {users.length > 0 ? (
            <optgroup label="Мои">
              {users.map((preset) => (
                <option key={preset.name} value={`user:${preset.name}`}>
                  {preset.name}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </label>
      <input
        aria-label="Имя пресета"
        className="h-11 w-full min-w-0 rounded-sm border border-border bg-surface-2 px-2 text-sm sm:w-40"
        placeholder="Имя"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Btn
        onClick={() => {
          saveUser(name || "Мой");
          setName("");
        }}
      >
        Сохранить
      </Btn>
      {userName ? (
        <Btn onClick={() => deleteUser(userName)} title="Удалить выбранный свой пресет">
          Удалить
        </Btn>
      ) : null}
    </div>
  );
}

function ChordReadout() {
  const held = useStudio((state) => state.held);
  const latched = useStudio((state) => state.latched);
  const latch = useStudio((state) => state.latch);
  const pattern = useStudio((state) => state.patterns[state.patternIndex]);
  if (!pattern) return null;
  const notes = currentNotes({ held, latched, latch, pattern });
  const source = held.length ? "Клавиши" : latch && latched.length ? "Защёлка" : pattern.useFallback ? "Фон" : "Тишина";
  return (
    <p className="min-h-11 font-mono text-xs text-muted tabular-nums">
      {source}
      <span className="mt-1 block text-sm text-fg">{notes.length ? notes.map((note) => midiToName(note)).join(" ") : "—"}</span>
    </p>
  );
}
