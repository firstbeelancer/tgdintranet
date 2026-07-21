import { useAuth } from "@/hooks/useAuth";
import WelcomePage from "@/pages/WelcomePage";
import Dashboard from "@/pages/Dashboard";
import { motion } from "framer-motion";
import "@/pages/WelcomePage.css";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-bg-gradient" aria-hidden="true" />
        <div className="login-content">
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-cyan-300 animate-spin" />
            <span className="text-sm font-medium text-cyan-50/80">Загрузка...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <WelcomePage />;
};

export default Index;
