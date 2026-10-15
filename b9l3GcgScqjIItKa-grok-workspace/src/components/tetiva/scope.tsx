import { useEffect, useRef } from "react";
import { peekEngine } from "@/lib/synth/engine";

export function Scope() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const buffer = new Uint8Array(1024);
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
          const sample = buffer[Math.floor((i / Math.max(1, width)) * (buffer.length - 1))] / 128 - 1;
          const y = height / 2 + sample * height * 0.42;
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

  return <canvas ref={ref} className="h-12 w-full" aria-hidden />;
}
