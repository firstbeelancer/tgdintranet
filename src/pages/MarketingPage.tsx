import { BarChart3, Target, Palette, FileSpreadsheet, Trophy, Image, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";

const resources = [
  { name: "Корпоративные презентации", icon: BarChart3, description: "Шаблоны и готовые презентации для встреч с клиентами и партнёрами", link: "" },
  { name: "Фирменный стиль", icon: Palette, description: "Логотипы, корпоративные цвета и брендбук компании", link: "/marketing/brand" },
  { name: "Маркетинговые буклеты", icon: FileSpreadsheet, description: "Печатные и электронные материалы для продвижения", link: "" },
  { name: "Открытки", icon: Image, description: "Корпоративные открытки для праздников и поздравлений", link: "/marketing/postcards" },
];

const MarketingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseOpen, setCaseOpen] = useState(false);
  const [caseLoading, setCaseLoading] = useState(false);
  const [form, setForm] = useState({ client: "", title: "", description: "", solution: "", vendors: "" });

  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaseLoading(true);
    const { error } = await supabase.from("success_cases").insert({
      client: form.client,
      title: form.title,
      description: form.description,
      solution: form.solution,
      result: form.vendors,
      created_by: user?.id,
    });
    setCaseLoading(false);
    if (error) {
      toast.error("Ошибка: " + error.message);
    } else {
      toast.success("Кейс отправлен!");
      setCaseOpen(false);
      setForm({ client: "", title: "", description: "", solution: "", vendors: "" });
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <PageHeader title="Маркетинговые материалы" description="Все ресурсы для продвижения и представления компании" backTo="/" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {resources.map((r, i) => (
          <motion.div
            key={r.name}
            className="card-modern p-6 flex gap-4 items-start cursor-pointer hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            onClick={() => r.link && navigate(r.link)}
          >
            <div className="w-11 h-11 rounded-xl icon-wrapper flex items-center justify-center shrink-0">
              <r.icon size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{r.name}</h3>
              <p className="text-sm text-muted-foreground">{r.description}</p>
            </div>
          </motion.div>
        ))}

        {/* Успешные кейсы */}
        <motion.div
          className="card-modern p-6 flex gap-4 items-start cursor-pointer hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: resources.length * 0.07 }}
          onClick={() => navigate("/marketing/cases")}
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Trophy size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Успешные кейсы</h3>
            <p className="text-sm text-muted-foreground">Примеры успешных внедрений и проектов компании</p>
          </div>
        </motion.div>

        {/* Хотите рассказать об успешном кейсе? */}
        <motion.div
          className="card-modern p-6 flex gap-4 items-start cursor-pointer hover:shadow-lg transition-shadow border-2 border-accent/30 bg-accent/5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: (resources.length + 1) * 0.07 }}
          onClick={() => setCaseOpen(true)}
        >
          <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Lightbulb size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Хотите рассказать об успешном кейсе?</h3>
            <p className="text-sm text-muted-foreground">Заполните форму, и мы добавим ваш проект в витрину кейсов</p>
          </div>
        </motion.div>
      </div>

      <Dialog open={caseOpen} onOpenChange={setCaseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Новый успешный кейс</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCaseSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Заказчик</Label>
              <Input placeholder="Название компании-заказчика" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Тема</Label>
              <Input placeholder="Краткая тема проекта" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Что нужно было</Label>
              <Textarea placeholder="Опишите задачу заказчика" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Что сделали</Label>
              <Textarea placeholder="Опишите реализованное решение" value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Список вендоров</Label>
              <Input placeholder="Например: Cisco, Huawei, HPE" value={form.vendors} onChange={(e) => setForm({ ...form, vendors: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={caseLoading}>
              {caseLoading ? "Отправляем..." : "Отправить кейс"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingPage;
