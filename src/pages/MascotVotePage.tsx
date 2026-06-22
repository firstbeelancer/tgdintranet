import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Trophy, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import orcaImg from "@/assets/mascot-orca.png";
import antImg from "@/assets/mascot-ant.png";
import octopusImg from "@/assets/mascot-octopus.png";
import owlImg from "@/assets/mascot-owl.png";

interface MascotOption {
  id: string;
  name: string;
  short: string;
  description: string;
  image: string;
}

const OPTIONS: MascotOption[] = [
  {
    id: "orca",
    name: "Касатка",
    short: "Команда. Интеллект. Точность удара.",
    description:
      "Мегаколлективное животное: касатки живут семьями и охотятся слаженно, как единая система. Они умны, любопытны, обучаемы и передают знания следующим поколениям. Для системного интегратора это символ командной работы, инженерной смекалки и способности решать задачи там, где другие пасуют.",
    image: orcaImg,
  },
  {
    id: "ant",
    name: "Муравей",
    short: "Дисциплина. Иерархия. Результат.",
    description:
      "Социальное животное с доскональной и дисциплинированной иерархией. Муравьи строят сложнейшие инфраструктуры, распределяют роли и доводят любой проект до конца. Маленький по размеру, но способный поднять груз во много раз больше себя — точное олицетворение надёжного интегратора, который держит на себе ИТ-ландшафт клиента.",
    image: antImg,
  },
  {
    id: "octopus",
    name: "Осьминог",
    short: "Многозадачность. Гибкость. Адаптация.",
    description:
      "Один из самых интеллектуальных беспозвоночных: восемь рук работают параллельно, каждая решает свою задачу. Осьминог мгновенно адаптируется к среде, проходит лабиринты и находит нестандартные решения. Идеальный образ интегратора, который одновременно ведёт десятки проектов, технологий и вендоров.",
    image: octopusImg,
  },
  {
    id: "owl",
    name: "Сова",
    short: "Мудрость. Опыт. Видение в темноте.",
    description:
      "Сова видит там, где другие слепы — символ экспертизы и аналитики. Тихая, наблюдательная, безошибочная в момент действия. Для ТехноГида это образ архитектора и консультанта: мы видим всю картину ИТ-инфраструктуры клиента и находим оптимальный путь даже в самых сложных задачах.",
    image: owlImg,
  },
];

interface Vote {
  user_id: string;
  option_id: string;
}

const MascotVotePage = () => {
  const { user } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const myVote = useMemo(() => votes.find((v) => v.user_id === user?.id)?.option_id ?? null, [votes, user]);

  useEffect(() => {
    if (myVote && selected === null) setSelected(myVote);
  }, [myVote, selected]);

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    votes.forEach((v) => map.set(v.option_id, (map.get(v.option_id) ?? 0) + 1));
    return map;
  }, [votes]);
  const totalVotes = votes.length;
  const leader = useMemo(() => {
    let best: { id: string; count: number } | null = null;
    totals.forEach((count, id) => {
      if (!best || count > best.count) best = { id, count };
    });
    return best;
  }, [totals]);

  const fetchVotes = async () => {
    const { data, error } = await supabase.from("mascot_votes").select("user_id, option_id");
    if (error) toast.error("Не удалось загрузить голоса");
    else setVotes(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVotes();
    const channel = supabase
      .channel("mascot-votes")
      .on("postgres_changes", { event: "*", schema: "public", table: "mascot_votes" }, () => fetchVotes())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async () => {
    if (!user) return toast.error("Нужно войти в систему");
    if (!selected) return toast.error("Выберите маскота");
    setSaving(true);
    const { error } = await supabase
      .from("mascot_votes")
      .upsert({ user_id: user.id, option_id: selected, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error("Не удалось сохранить голос");
    else toast.success("Голос отправлен!");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <PageHeader
        title="Голосование: маскот компании"
        description="Выбираем символ ТехноГид. Один голос на сотрудника — можно поменять в любой момент."
        backTo="/"
        rightSlot={
          <div className="neu-inset px-4 py-2 text-sm">
            Всего голосов: <span className="font-bold text-titan">{totalVotes}</span>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin mr-2" size={18} /> Загружаем результаты…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OPTIONS.map((opt, i) => {
              const count = totals.get(opt.id) ?? 0;
              const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
              const isSelected = selected === opt.id;
              const isMine = myVote === opt.id;
              const isLeader = leader && leader.count > 0 && leader.id === opt.id;
              return (
                <motion.label
                  key={opt.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className={`neu-card p-6 flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 ${
                    isSelected ? "ring-2 ring-sky shadow-glow-sky" : ""
                  }`}
                  onClick={() => setSelected(opt.id)}
                >
                  <div className="flex gap-5">
                    <div className="shrink-0 w-32 h-32 neu-inset rounded-2xl flex items-center justify-center overflow-hidden bg-mist">
                      <img
                        src={opt.image}
                        alt={`Маскот ${opt.name}`}
                        loading="lazy"
                        width={1024}
                        height={1024}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold text-heading">{opt.name}</h3>
                            {isLeader && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber">
                                <Trophy size={12} /> Лидер
                              </span>
                            )}
                            {isMine && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-neptune">
                                <Check size={12} /> Ваш голос
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-sky mt-0.5">{opt.short}</p>
                        </div>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => setSelected(opt.id)}
                          className="mt-1 h-6 w-6"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{opt.description}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5">
                      <div className="h-full rounded-full bg-sky transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {count} {count === 1 ? "голос" : count >= 2 && count <= 4 ? "голоса" : "голосов"}
                      </span>
                      <span className="font-semibold text-titan">{pct}%</span>
                    </div>
                  </div>
                </motion.label>
              );
            })}
          </div>

          <div className="sticky bottom-4 mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={saving || !selected || selected === myVote}
              className="neu-card px-8 py-4 rounded-2xl bg-sky text-white font-bold inline-flex items-center gap-2 shadow-glow-sky hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Отправляем…
                </>
              ) : selected === myVote && myVote ? (
                <>
                  <Check size={18} /> Голос отправлен
                </>
              ) : (
                <>
                  <Send size={18} /> Отправить голос
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MascotVotePage;
