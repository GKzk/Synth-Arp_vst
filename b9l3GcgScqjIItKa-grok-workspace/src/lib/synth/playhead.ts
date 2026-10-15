import { useEffect, useState } from "react";

export type PlayInfo = { step: number; notes: string[] };

let info: PlayInfo = { step: -1, notes: [] };
const subs = new Set<(p: PlayInfo) => void>();

export function publishPlay(next: PlayInfo) {
  if (next.step === info.step && next.notes.join("|") === info.notes.join("|")) return;
  info = next;
  for (const fn of subs) fn(next);
}

export function usePlay(): PlayInfo {
  const [value, setValue] = useState<PlayInfo>(info);
  useEffect(() => {
    subs.add(setValue);
    setValue(info);
    return () => {
      subs.delete(setValue);
    };
  }, []);
  return value;
}
