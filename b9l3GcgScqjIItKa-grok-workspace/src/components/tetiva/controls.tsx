import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Panel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-border bg-surface p-3", className)}>
      <h2 className="mb-3 text-xs font-medium text-muted">{title}</h2>
      {children}
    </section>
  );
}

export function Btn({
  children,
  onClick,
  pressed,
  title,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  pressed?: boolean;
  title?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-sm border border-border px-3 text-sm transition-colors duration-150 disabled:opacity-40",
        pressed ? "bg-fg text-bg" : "bg-surface-2 text-fg hover:bg-surface-3",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  title,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  title?: string;
}) {
  return (
    <label className="grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)_2.75rem] items-center gap-2 text-xs" title={title}>
      <span className="truncate text-muted">{label}</span>
      <input
        className="tetiva-range w-full min-w-0"
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : min}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
      <span className="text-right font-mono text-fg tabular-nums">{format ? format(value) : String(value)}</span>
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  title,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  title?: string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-xs text-muted" title={title}>
      <span>{label}</span>
      <select
        className="tetiva-select min-h-11 w-full min-w-0 rounded-sm px-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
