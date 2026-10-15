import { useRef, useState } from "react";
import { Btn, Field, Panel, SelectField } from "@/components/tetiva/controls";
import { getEngine, peekEngine } from "@/lib/synth/engine";
import { useStudio } from "@/lib/synth/store";
import type { SimpleWave, Wave } from "@/lib/synth/types";

const WAVES: { value: Wave; label: string }[] = [
  { value: "sine", label: "Синус" },
  { value: "triangle", label: "Треуг." },
  { value: "sawtooth", label: "Пила" },
  { value: "square", label: "Квадрат" },
  { value: "supersaw", label: "Суперпила" },
];

const DELAYS = [
  { value: "0.25", label: "1/16" },
  { value: "0.375", label: "1/16." },
  { value: "0.5", label: "1/8" },
  { value: "0.75", label: "1/8." },
  { value: "1", label: "1/4" },
  { value: "1.5", label: "1/4." },
  { value: "2", label: "1/2" },
];

function num(value: number, digits = 0): string {
  return digits > 0 ? value.toFixed(digits) : String(Math.round(value));
}

export function SynthPanel() {
  const synth = useStudio((state) => state.synth);
  const update = useStudio((state) => state.updateSynth);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Panel title="Осцилляторы">
        <div className="grid gap-3">
          <OscEditor
            title="OSC 1"
            wave={synth.osc1.wave}
            oct={synth.osc1.oct}
            detune={synth.osc1.detune}
            level={synth.osc1.level}
            onWave={(wave) => update((item) => ({ ...item, osc1: { ...item.osc1, wave } }))}
            onOct={(oct) => update((item) => ({ ...item, osc1: { ...item.osc1, oct } }))}
            onDetune={(detune) => update((item) => ({ ...item, osc1: { ...item.osc1, detune } }))}
            onLevel={(level) => update((item) => ({ ...item, osc1: { ...item.osc1, level } }))}
          />
          <OscEditor
            title="OSC 2"
            wave={synth.osc2.wave}
            oct={synth.osc2.oct}
            detune={synth.osc2.detune}
            level={synth.osc2.level}
            onWave={(wave) => update((item) => ({ ...item, osc2: { ...item.osc2, wave } }))}
            onOct={(oct) => update((item) => ({ ...item, osc2: { ...item.osc2, oct } }))}
            onDetune={(detune) => update((item) => ({ ...item, osc2: { ...item.osc2, detune } }))}
            onLevel={(level) => update((item) => ({ ...item, osc2: { ...item.osc2, level } }))}
          />
        </div>
        <div className="mt-3 grid gap-1">
          <SelectField
            label="Саб"
            value={synth.sub.wave}
            onChange={(wave) => update((item) => ({ ...item, sub: { ...item.sub, wave: wave as "sine" | "square" } }))}
            options={[
              { value: "sine", label: "Синус" },
              { value: "square", label: "Квадрат" },
            ]}
          />
          <Field
            label="Саб окт."
            min={-2}
            max={-1}
            step={1}
            value={synth.sub.oct}
            onChange={(oct) => update((item) => ({ ...item, sub: { ...item.sub, oct: oct <= -2 ? -2 : -1 } }))}
          />
          <Field label="Саб" min={0} max={1} step={0.01} value={synth.sub.level} onChange={(level) => update((item) => ({ ...item, sub: { ...item.sub, level } }))} format={(n) => num(n, 2)} />
          <Field label="Шум" min={0} max={1} step={0.01} value={synth.noise} onChange={(noise) => update((item) => ({ ...item, noise }))} format={(n) => num(n, 2)} />
        </div>
      </Panel>

      <Panel title="Фильтр">
        <SelectField
          label="Тип"
          value={synth.filter.type}
          onChange={(type) =>
            update((item) => ({
              ...item,
              filter: { ...item.filter, type: type as "lowpass" | "highpass" | "bandpass" },
            }))
          }
          options={[
            { value: "lowpass", label: "Нижние" },
            { value: "highpass", label: "Верхние" },
            { value: "bandpass", label: "Полоса" },
          ]}
        />
        <div className="mt-2 grid gap-1">
          <Field label="Срез" min={60} max={12000} step={1} value={synth.filter.cutoff} onChange={(cutoff) => update((item) => ({ ...item, filter: { ...item.filter, cutoff } }))} format={(n) => `${Math.round(n)}`} />
          <Field label="Резонанс" min={0.4} max={18} step={0.1} value={synth.filter.q} onChange={(q) => update((item) => ({ ...item, filter: { ...item.filter, q } }))} format={(n) => num(n, 1)} />
          <Field label="Модуляция" min={-5000} max={7000} step={10} value={synth.filter.env} onChange={(env) => update((item) => ({ ...item, filter: { ...item.filter, env } }))} />
          <Field label="Слежение" min={0} max={1} step={0.01} value={synth.filter.keytrack} onChange={(keytrack) => update((item) => ({ ...item, filter: { ...item.filter, keytrack } }))} format={(n) => num(n, 2)} />
        </div>
      </Panel>

      <Panel title="Огибающие">
        <p className="mb-2 text-xs text-faint">Громкость</p>
        <EnvFields
          value={synth.amp}
          onChange={(amp) => update((item) => ({ ...item, amp }))}
        />
        <p className="mt-3 mb-2 text-xs text-faint">Фильтр</p>
        <EnvFields value={synth.fenv} onChange={(fenv) => update((item) => ({ ...item, fenv }))} />
      </Panel>

      <Panel title="Движение и пространство">
        <div className="grid gap-1">
          <Field label="LFO" min={0.05} max={12} step={0.01} value={synth.lfo.rate} onChange={(rate) => update((item) => ({ ...item, lfo: { ...item.lfo, rate } }))} format={(n) => num(n, 2)} />
          <SelectField
            label="Форма LFO"
            value={synth.lfo.wave}
            onChange={(wave) => update((item) => ({ ...item, lfo: { ...item.lfo, wave: wave as SimpleWave } }))}
            options={[
              { value: "sine", label: "Синус" },
              { value: "triangle", label: "Треуг." },
              { value: "sawtooth", label: "Пила" },
              { value: "square", label: "Квадрат" },
            ]}
          />
          <SelectField
            label="Куда"
            value={synth.lfo.dest}
            onChange={(dest) =>
              update((item) => ({
                ...item,
                lfo: { ...item.lfo, dest: dest as "off" | "pitch" | "cutoff" | "amp" },
              }))
            }
            options={[
              { value: "off", label: "Выкл" },
              { value: "cutoff", label: "Срез" },
              { value: "pitch", label: "Тон" },
              { value: "amp", label: "Громкость" },
            ]}
          />
          <Field label="Глубина" min={0} max={1} step={0.01} value={synth.lfo.depth} onChange={(depth) => update((item) => ({ ...item, lfo: { ...item.lfo, depth } }))} format={(n) => num(n, 2)} />
          <Field label="Глайд" min={0} max={0.4} step={0.005} value={synth.glide} onChange={(glide) => update((item) => ({ ...item, glide }))} format={(n) => num(n, 3)} />
          <Field label="Драйв" min={0} max={1} step={0.01} value={synth.drive} onChange={(drive) => update((item) => ({ ...item, drive }))} format={(n) => num(n, 2)} />
          <Field label="Дилей" min={0} max={0.7} step={0.01} value={synth.delay.mix} onChange={(mix) => update((item) => ({ ...item, delay: { ...item.delay, mix } }))} format={(n) => num(n, 2)} />
          <SelectField
            label="Время"
            value={String(synth.delay.beats)}
            onChange={(beats) => update((item) => ({ ...item, delay: { ...item.delay, beats: Number(beats) } }))}
            options={DELAYS}
          />
          <Field label="Отдача" min={0} max={0.85} step={0.01} value={synth.delay.feedback} onChange={(feedback) => update((item) => ({ ...item, delay: { ...item.delay, feedback } }))} format={(n) => num(n, 2)} />
          <Field label="Реверб" min={0} max={0.6} step={0.01} value={synth.reverb} onChange={(reverb) => update((item) => ({ ...item, reverb }))} format={(n) => num(n, 2)} />
          <Field label="Ширина" min={0} max={1} step={0.01} value={synth.width} onChange={(width) => update((item) => ({ ...item, width }))} format={(n) => num(n, 2)} />
          <Field label="Громкость" min={0} max={1} step={0.01} value={synth.master} onChange={(master) => update((item) => ({ ...item, master }))} format={(n) => num(n, 2)} />
        </div>
        <div className="mt-3">
          <Btn pressed={synth.engineOn} onClick={() => update((item) => ({ ...item, engineOn: !item.engineOn }))}>
            {synth.engineOn ? "Звук включён" : "Звук выключен"}
          </Btn>
        </div>
      </Panel>
      <MidiBar />
    </div>
  );
}

