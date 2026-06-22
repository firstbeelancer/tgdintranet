import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, AlertCircle, CheckCircle2, Plus, Trash2, Baby } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";

type Child = { birthday: string; gender: "male" | "female"; name?: string };

const AdminPanel = () => {
  const { role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [position, setPosition] = useState("");
  const [birthday, setBirthday] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "user" | "marketer">("user");
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Проверяем права доступа...</p>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <PageHeader title="Доступ запрещён" description="Эта страница доступна только администраторам" backTo="/" />
      </div>
    );
  }

  const addChild = () => setChildren((c) => [...c, { birthday: "", gender: "male", name: "" }]);
  const removeChild = (i: number) => setChildren((c) => c.filter((_, idx) => idx !== i));
  const updateChild = (i: number, patch: Partial<Child>) =>
    setChildren((c) => c.map((ch, idx) => (idx === i ? { ...ch, ...patch } : ch)));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const validChildren = children.filter((c) => c.birthday);
      const res = await supabase.functions.invoke("create-user", {
        body: {
          email,
          password,
          display_name: displayName,
          role: userRole,
          position: position || null,
          birthday: birthday || null,
          phone: phone || null,
          children: validChildren,
        },
      });

      if (res.error) {
        setMessage({ type: "error", text: res.error.message });
      } else if (res.data?.error) {
        setMessage({ type: "error", text: res.data.error });
      } else {
        setMessage({ type: "success", text: `Пользователь ${email} успешно создан!` });
        setEmail(""); setPhone(""); setPassword(""); setDisplayName("");
        setPosition(""); setBirthday(""); setUserRole("user"); setChildren([]);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <PageHeader title="Создание пользователя" description="Заведение учётной записи нового сотрудника" backTo="/" />

      <div className="neu-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 neu-icon"><UserPlus size={20} className="text-sky" /></div>
          <h2 className="text-lg font-bold text-heading">Данные сотрудника</h2>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Имя пользователя</Label>
              <Input placeholder="Иван Иванов" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Должность</Label>
              <Input placeholder="Менеджер по продажам" value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="user@tehgid.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input type="tel" placeholder="+7 (999) 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Пароль</Label>
              <Input type="password" placeholder="Минимум 6 символов" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Дата рождения</Label>
              <Input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Роль</Label>
              <Select value={userRole} onValueChange={(v) => setUserRole(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="marketer">Маркетолог</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Children block */}
          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Baby size={18} className="text-primary" />
                <h3 className="font-semibold text-heading">Дети сотрудника</h3>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addChild} className="gap-1.5">
                <Plus size={14} /> Добавить
              </Button>
            </div>
            {children.length === 0 && (
              <p className="text-xs text-muted-foreground">Нет добавленных детей</p>
            )}
            <div className="space-y-3">
              {children.map((c, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/40 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Имя (необязательно)</Label>
                      <Input value={c.name || ""} onChange={(e) => updateChild(i, { name: e.target.value })} placeholder="Имя ребёнка" />
                    </div>
                    <div>
                      <Label className="text-xs">Дата рождения</Label>
                      <Input type="date" value={c.birthday} onChange={(e) => updateChild(i, { birthday: e.target.value })} required />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <RadioGroup
                      value={c.gender}
                      onValueChange={(v) => updateChild(i, { gender: v as "male" | "female" })}
                      className="flex gap-4"
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="male" /> <span className="text-sm">Мальчик</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value="female" /> <span className="text-sm">Девочка</span>
                      </label>
                    </RadioGroup>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeChild(i)} className="text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-destructive/10 text-destructive"}`}>
              {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Создаём..." : "Создать пользователя"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
