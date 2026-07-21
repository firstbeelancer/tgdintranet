import { useNavigate } from "react-router-dom";
import { IntranetHeader } from "@/components/IntranetHeader";
import { DashboardCard } from "@/components/DashboardCard";
import {
  Calendar,
  Megaphone,
  FileText,
  BookOpen,
  Award,
  Users,
  BarChart3,
  Target,
  Palette,
  FileSpreadsheet,
  ClipboardList,
  Settings,
  Compass,
  ScrollText,
  ClipboardCheck,
  UserRound,
  FileEdit,
  ExternalLink,
  ShieldCheck,
  UserPlus,
  Vote,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { DataParticles } from "@/components/DataParticles";

const Dashboard = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  return (
    <div className="relative min-h-screen bg-background mesh-bg">
      <DataParticles variant="light" />
      <div className="relative z-10">
      <IntranetHeader />
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            Рабочее <span className="heading-accent">пространство</span>
          </h1>
          <p className="text-graphite text-base">
            Все необходимые инструменты и ресурсы в одном месте
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Корпоративный календарь */}
          <DashboardCard icon={Calendar} title="Корпоративный календарь" onOpen={() => navigate("/calendar")} index={0}>
            <ul className="space-y-2">
              {[
                { name: "Конференция IT-решений", date: "15 авг" },
                { name: "Встреча с партнёрами", date: "18 авг" },
                { name: "Презентация проекта", date: "22 авг" },
                { name: "Корпоративный тренинг", date: "25 авг" },
              ].map((e) => (
                <li key={e.name} className="bg-muted/60 p-3 rounded-xl border-l-[3px] border-primary flex justify-between items-center">
                  <span className="text-sm font-medium">{e.name}</span>
                  <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-0.5 rounded-full">{e.date}</span>
                </li>
              ))}
            </ul>
          </DashboardCard>

          {/* Голосование — CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="relative overflow-hidden rounded-[var(--radius)] p-6 flex flex-col text-white welcome-gradient shadow-glow-sky"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-neptune/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-8 w-44 h-44 rounded-full bg-amber/20 blur-3xl pointer-events-none" />

            <div className="relative flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center">
                <Vote size={22} className="text-white" />
              </div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-[11px] font-bold uppercase tracking-wider text-white">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-amber opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
                </span>
                Голосование открыто
              </span>
            </div>

            <h2 className="relative text-2xl font-bold leading-tight mb-2 text-white">
              Выбираем маскота компании
            </h2>
            <p className="relative text-white/80 text-sm mb-5 flex-grow">
              Ваш голос определит символ TehnoGid. 6 кандидатов — лис, сова, робот, медведь, дельфин и феникс. Один голос на сотрудника, можно поменять.
            </p>

            <button
              onClick={() => navigate("/vote/mascot")}
              className="relative group inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-amber text-quantum font-bold text-sm shadow-[0_0_24px_hsla(34,92%,53%,0.45)] hover:shadow-[0_0_36px_hsla(34,92%,53%,0.7)] hover:-translate-y-0.5 transition-all"
            >
              Проголосовать
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          <DashboardCard icon={Megaphone} title="Маркетинговые материалы" onOpen={() => navigate("/marketing")} index={1}>
            <ul className="space-y-0.5">
              {[
                { name: "Корпоративные презентации", icon: BarChart3 },
                { name: "Брендбук компании", icon: Target },
                { name: "Логотипы и фирменный стиль", icon: Palette },
                { name: "Маркетинговые буклеты", icon: FileSpreadsheet },
              ].map((r) => (
                <li key={r.name} className="py-2.5 border-b border-border/60 last:border-0 flex justify-between items-center group">
                  <a href="#" className="text-foreground font-medium text-sm hover:text-primary transition-colors">{r.name}</a>
                  <r.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </li>
              ))}
            </ul>
          </DashboardCard>

          {/* Бланки и конструкторы */}
          <DashboardCard icon={FileText} title="Бланки и конструкторы" onOpen={() => navigate("/forms")} index={2}>
            <ul className="space-y-0.5">
              {[
                { name: "Бланки коммерческих предложений", icon: FileEdit },
                { name: "Официальные бланки", icon: FileSpreadsheet },
              ].map((r) => (
                <li key={r.name} className="py-2.5 border-b border-border/60 last:border-0 flex justify-between items-center group">
                  <a href="#" className="text-foreground font-medium text-sm hover:text-primary transition-colors">{r.name}</a>
                  <r.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 mt-4">
              <a href="/quotes-constructor.html" target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl text-sm font-medium bg-muted border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all inline-flex items-center gap-1.5">
                Конструктор квот
                <ExternalLink size={13} />
              </a>
              <a href="#" className="px-4 py-2.5 rounded-xl text-sm font-medium bg-muted border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
                Конструктор опросников
              </a>
            </div>
          </DashboardCard>

          {/* База знаний */}
          <DashboardCard icon={BookOpen} title="База знаний" onOpen={() => navigate("/knowledge")} index={3}>
            <ul className="space-y-0.5">
              {[
                { name: "Технические задания", icon: Settings },
                { name: "Шаблоны эскизных проектов", icon: Compass },
                { name: "Регламенты и процедуры", icon: ClipboardList },
              ].map((r) => (
                <li key={r.name} className="py-2.5 border-b border-border/60 last:border-0 flex justify-between items-center group">
                  <a href="#" className="text-foreground font-medium text-sm hover:text-primary transition-colors">{r.name}</a>
                  <r.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 mt-4">
              <a href="#" className="px-4 py-2.5 rounded-xl text-sm font-medium bg-muted border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
                Калькулятор архитектур
              </a>
              <a href="https://192.168.1.45" target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl text-sm font-medium bg-muted border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all inline-flex items-center gap-1.5">
                Перейти в wiki
                <ExternalLink size={13} />
              </a>
            </div>
          </DashboardCard>

          {/* Партнерские сертификаты */}
          <DashboardCard icon={Award} title="Партнерская экосистема" onOpen={() => navigate("/partners")} index={4}>
            <ul className="space-y-0.5">
              {[
                { name: "Список сертификатов", icon: ScrollText, onClick: () => navigate("/partners/certificates") },
                { name: "Инструкции по размещению", icon: ClipboardCheck, onClick: () => navigate("/partners/instructions") },
              ].map((r) => (
                <li key={r.name} className="py-2.5 border-b border-border/60 last:border-0 flex justify-between items-center group">
                  <a href="#" onClick={(e) => { if (r.onClick) { e.preventDefault(); r.onClick(); } }} className="text-foreground font-medium text-sm hover:text-primary transition-colors">{r.name}</a>
                  <r.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </li>
              ))}
            </ul>
          </DashboardCard>

          {/* HR */}
          <DashboardCard icon={Users} title="HR" onOpen={() => navigate("/hr")} index={5}>
            <ul className="space-y-0.5">
              {[
                { name: "Контакты сотрудников", icon: UserRound, onClick: () => navigate("/hr/contacts") },
                { name: "Инструкции и заявления", icon: FileEdit, onClick: null },
              ].map((r) => (
                <li key={r.name} className="py-2.5 border-b border-border/60 last:border-0 flex justify-between items-center group">
                  <a href="#" onClick={(e) => { e.preventDefault(); if (r.onClick) r.onClick(); }} className="text-foreground font-medium text-sm hover:text-primary transition-colors">{r.name}</a>
                  <r.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </li>
              ))}
            </ul>
          </DashboardCard>


          {/* Панель администратора */}
          {role === "admin" && (
            <DashboardCard icon={ShieldCheck} title="Управление ресурсами" onOpen={() => navigate("/admin")} index={6}>
              <ul className="space-y-0.5">
                {[
                  { name: "Создание пользователей", icon: UserPlus, onClick: () => navigate("/admin") },
                ].map((r) => (
                  <li key={r.name} className="py-2.5 border-b border-border/60 last:border-0 flex justify-between items-center group">
                    <a href="#" onClick={(e) => { e.preventDefault(); r.onClick(); }} className="text-foreground font-medium text-sm hover:text-primary transition-colors">{r.name}</a>
                    <r.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </li>
                ))}
              </ul>
            </DashboardCard>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
