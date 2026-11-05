"use client";

import { useEffect, useRef } from "react";

export function TitleAtoms() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const button = canvas?.parentElement;
    if (!canvas || !button) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bounds = button.getBoundingClientRect();
    const padding = 14;
    const width = Math.ceil(bounds.width + padding * 2);
    const height = Math.ceil(bounds.height + padding * 2);
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const mask = document.createElement("canvas");
    mask.width = width;
    mask.height = height;
    const painter = mask.getContext("2d", { willReadFrequently: true });
    if (!painter) return;
    const style = getComputedStyle(button);
    painter.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    painter.textBaseline = "middle";
    painter.fillStyle = "white";
    button.querySelectorAll(".title-toy-letters > span").forEach((letter) => {
      const box = letter.getBoundingClientRect();
      painter.fillText(
        letter.textContent ?? "",
        box.left - bounds.left + padding,
        box.top - bounds.top + box.height / 2 + padding,
      );
    });
    const pixels = painter.getImageData(0, 0, width, height).data;
    const particles: { x: number; y: number; dx: number; dy: number }[] = [];
    for (let y = 0; y < height; y += 2)
      for (let x = 0; x < width; x += 2) {
        if (pixels[(y * width + x) * 4 + 3] < 70) continue;
        const angle = (x * 17.13 + y * 9.71) % (Math.PI * 2);
        particles.push({ x, y, dx: Math.cos(angle) * 13, dy: Math.sin(angle) * 12 });
      }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = style.color;
    let started: number | undefined;
    let frame: number;
    const draw = (now: number) => {
      started ??= now;
      const t = Math.min(1, (now - started) / 2100);
      const spread = t < 0.45 ? 1 - (1 - t / 0.45) ** 3 : (1 - (t - 0.45) / 0.55) ** 3;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const x = p.x + p.dx * spread;
        const y = p.y + p.dy * spread;
        ctx.globalAlpha = 1 - spread * 0.2;
        ctx.fillRect(x, y, 1.4, 1.4);
      }
      if (t < 1) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={ref} className="title-atoms" aria-hidden="true" />;
}
