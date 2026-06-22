import { Settings, Compass, ClipboardList, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";

const sections = [
  { name: "Технические задания", icon: Settings, description: "Шаблоны и примеры технических заданий" },
  { name: "Шаблоны эскизных проектов", icon: Compass, description: "Типовые эскизные проекты для различных решений" },
  { name: "Регламенты и процедуры", icon: ClipboardList, description: "Внутренние регламенты и рабочие процедуры" },
];

const KnowledgeBasePage = () => (
  <div className="max-w-[1100px] mx-auto px-6 py-10">
    <PageHeader title="База знаний" description="Техническая документация, регламенты и инструменты" backTo="/" />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      {sections.map((s, i) => (
        <motion.div
          key={s.name}
          className="card-modern p-6 flex flex-col gap-3 cursor-pointer hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.07 }}
        >
          <div className="w-11 h-11 rounded-xl icon-wrapper flex items-center justify-center">
            <s.icon size={20} className="text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">{s.name}</h3>
          <p className="text-sm text-muted-foreground">{s.description}</p>
        </motion.div>
      ))}
    </div>

    <h2 className="text-lg font-bold text-foreground mb-4">Инструменты</h2>
    <div className="flex flex-wrap gap-3">
      <a
        href="#"
        className="px-5 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:brightness-110 hover:shadow-lg transition-all"
      >
        Калькулятор архитектур
      </a>
      <a
        href="https://192.168.1.45"
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-3 rounded-xl font-semibold text-sm bg-accent text-accent-foreground hover:brightness-110 hover:shadow-lg transition-all inline-flex items-center gap-2"
      >
        Перейти в wiki
        <ExternalLink size={14} />
      </a>
    </div>
  </div>
);

export default KnowledgeBasePage;
