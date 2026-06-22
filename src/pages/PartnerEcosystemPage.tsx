import { IntranetHeader } from "@/components/IntranetHeader";
import { ArrowLeft, ScrollText, ClipboardCheck, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const sections = [
  {
    title: "Список партнерских сертификатов",
    description: "Все действующие сертификаты партнёров компании",
    icon: ScrollText,
    link: "/partners/certificates",
  },
  {
    title: "Инструкции по размещению",
    description: "Регламенты и порядок размещения партнёрских материалов",
    icon: ClipboardCheck,
    link: "/partners/instructions",
  },
];

const PartnerEcosystemPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Партнерская экосистема</h1>
            <p className="text-sm text-muted-foreground">Партнёры, сертификаты и совместные решения</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => section.link !== "#" && navigate(section.link)}
              className="card-modern p-6 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl icon-wrapper flex items-center justify-center">
                  <section.icon size={20} className="text-primary" />
                </div>
                <h2 className="text-base font-bold text-card-foreground tracking-tight">{section.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
              <span className="text-sm font-semibold text-primary flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Перейти <ExternalLink size={14} />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerEcosystemPage;
