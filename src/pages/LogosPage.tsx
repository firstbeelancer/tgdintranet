import { motion } from "framer-motion";
import { Image, Download } from "lucide-react";

const logoGroups = [
  {
    title: "Синий",
    logos: [
      { name: "Горизонтальный", src: "/images/logos/logo_blue_horizontal.svg", bg: "bg-white" },
      { name: "Вертикальный", src: "/images/logos/logo_blue_vertical.svg", bg: "bg-white" },
      { name: "Горизонтальный (TM)", src: "/images/logos/logo_blue_horizontal_tm.svg", bg: "bg-white" },
      { name: "Вертикальный (TM)", src: "/images/logos/logo_blue_vertical_tm.svg", bg: "bg-white" },
    ],
  },
  {
    title: "Чёрный",
    logos: [
      { name: "Горизонтальный", src: "/images/logos/logo_black_horizontal.svg", bg: "bg-white" },
      { name: "Вертикальный", src: "/images/logos/logo_black_vertical.svg", bg: "bg-white" },
    ],
  },
  {
    title: "Серый",
    logos: [
      { name: "Горизонтальный", src: "/images/logos/logo_gray_horizontal.svg", bg: "bg-white" },
      { name: "Вертикальный", src: "/images/logos/logo_gray_vertical.svg", bg: "bg-white" },
    ],
  },
  {
    title: "Белый",
    logos: [
      { name: "Горизонтальный", src: "/images/logos/logo_white_horizontal.svg", bg: "bg-[#1a2332]" },
      { name: "Вертикальный", src: "/images/logos/logo_white_vertical.svg", bg: "bg-[#1a2332]" },
      { name: "Горизонтальный (TM)", src: "/images/logos/logo_white_horizontal_tm.svg", bg: "bg-[#1a2332]" },
      { name: "Вертикальный (TM)", src: "/images/logos/logo_white_vertical_tm.svg", bg: "bg-[#1a2332]" },
    ],
  },
];

const LogosPage = () => {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl icon-wrapper flex items-center justify-center">
            <Image size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Логотипы</h1>
        </div>
        <p className="text-muted-foreground mb-8">Логотипы компании в различных цветовых вариантах и ориентациях</p>
      </motion.div>

      {logoGroups.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: gi * 0.08 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">{group.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {group.logos.map((logo) => (
              <div key={logo.src} className="card-modern overflow-hidden">
                <div className={`${logo.bg} flex items-center justify-center p-8 border-b border-border min-h-[140px]`}>
                  <img src={logo.src} alt={`${group.title} — ${logo.name}`} className="max-h-20 max-w-full object-contain" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="font-medium text-foreground text-sm">{logo.name}</span>
                  <a
                    href={logo.src}
                    download
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Download size={14} />
                    SVG
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LogosPage;
