import { useState, useEffect } from "react";
import { LoginModal } from "@/components/LoginModal";
import { LogIn, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const WelcomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("ru-RU", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen welcome-gradient px-5 relative">
      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-white/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-white/5 blur-3xl animate-pulse delay-1000" />

      <motion.img
        src="/images/logo-white.png"
        alt="Логотип компании"
        className="w-44 mb-10 drop-shadow-2xl relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      />

      <motion.div
        className="glass-panel rounded-3xl py-14 px-10 max-w-md w-[92%] text-center relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-primary-foreground/80 mb-6 border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Sparkles size={14} />
          Корпоративный портал
        </motion.div>

        <h1 className="text-5xl font-bold text-primary-foreground mb-4 tracking-tight">
          Добро пожаловать
        </h1>
        <div className="text-sm font-medium text-primary-foreground/60 mb-3">
          {currentDate}
        </div>
        <p className="text-base text-primary-foreground/75 mb-10 leading-relaxed">
          Все ресурсы и инструменты вашей команды — в одном месте
        </p>

        <motion.button
          onClick={() => setShowLogin(true)}
          className="group relative bg-white/20 hover:bg-white/30 text-primary-foreground px-10 py-4 rounded-2xl text-base font-semibold transition-all inline-flex items-center gap-3 border border-white/20 hover:border-white/30 backdrop-blur-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogIn size={20} className="transition-transform group-hover:-translate-x-0.5" />
          Войти в систему
        </motion.button>
      </motion.div>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export default WelcomePage;
