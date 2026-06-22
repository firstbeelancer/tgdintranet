import { useAuth } from "@/hooks/useAuth";
import WelcomePage from "@/pages/WelcomePage";
import Dashboard from "@/pages/Dashboard";
import { motion } from "framer-motion";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center welcome-gradient">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-primary-foreground/80 text-sm font-medium">Загрузка...</span>
        </motion.div>
      </div>
    );
  }

  return user ? <Dashboard /> : <WelcomePage />;
};

export default Index;
