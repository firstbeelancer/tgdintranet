import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface DashboardCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  children: React.ReactNode;
  onOpen?: () => void;
  index?: number;
}

export function DashboardCard({ icon: Icon, title, children, onOpen, index = 0 }: DashboardCardProps) {
  return (
    <motion.div
      className="neu-card p-6 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-12 h-12 neu-icon">
          <Icon size={22} strokeWidth={2} className="text-sky" />
        </div>
        <h2 className="text-base font-bold text-heading tracking-tight">{title}</h2>
      </div>
      <div className="flex-grow text-foreground">{children}</div>
      {onOpen && (
        <button
          onClick={onOpen}
          className="btn-glow group mt-5 w-full py-3 text-sm flex items-center justify-center gap-2"
        >
          Открыть
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </motion.div>
  );
}
