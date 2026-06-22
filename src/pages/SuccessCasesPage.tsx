import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trophy, Building2, Lightbulb, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface SuccessCase {
  id: string;
  title: string;
  description: string | null;
  client: string | null;
  solution: string | null;
  result: string | null;
  created_at: string;
}

const SuccessCasesPage = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const canEdit = role === "admin" || role === "marketer";

  const [cases, setCases] = useState<SuccessCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState("");
  const [solution, setSolution] = useState("");
  const [result, setResult] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCases = async () => {
    const { data } = await supabase
      .from("success_cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCases(data as SuccessCase[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: "Ошибка", description: "Укажите название кейса", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("success_cases").insert({
      title: title.trim(),
      description: description.trim() || null,
      client: client.trim() || null,
      solution: solution.trim() || null,
      result: result.trim() || null,
      created_by: user?.id,
    });
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Кейс создан" });
      setTitle(""); setDescription(""); setClient(""); setSolution(""); setResult("");
      setDialogOpen(false);
      fetchCases();
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/marketing")} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Успешные кейсы</h1>
              <p className="text-sm text-muted-foreground">Примеры успешных внедрений и проектов</p>
            </div>
          </div>

          {canEdit && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl"><Plus size={16} /> Добавить кейс</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>Новый успешный кейс</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div><Label>Название</Label><Input placeholder="Например: Внедрение системы..." value={title} onChange={e => setTitle(e.target.value)} /></div>
                  <div><Label>Клиент</Label><Input placeholder="Название организации" value={client} onChange={e => setClient(e.target.value)} /></div>
                  <div><Label>Описание</Label><Textarea placeholder="Краткое описание проекта" value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
                  <div><Label>Решение</Label><Textarea placeholder="Какое решение было применено" value={solution} onChange={e => setSolution(e.target.value)} rows={3} /></div>
                  <div><Label>Результат</Label><Textarea placeholder="Какой результат был достигнут" value={result} onChange={e => setResult(e.target.value)} rows={2} /></div>
                  <Button onClick={handleCreate} className="w-full rounded-xl" disabled={saving}>
                    {saving ? "Сохраняем..." : "Создать кейс"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Загрузка...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Кейсы ещё не добавлены</div>
        ) : (
          <div className="space-y-5">
            {cases.map((c, i) => (
              <motion.div
                key={c.id}
                className="card-modern p-6 shadow-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl icon-wrapper flex items-center justify-center shrink-0">
                    <Trophy size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground mb-1">{c.title}</h3>
                    {c.client && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <Building2 size={14} className="text-accent" /> {c.client}
                      </div>
                    )}
                    {c.description && <p className="text-sm text-muted-foreground mb-3">{c.description}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {c.solution && (
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                            <Lightbulb size={14} className="text-primary" /> Решение
                          </div>
                          <p className="text-sm text-muted-foreground">{c.solution}</p>
                        </div>
                      )}
                      {c.result && (
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                            <TrendingUp size={14} className="text-accent" /> Результат
                          </div>
                          <p className="text-sm text-muted-foreground">{c.result}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessCasesPage;
