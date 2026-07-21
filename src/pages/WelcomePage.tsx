import { useEffect, useRef, useState, FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import "@/pages/WelcomePage.css";

const WEEKDAYS = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
];
const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

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

const PIXEL = 7;
const GAP = 3;
const STEP = PIXEL + GAP;
const TRAIL_LENGTH = 13;
const STREAM_COUNT = 20;

function createStream(width: number, height: number): Stream {
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

  return {
    x,
    y,
    vx,
    vy,
    trail: [],
    baseHue: 190 + Math.random() * 30,
    brightness: 0.5 + Math.random() * 0.4,
    life: 0,
    maxLife: 380 + Math.random() * 520,
    turns,
    turned: 0,
    glowBoost: Math.random() < 0.22 ? 1.45 : 1,
  };
}

const WelcomePage = () => {
  const { signIn } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [weekday, setWeekday] = useState("—");
  const [dateLabel, setDateLabel] = useState("—");
  const [timeLabel, setTimeLabel] = useState("—:—:—");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setWeekday(WEEKDAYS[now.getDay()]);
      setDateLabel(`${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()} г.`);
      setTimeLabel(`${h}:${m}:${s}`);
    };
    updateDateTime();
    const id = window.setInterval(updateDateTime, 1000);
    return () => window.clearInterval(id);
  }, []);

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

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    streams = Array.from({ length: STREAM_COUNT }, () => createStream(width, height));

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
        Object.assign(s, createStream(width, height));
      }
    };

    const drawStream = (s: Stream) => {
      const len = s.trail.length;
      if (len < 1) return;

      for (let i = 0; i < len; i++) {
        const p = s.trail[i];
        const t = i / Math.max(len - 1, 1);

        let alpha = (0.12 + t * 0.88) * s.brightness * s.glowBoost;
        if (i === len - 1) alpha = Math.min(1, alpha * 1.3);

        const lightness = 52 + t * 32;
        const sat = 68 + t * 22;

        if (t > 0.68) {
          ctx.shadowColor = `hsla(${s.baseHue}, 90%, 68%, ${0.4 * t})`;
          ctx.shadowBlur = 9 + t * 7;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `hsla(${s.baseHue}, ${sat}%, ${lightness}%, ${alpha})`;
        ctx.fillRect(p.x, p.y, PIXEL, PIXEL);

        if (i === len - 1) {
          ctx.shadowBlur = 12;
          ctx.fillStyle = `hsla(${s.baseHue}, 95%, 82%, ${0.88 * s.glowBoost})`;
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
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError("Неверный email или пароль. Попробуйте снова.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-gradient" aria-hidden="true" />
      <canvas ref={canvasRef} id="login-particles" className="login-particles" aria-hidden="true" />

      <div className="login-content">
        <div className="login-logo-wrap">
          <img
            src="/images/logo-white.png"
            alt="ТехноГид"
            className="login-logo"
          />
        </div>

        <p className="login-slogan">Все ресурсы и инструменты вашей команды — в одном месте</p>

        <div className="login-glass">
          <div className="login-caustics" aria-hidden="true" />
          <div className="login-caustics login-caustics-2" aria-hidden="true" />
          <div className="login-refraction" aria-hidden="true" />

          <div className="login-form-content">
            <h1 className="login-title">Добро пожаловать</h1>

            <div className="login-datetime">
              <span>{weekday}</span>, <span>{dateLabel}</span>
              <br />
              <span className="login-time">{timeLabel}</span>
            </div>

            <form onSubmit={handleSubmit} className="login-form" autoComplete="on">
              <div className="login-field">
                <label htmlFor="login-email">Логин</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="user@tigerapps.pro"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="login-field">
                <label htmlFor="login-pass">Пароль</label>
                <div className="login-pass-wrap">
                  <input
                    id="login-pass"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="login-pass-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Входим..." : "Войти в систему"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
