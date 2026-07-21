import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { DataParticles } from "@/components/DataParticles";
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

const WelcomePage = () => {
  const { signIn } = useAuth();
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
      <DataParticles variant="dark" />

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
