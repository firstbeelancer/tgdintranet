import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  rightSlot?: ReactNode;
}

export function PageHeader({ title, description, backTo = "/", rightSlot }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          aria-label="Назад"
          className="w-11 h-11 shrink-0 neu-icon hover:text-titan transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </motion.div>
  );
}
