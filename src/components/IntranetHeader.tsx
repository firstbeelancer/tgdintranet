import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Shield, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface IntranetHeaderProps {
  leftSlot?: React.ReactNode;
}

export function IntranetHeader({ leftSlot }: IntranetHeaderProps) {
  const { profile, role, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="bg-background/85 backdrop-blur-xl border-b border-haze sticky top-0 z-50 shadow-[0_4px_20px_-12px_hsla(217,41%,30%,0.25)]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {leftSlot}
          <img src="/images/logo-blue.png" alt="Логотип TGD" className="h-8" />
          <div className="hidden sm:block h-6 w-px bg-border" />
          <span className="hidden sm:block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Интранет
          </span>
        </div>

        <div className="flex items-center gap-3 relative" ref={menuRef}>
          {role === "admin" && (
            <span className="text-xs bg-neptune/15 text-neptune px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <Shield size={11} /> Админ
            </span>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-cloud transition-colors"
          >
            <div className="w-9 h-9 neu-icon">
              <User size={16} className="text-sky" strokeWidth={2.2} />
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block max-w-[120px] truncate">
              {profile?.display_name || "Пользователь"}
            </span>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 bg-card rounded-2xl shadow-card-hover w-56 overflow-hidden z-50 border border-border"
              >
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">{profile?.display_name || "Пользователь"}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                </div>
                {role === "admin" && (
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/admin"); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Shield size={14} className="text-accent" />
                    Управление пользователями
                  </button>
                )}
                <button
                  onClick={async () => { setMenuOpen(false); try { await signOut(); } finally { navigate("/"); } }}
                  className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors flex items-center gap-2 border-t border-border"
                >
                  <LogOut size={14} /> Выйти
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
