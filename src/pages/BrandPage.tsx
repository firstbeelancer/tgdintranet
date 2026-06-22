import { motion } from "framer-motion";
import { Palette, Copy } from "lucide-react";
import { toast } from "sonner";

type ColorItem = {
  name: string;
  hex: string;
  cmyk: string;
  pantone: string;
  light?: boolean;
};

const colorSections: { label: string; colors: ColorItem[] }[] = [
  {
    label: "Основные синие",
    colors: [
      { name: "Квантум", hex: "#111B41", cmyk: "100,100,9,41", pantone: "2765C" },
      { name: "Обсидиан", hex: "#122341", cmyk: "89,63,22,48", pantone: "533C" },
      { name: "Океан", hex: "#024681", cmyk: "97,67,8,8", pantone: "2154C" },
      { name: "Титан", hex: "#035094", cmyk: "90,60,1,1", pantone: "7685C" },
      { name: "Небо", hex: "#577ABE", cmyk: "65,40,0,0", pantone: "2154C" },
      { name: "Эфир", hex: "#869FD0", cmyk: "40,21,0,0", pantone: "651C" },
    ],
  },
  {
    label: "Нейтральные и серые",
    colors: [
      { name: "Базальт", hex: "#3E4750", cmyk: "65,50,40,50", pantone: "432C" },
      { name: "Графит", hex: "#49525D", cmyk: "65,50,35,30", pantone: "7540C" },
      { name: "Сланец", hex: "#8D8D8D", cmyk: "28,22,22,10", pantone: "423C" },
      { name: "Диорит", hex: "#BDBDBD", cmyk: "—", pantone: "—" },
      { name: "Андезит", hex: "#DCDCDC", cmyk: "—", pantone: "—", light: true },
      { name: "Иней", hex: "#F3F3F3", cmyk: "6,6,6,0", pantone: "Cool Grey 1C", light: true },
      { name: "Пепел", hex: "#BBC5D5", cmyk: "30,18,10,6", pantone: "2162C" },
      { name: "Дымка", hex: "#DDE3ED", cmyk: "18,11,6,2", pantone: "428C", light: true },
    ],
  },
  {
    label: "Светлые и туманные",
    colors: [
      { name: "Нептун", hex: "#06B6D4", cmyk: "—", pantone: "—" },
      { name: "Аврора", hex: "#D4ECE4", cmyk: "—", pantone: "—", light: true },
      { name: "Лазурит", hex: "#B7D9FF", cmyk: "30,13,0,0", pantone: "537C", light: true },
      { name: "Облако", hex: "#EAF4FF", cmyk: "15,6,0,0", pantone: "538C", light: true },
      { name: "Туман", hex: "#F4F8FF", cmyk: "6,2,2,0", pantone: "7541C", light: true },
      { name: "Уран", hex: "#99FFFF", cmyk: "17,0,11,0", pantone: "331C", light: true },
    ],
  },
  {
    label: "Акцентные",
    colors: [
      { name: "Янтарь", hex: "#F59C1B", cmyk: "0,45,92,0", pantone: "716C" },
      { name: "Цитрин", hex: "#FFC000", cmyk: "0,31,93,0", pantone: "7409C" },
    ],
  },
];

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

const BrandPage = () => {
  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Скопировано: ${hex}`);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-end justify-between border-b border-border pb-8 mb-10"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette size={20} className="text-primary" />
            </div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
              Brand Color System
            </p>
          </div>
          <h1 className="text-4xl font-bold text-primary leading-tight">
            Корпоративная<br />палетка
          </h1>
        </div>
        <img
          src="/images/logo-blue.png"
          alt="TehnoGid Logo"
          className="h-12 object-contain"
        />
      </motion.div>

      {/* Sections */}
      {colorSections.map((section, si) => (
        <motion.div
          key={section.label}
          className="mb-12"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: si * 0.08 }}
        >
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-5 pl-0.5">
            {section.label}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {section.colors.map((color, ci) => {
              const rgb = hexToRgb(color.hex);
              const isLight = !!color.light;
              return (
                <motion.div
                  key={color.hex}
                  className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: si * 0.08 + ci * 0.03 }}
                >
                  <div
                    className="h-[110px] w-full"
                    style={{
                      backgroundColor: color.hex,
                      boxShadow: isLight ? "inset 0 0 0 1px rgba(0,0,0,0.06)" : undefined,
                    }}
                  />
                  <div className="p-4">
                    <p className="text-[15px] font-semibold text-foreground mb-2.5 tracking-tight">
                      {color.name}
                    </p>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-muted-foreground w-[52px] shrink-0">
                          Pantone
                        </span>
                        <span className="text-[11px] font-mono text-foreground/75 text-right">
                          {color.pantone}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-muted-foreground w-[52px] shrink-0">
                          CMYK
                        </span>
                        <span className="text-[11px] font-mono text-foreground/75 text-right">
                          {color.cmyk}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-muted-foreground w-[52px] shrink-0">
                          RGB
                        </span>
                        <span className="text-[11px] font-mono text-foreground/75 text-right">
                          {rgb}
                        </span>
                      </div>
                    </div>
                    {/* HEX chip */}
                    <button
                      onClick={() => copyHex(color.hex)}
                      className="mt-2.5 inline-flex items-center gap-1.5 bg-muted border border-border rounded-full py-1 px-2.5 hover:bg-muted/70 transition-colors"
                      title="Скопировать HEX"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[11px] font-mono text-muted-foreground tracking-wide">
                        {color.hex}
                      </span>
                      <Copy size={10} className="text-muted-foreground/40 ml-0.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Footer */}
      <div className="text-center border-t border-border pt-8 mt-4">
        <p className="text-xs text-muted-foreground tracking-wide">
          TehnoGid Brand Color Reference — CMYK · Pantone · HEX · RGB
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">Версия 7 · 18 февраля 2026</p>
      </div>
    </div>
  );
};

export default BrandPage;
