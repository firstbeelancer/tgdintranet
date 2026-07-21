import { useEffect, useRef } from "react";

type Stream = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  baseHue: number;
  brightness: number;
  life: number;
  maxLife: number;
  turns: { at: number; toHorizontal: boolean }[];
  turned: number;
  glowBoost: number;
};

export type DataParticlesVariant = "dark" | "light";

type DataParticlesProps = {
  /** dark — login galaxy; light — white portal background */
  variant?: DataParticlesVariant;
  className?: string;
  /** number of snake streams */
  streamCount?: number;
};

const PIXEL = 7;
const GAP = 3;
const STEP = PIXEL + GAP;
const TRAIL_LENGTH = 13;

function createStream(width: number, height: number, variant: DataParticlesVariant): Stream {
  const horizontal = Math.random() < 0.58;
  const dir = Math.random() > 0.5 ? 1 : -1;
  const gridX = Math.floor(Math.random() * (width / STEP)) * STEP;
  const gridY = Math.floor(Math.random() * (height / STEP)) * STEP;

  let x: number;
  let y: number;
  let vx: number;
  let vy: number;
  if (horizontal) {
    x = dir > 0 ? -STEP * 2 : width + STEP * 2;
    y = gridY;
    vx = dir * (0.85 + Math.random() * 0.7);
    vy = 0;
  } else {
    x = gridX;
    y = dir > 0 ? -STEP * 2 : height + STEP * 2;
    vx = 0;
    vy = dir * (0.85 + Math.random() * 0.7);
  }

  const turns: Stream["turns"] = [];
  const turnCount = Math.random() < 0.6 ? 1 + Math.floor(Math.random() * 2) : 0;
  for (let i = 0; i < turnCount; i++) {
    turns.push({
      at: 0.2 + Math.random() * 0.5,
      toHorizontal: Math.random() > 0.5,
    });
  }

  // dark: cyan 190–220; light: sky/neptune brand blues visible on white
  const baseHue =
    variant === "light" ? 200 + Math.random() * 28 : 190 + Math.random() * 30;

  return {
    x,
    y,
    vx,
    vy,
    trail: [],
    baseHue,
    brightness: variant === "light" ? 0.55 + Math.random() * 0.35 : 0.5 + Math.random() * 0.4,
    life: 0,
    maxLife: 380 + Math.random() * 520,
    turns,
    turned: 0,
    glowBoost: Math.random() < (variant === "light" ? 0.18 : 0.22) ? 1.45 : 1,
  };
}

/**
 * Pixel data-stream snakes (same as login page).
 * Fixed full-viewport canvas, pointer-events none.
 */
export function DataParticles({
  variant = "dark",
  className = "",
  streamCount,
}: DataParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const count = streamCount ?? (variant === "light" ? 16 : 20);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let streams: Stream[] = [];
    let raf = 0;
    let running = true;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      return;
    }

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    streams = Array.from({ length: count }, () => createStream(width, height, variant));

    const updateStream = (s: Stream) => {
      s.life++;
      const gx = Math.round(s.x / STEP) * STEP;
      const gy = Math.round(s.y / STEP) * STEP;

      const last = s.trail[s.trail.length - 1];
      if (!last || Math.abs(last.x - gx) >= STEP || Math.abs(last.y - gy) >= STEP) {
        s.trail.push({ x: gx, y: gy });
        if (s.trail.length > TRAIL_LENGTH) s.trail.shift();
      }

      s.x += s.vx;
      s.y += s.vy;

      if (s.turned < s.turns.length) {
        const progress = s.life / s.maxLife;
        if (progress > s.turns[s.turned].at) {
          const t = s.turns[s.turned];
          const speed = Math.abs(s.vx || s.vy) * (0.85 + Math.random() * 0.3);
          if (t.toHorizontal) {
            s.vx = (Math.random() > 0.5 ? 1 : -1) * speed;
            s.vy = 0;
          } else {
            s.vy = (Math.random() > 0.5 ? 1 : -1) * speed;
            s.vx = 0;
          }
          s.turned++;
        }
      }

      if (
        s.x < -STEP * 4 ||
        s.x > width + STEP * 4 ||
        s.y < -STEP * 4 ||
        s.y > height + STEP * 4 ||
        s.life > s.maxLife
      ) {
        Object.assign(s, createStream(width, height, variant));
      }
    };

    const drawStream = (s: Stream) => {
      const len = s.trail.length;
      if (len < 1) return;

      const alphaMul = variant === "light" ? 0.42 : 1;
      const headBoost = variant === "light" ? 0.75 : 1;

      for (let i = 0; i < len; i++) {
        const p = s.trail[i];
        const t = i / Math.max(len - 1, 1);

        let alpha = (0.12 + t * 0.88) * s.brightness * s.glowBoost * alphaMul;
        if (i === len - 1) alpha = Math.min(1, alpha * 1.3);

        // light: deeper/mid blues so snakes read on white; dark: bright cyan heads
        const lightness =
          variant === "light" ? 42 + t * 22 : 52 + t * 32;
        const sat = variant === "light" ? 72 + t * 18 : 68 + t * 22;

        if (t > 0.68) {
          const glowA = (variant === "light" ? 0.22 : 0.4) * t;
          ctx.shadowColor = `hsla(${s.baseHue}, 90%, ${variant === "light" ? 52 : 68}%, ${glowA})`;
          ctx.shadowBlur = (variant === "light" ? 6 : 9) + t * (variant === "light" ? 5 : 7);
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `hsla(${s.baseHue}, ${sat}%, ${lightness}%, ${alpha})`;
        ctx.fillRect(p.x, p.y, PIXEL, PIXEL);

        if (i === len - 1) {
          ctx.shadowBlur = variant === "light" ? 8 : 12;
          const headL = variant === "light" ? 58 : 82;
          ctx.fillStyle = `hsla(${s.baseHue}, 95%, ${headL}%, ${0.88 * s.glowBoost * headBoost})`;
          ctx.fillRect(p.x + 1, p.y + 1, PIXEL - 2, PIXEL - 2);
        }
      }
      ctx.shadowBlur = 0;
    };

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      streams.forEach((s) => {
        updateStream(s);
        drawStream(s);
      });
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [variant, count]);

  return (
    <canvas
      ref={canvasRef}
      className={
        className ||
        (variant === "light"
          ? "pointer-events-none fixed inset-0 z-[1] h-full w-full"
          : "login-particles")
      }
      aria-hidden="true"
    />
  );
}

export default DataParticles;
