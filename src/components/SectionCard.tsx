import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  index?: number;
  accent?: boolean;
}

export function SectionCard({ icon: Icon, title, description, onClick, index = 0, accent = false }: SectionCardProps) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`neu-card p-6 flex gap-4 items-start ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="w-12 h-12 neu-icon shrink-0">
        <Icon size={20} className={accent ? "text-neptune" : "text-sky"} />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-heading mb-1">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </motion.div>
  );
}
