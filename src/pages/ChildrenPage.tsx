import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Baby, Cake } from "lucide-react";

interface Child {
  id: string;
  user_id: string;
  name: string | null;
  birthday: string;
  gender: "male" | "female";
}

interface Profile {
  user_id: string;
  display_name: string | null;
  position: string | null;
}

const calcAge = (birthday: string) => {
  const b = new Date(birthday);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

const ChildrenPage = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: ch }, { data: pr }] = await Promise.all([
        supabase.from("employee_children").select("*").order("birthday"),
        supabase.from("profiles").select("user_id, display_name, position"),
      ]);
      if (ch) setChildren(ch as Child[]);
      if (pr) {
        const map: Record<string, Profile> = {};
        (pr as Profile[]).forEach((p) => (map[p.user_id] = p));
        setProfiles(map);
      }
      setLoading(false);
    })();
  }, []);

  // group by employee
  const grouped = children.reduce<Record<string, Child[]>>((acc, c) => {
    (acc[c.user_id] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <PageHeader title="Список детей" description="Дети сотрудников и ближайшие праздники" backTo="/hr" />

      {loading ? (
        <div className="text-muted-foreground">Загрузка...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="neu-card p-10 text-center">
          <Baby className="mx-auto mb-3 text-muted-foreground" size={40} />
          <p className="text-muted-foreground">Пока нет данных. Дети добавляются при создании учётной записи сотрудника.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.entries(grouped).map(([uid, list], i) => {
            const p = profiles[uid];
            return (
              <motion.div
                key={uid}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="neu-card p-5"
              >
                <div className="mb-3">
                  <h3 className="font-bold text-heading">{p?.display_name || "Сотрудник"}</h3>
                  {p?.position && <p className="text-xs text-muted-foreground">{p.position}</p>}
                </div>
                <div className="space-y-2">
                  {list.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-mist/50">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.gender === "male" ? "bg-sky/15 text-sky" : "bg-amber/15 text-amber"}`}>
                        <Baby size={18} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-foreground">
                          {c.name || (c.gender === "male" ? "Сын" : "Дочь")}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Cake size={11} /> {formatDate(c.birthday)} · {calcAge(c.birthday)} лет
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChildrenPage;
