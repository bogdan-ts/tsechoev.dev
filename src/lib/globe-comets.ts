export type Comet = {
  startedAt: number;
  duration: number;
  angle: number;
  offset: number;
  front: boolean;
  warm: boolean;
  seed: number;
};
export type CometSky = { time: number; nextAt: number; comet: Comet | null };

const delay = (random: () => number) => 45000 + random() * 75000;

export function createCometSky(random = Math.random): CometSky {
  return { time: 0, nextAt: delay(random), comet: null };
}

export function advanceCometSky(sky: CometSky, elapsed: number, random = Math.random): CometSky {
  const time = sky.time + Math.max(0, Math.min(100, elapsed));
  if (sky.comet && time >= sky.comet.startedAt + sky.comet.duration) {
    return { time, nextAt: time + delay(random), comet: null };
  }
  if (!sky.comet && time >= sky.nextAt) {
    return {
      time,
      nextAt: Infinity,
      comet: {
        startedAt: time,
        duration: 2800 + random() * 1800,
        angle: random() * Math.PI * 2,
        offset: (random() - 0.5) * 0.7,
        front: random() < 0.5,
        warm: random() < 0.5,
        seed: random() * 1000,
      },
    };
  }
  return { ...sky, time };
}

export function paintComet(
  context: CanvasRenderingContext2D,
  sky: CometSky,
  width: number,
  height: number,
  radiusX: number,
  radiusY: number,
) {
  const comet = sky.comet;
  if (!comet) return;
  const progress = (sky.time - comet.startedAt) / comet.duration;
  if (progress < 0 || progress > 1) return;
  const dx = Math.cos(comet.angle);
  const dy = Math.sin(comet.angle);
  const scale = Math.hypot(width, height) / 2;
  const headX = width / 2 + ((progress * 3.4 - 1.7) * dx - comet.offset * dy) * scale;
  const headY = height / 2 + ((progress * 3.4 - 1.7) * dy + comet.offset * dx) * scale;
  const fade = Math.min(1, progress * 12, (1 - progress) * 12);
  context.save();
  if (!comet.front) {
    context.beginPath();
    context.rect(0, 0, width, height);
    context.ellipse(width / 2, height / 2, radiusX, radiusY, 0, 0, Math.PI * 2);
    context.clip("evenodd");
  }
  context.fillStyle = comet.warm ? "#f1ce87" : "#a6dce8";
  context.shadowColor = context.fillStyle;
  context.shadowBlur = 5;
  for (let i = 22; i >= 0; i--) {
    const distance = i * 3.5;
    const shimmer = 0.6 + 0.4 * Math.sin(sky.time * 0.02 + i * 2.3 + comet.seed) ** 2;
    context.globalAlpha = fade * (1 - i / 24) ** 1.5 * shimmer;
    context.fillText(
      i === 0 ? "*" : i < 5 ? "+" : ".",
      headX - dx * distance,
      headY - dy * distance,
    );
  }
  context.shadowBlur = 2;
  for (let i = 0; i < 16; i++) {
    const phase = (sky.time / 650 + i * 0.618 + comet.seed) % 1;
    const spread = Math.sin(i * 23.17 + comet.seed) * phase * 18;
    const distance = phase * 90 + (i % 4) * 6;
    context.globalAlpha =
      fade * (1 - phase) ** 2 * (0.3 + 0.7 * Math.sin(sky.time * 0.027 + i) ** 2);
    context.fillText(
      i % 3 === 0 ? "+" : ".",
      headX - dx * distance - dy * spread,
      headY - dy * distance + dx * spread,
    );
  }
  context.restore();
}
