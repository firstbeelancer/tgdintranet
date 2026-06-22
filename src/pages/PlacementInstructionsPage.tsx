import { ArrowLeft, ClipboardCheck, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const instructions = [
  {
    title: "Размещение логотипов партнёров",
    description: "Требования к размерам, форматам и расположению логотипов на маркетинговых материалах и сайте компании.",
  },
  {
    title: "Публикация совместных решений",
    description: "Порядок согласования и размещения описаний совместных решений в каталоге продуктов.",
  },
  {
    title: "Оформление партнёрских страниц",
    description: "Стандарты оформления карточек партнёров на корпоративном портале и внешнем сайте.",
  },
];

const PlacementInstructionsPage = () => {
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
            onClick={() => navigate("/partners")}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Инструкции по размещению</h1>
            <p className="text-sm text-muted-foreground">Регламенты и порядок размещения партнёрских материалов</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructions.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="card-modern p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl icon-wrapper flex items-center justify-center">
                  <FileText size={18} className="text-primary" />
                </div>
                <h2 className="text-base font-bold text-card-foreground">{item.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlacementInstructionsPage;
