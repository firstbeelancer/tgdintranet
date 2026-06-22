import { FileEdit, FileSpreadsheet, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";

const templates = [
  { name: "Бланки коммерческих предложений", icon: FileEdit, description: "Шаблоны КП для различных типов проектов" },
  { name: "Официальные бланки", icon: FileSpreadsheet, description: "Фирменные бланки для деловой переписки" },
];

const constructors = [
  { name: "Конструктор квот", href: "/quotes-constructor.html", external: true },
  { name: "Конструктор опросников", href: "#", external: false },
  { name: "Конструктор официальных писем", href: "#", external: false },
];

const FormsPage = () => (
  <div className="max-w-[1100px] mx-auto px-6 py-10">
    <PageHeader title="Бланки и конструкторы" description="Шаблоны документов и инструменты для создания предложений" backTo="/" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      {templates.map((t, i) => (
        <motion.div
          key={t.name}
          className="card-modern p-6 flex gap-4 items-start cursor-pointer hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.07 }}
        >
          <div className="w-11 h-11 rounded-xl icon-wrapper flex items-center justify-center shrink-0">
            <t.icon size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">{t.name}</h3>
            <p className="text-sm text-muted-foreground">{t.description}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <h2 className="text-lg font-bold text-foreground mb-4">Конструкторы</h2>
    <div className="flex flex-wrap gap-3">
      {constructors.map((c) => (
        <a
          key={c.name}
          href={c.href}
          target={c.external ? "_blank" : undefined}
          rel={c.external ? "noopener noreferrer" : undefined}
          className="px-5 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:brightness-110 hover:shadow-lg transition-all inline-flex items-center gap-2"
        >
          {c.name}
          {c.external && <ExternalLink size={14} />}
        </a>
      ))}
    </div>
  </div>
);

export default FormsPage;