function OscEditor({
  title,
  wave,
  oct,
  detune,
  level,
  onWave,
  onOct,
  onDetune,
  onLevel,
}: {
  title: string;
  wave: Wave;
  oct: number;
  detune: number;
  level: number;
  onWave: (wave: Wave) => void;
  onOct: (oct: number) => void;
  onDetune: (detune: number) => void;
  onLevel: (level: number) => void;
}) {
  return (
    <div className="rounded-sm bg-surface-2 p-2">
      <p className="mb-2 text-xs text-muted">{title}</p>
      <SelectField label="Волна" value={wave} onChange={onWave} options={WAVES} />
      <div className="mt-1">
        <Field label="Октава" min={-2} max={2} step={1} value={oct} onChange={onOct} />
        <Field label="Детюн" min={-40} max={40} step={1} value={detune} onChange={onDetune} />
        <Field label="Уровень" min={0} max={1} step={0.01} value={level} onChange={onLevel} format={(n) => n.toFixed(2)} />
      </div>
    </div>
  );
}

function EnvFields({
  value,
  onChange,
}: {
  value: { a: number; d: number; s: number; r: number };
  onChange: (next: { a: number; d: number; s: number; r: number }) => void;
}) {
  return (
    <div className="grid gap-1">
      <Field label="Атака" min={0.003} max={1.5} step={0.001} value={value.a} onChange={(a) => onChange({ ...value, a })} format={(n) => n.toFixed(3)} />
      <Field label="Спад" min={0.01} max={2} step={0.01} value={value.d} onChange={(d) => onChange({ ...value, d })} format={(n) => n.toFixed(2)} />
      <Field label="Сустейн" min={0} max={1} step={0.01} value={value.s} onChange={(s) => onChange({ ...value, s })} format={(n) => n.toFixed(2)} />
      <Field label="Релиз" min={0.02} max={3} step={0.01} value={value.r} onChange={(r) => onChange({ ...value, r })} format={(n) => n.toFixed(2)} />
    </div>
  );
}

