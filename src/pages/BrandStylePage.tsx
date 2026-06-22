import { Palette, Image, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const items = [
  { name: "Логотипы", icon: Image, description: "Логотипы в различных форматах и цветовых вариантах", link: "/marketing/brand/logos" },
  { name: "Корпоративная палетка", icon: Palette, description: "Фирменные цвета компании — Pantone, CMYK, HEX, RGB", link: "/marketing/brand/palette" },
  { name: "Брендбук компании", icon: BookOpen, description: "Руководство по использованию фирменного стиля", link: "/marketing/brand/brandbook" },
];

const BrandStylePage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Фирменный стиль</h1>
        <p className="text-muted-foreground mb-8">Логотипы, цвета и руководства по бренду компании</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((item, i) => (
          <motion.div
            key={item.name}
            className="card-modern p-6 flex gap-4 items-start cursor-pointer hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            onClick={() => navigate(item.link)}
          >
            <div className="w-11 h-11 rounded-xl icon-wrapper flex items-center justify-center shrink-0">
              <item.icon size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BrandStylePage;
