import { ArrowLeft, User, Cake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  position: string | null;
  birthday: string | null;
  avatar_url: string | null;
}

const getDaysUntilBirthday = (birthday: string): number => {
  const today = new Date();
  const bday = new Date(birthday);
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next.getTime() - today.setHours(0,0,0,0)) / 86400000);
};

const formatBirthday = (date: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
};

const EmployeeContactsPage = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, display_name, email, position, birthday, avatar_url")
      .order("display_name")
      .then(({ data }) => {
        if (data) setProfiles(data as Profile[]);
        setLoading(false);
      });
  }, []);

  const upcomingBirthdays = profiles
    .filter((p) => p.birthday)
    .map((p) => ({ ...p, daysUntil: getDaysUntilBirthday(p.birthday!) }))
    .filter((p) => p.daysUntil <= 60)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/hr")}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Контакты сотрудников</h1>
          <p className="text-sm text-muted-foreground">Справочник контактов и информация о сотрудниках</p>
        </div>
      </motion.div>

      {/* Upcoming Birthdays */}
      {!loading && upcomingBirthdays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Cake size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-foreground">Ближайшие дни рождения</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {upcomingBirthdays.map((p) => (
              <div
                key={p.id}
                className="card-modern px-4 py-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-9 h-9 rounded-xl object-cover" />
                  ) : (
                    <User size={16} className="text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{p.display_name || "Без имени"}</p>
                  <p className="text-xs text-muted-foreground">
                    🎂 {formatBirthday(p.birthday)}{" "}
                    <span className="text-primary font-medium">
                      {p.daysUntil === 0 ? "— сегодня! 🎉" : `— через ${p.daysUntil} дн.`}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All employees */}
      {loading ? (
        <div className="text-muted-foreground text-sm">Загрузка...</div>
      ) : profiles.length === 0 ? (
        <div className="text-muted-foreground text-sm">Сотрудники не найдены</div>
      ) : (
        <>
          <h2 className="text-base font-semibold text-foreground mb-4">Все сотрудники</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card-modern p-5 flex gap-4 items-start"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-11 h-11 rounded-xl object-cover" />
                  ) : (
                    <User size={20} className="text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{p.display_name || "Без имени"}</h3>
                  {p.position && <p className="text-xs text-muted-foreground mt-0.5">{p.position}</p>}
                  {p.email && <p className="text-sm text-muted-foreground mt-1 truncate">{p.email}</p>}
                  {p.birthday && (
                    <p className="text-xs text-muted-foreground mt-1">🎂 {formatBirthday(p.birthday)}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeContactsPage;
