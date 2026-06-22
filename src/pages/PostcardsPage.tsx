import { motion } from "framer-motion";
import { Download, Image } from "lucide-react";

const postcards = [
  { src: "/images/postcards/pink-8march.png", title: "8 Марта — розовая открытка" },
  { src: "/images/postcards/pink-8march-text.png", title: "8 Марта — розовая с текстом" },
  { src: "/images/postcards/blue-8march-text.png", title: "8 Марта — синяя с текстом" },
];

const PostcardsPage = () => {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Image size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Открытки</h1>
        </div>
        <p className="text-muted-foreground mb-8">Корпоративные открытки для поздравлений</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postcards.map((card, i) => (
          <motion.div
            key={card.src}
            className="card-modern overflow-hidden group"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={card.src}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{card.title}</span>
              <a
                href={card.src}
                download
                className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Скачать"
              >
                <Download size={14} className="text-primary" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PostcardsPage;