function MidiBar() {
  const midiOut = useStudio((state) => state.midiOut);
  const setMidiOut = useStudio((state) => state.setMidiOut);
  const access = useRef<MIDIAccess | null>(null);
  const [outputs, setOutputs] = useState<{ id: string; name: string }[]>([]);
  const [outId, setOutId] = useState("");
  const [note, setNote] = useState("Контроллер и внешний инструмент через Web MIDI.");

  async function connect() {
    const nav = navigator as Navigator & { requestMIDIAccess?: () => Promise<MIDIAccess> };
    if (!nav.requestMIDIAccess) {
      setNote("В этом браузере нет Web MIDI.");
      return;
    }
    try {
      const midi = await nav.requestMIDIAccess();
      access.current = midi;
      const inputs = [...midi.inputs.values()];
      const outs = [...midi.outputs.values()].map((port) => ({ id: port.id, name: port.name || "Выход" }));
      setOutputs(outs);
      for (const input of inputs) {
        input.onmidimessage = (event) => {
          const data = event.data;
          if (!data || data.length < 2) return;
          const cmd = data[0] & 0xf0;
          const key = data[1];
          const vel = data.length > 2 ? data[2] : 0;
          if (cmd === 0x90 && vel > 0) {
            useStudio.getState().noteOn(key);
            if (!useStudio.getState().playing) getEngine().previewDown(key, vel / 127);
          } else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) {
            useStudio.getState().noteOff(key);
            peekEngine()?.previewUp(key);
          }
        };
      }
      if (outs[0]) {
        setOutId(outs[0].id);
        getEngine().setMidiPort(midi.outputs.get(outs[0].id) ?? null);
      }
      setNote(inputs.length ? `Входы: ${inputs.map((port) => port.name || "MIDI").join(", ")}` : "Входы не найдены. Выход можно выбрать.");
    } catch {
      setNote("Доступ к MIDI не дали.");
    }
  }

  return (
    <Panel title="MIDI">
      <p className="mb-3 text-xs text-muted">{note}</p>
      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => void connect()}>Подключить</Btn>
        <Btn pressed={midiOut} onClick={() => setMidiOut(!midiOut)} title="Слать ноты арпеджиатора на выход">
          Выход
        </Btn>
      </div>
      {outputs.length > 0 ? (
        <div className="mt-3">
          <SelectField
            label="Порт"
            value={outId}
            onChange={(id) => {
              setOutId(id);
              getEngine().setMidiPort(access.current?.outputs.get(id) ?? null);
              setMidiOut(true);
            }}
            options={outputs.map((port) => ({ value: port.id, label: port.name }))}
          />
        </div>
      ) : null}
    </Panel>
  );
}
