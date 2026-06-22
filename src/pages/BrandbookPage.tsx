import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const BrandbookPage = () => {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl icon-wrapper flex items-center justify-center">
            <BookOpen size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Брендбук компании</h1>
        </div>
        <p className="text-muted-foreground mb-8">Руководство по использованию фирменного стиля</p>
      </motion.div>

      <div className="card-modern p-8 text-center">
        <BookOpen size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Раздел в разработке</p>
      </div>
    </div>
  );
};

export default BrandbookPage;
