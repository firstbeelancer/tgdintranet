import { UserRound, FileEdit, Baby } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";

const sections = [
  { name: "Контакты сотрудников", icon: UserRound, description: "Справочник контактов и информация о сотрудниках", href: "/hr/contacts" },
  { name: "Список детей", icon: Baby, description: "Дети сотрудников: даты рождения, ближайшие праздники", href: "/hr/children" },
  { name: "Инструкции и заявления", icon: FileEdit, description: "Шаблоны заявлений, инструкции по оформлению документов", href: "#" },
];

const HRPage = () => {
  const navigate = useNavigate();

  return (
  <div className="max-w-[1100px] mx-auto px-6 py-10">
    <PageHeader title="HR" description="Информация о сотрудниках и кадровые документы" backTo="/" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {sections.map((s, i) => (
        <motion.div
          key={s.name}
          onClick={() => s.href !== "#" && navigate(s.href)}
          className="card-modern p-6 flex gap-4 items-start cursor-pointer hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.07 }}
        >
          <div className="w-11 h-11 rounded-xl icon-wrapper flex items-center justify-center shrink-0">
            <s.icon size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">{s.name}</h3>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
  );
};

export default HRPage;
