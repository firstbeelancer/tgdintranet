import { IntranetHeader } from "@/components/IntranetHeader";
import { ArrowLeft, Plus, Search, Download, Trash2, Upload, Calendar, Building2, Tag, Shield, Percent, FileImage, RefreshCw, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CertificateHistoryDialog } from "@/components/CertificateHistoryDialog";

interface Certificate {
  id: string;
  vendor_name: string;
  legal_entity: string | null;
  tags: string[];
  partner_status: string | null;
  issued_date: string | null;
  expiry_date: string | null;
  file_path: string | null;
  discount: string | null;
  created_at: string;
}

const CertificatesPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const updateInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [historyCert, setHistoryCert] = useState<Certificate | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formLegal, setFormLegal] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formIssued, setFormIssued] = useState("");
  const [formExpiry, setFormExpiry] = useState("");
  const [formDiscount, setFormDiscount] = useState("");

  const fetchCertificates = async () => {
    const { data, error } = await supabase
      .from("partner_certificates")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setCertificates(data as Certificate[]);
    if (error) console.error(error);
    setLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filteredCertificates = certificates.filter((c) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      c.vendor_name.toLowerCase().includes(q) ||
      (c.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast({ title: "Ошибка", description: "Укажите имя вендора", variant: "destructive" });
      return;
    }
    const tags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await supabase.from("partner_certificates").insert({
      vendor_name: formName.trim(),
      legal_entity: formLegal.trim() || null,
      tags,
      partner_status: formStatus.trim() || null,
      issued_date: formIssued || null,
      expiry_date: formExpiry || null,
      discount: formDiscount.trim() || null,
    });

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }
    setFormName("");
    setFormLegal("");
    setFormTags("");
    setFormStatus("");
    setFormIssued("");
    setFormExpiry("");
    setFormDiscount("");
    setDialogOpen(false);
    toast({ title: "Сертификат добавлен" });
    fetchCertificates();
  };

  const handleDelete = async (cert: Certificate) => {
    if (cert.file_path) {
      await supabase.storage.from("certificates").remove([cert.file_path]);
    }
    const { error } = await supabase.from("partner_certificates").delete().eq("id", cert.id);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Удалено" });
    fetchCertificates();
  };

  const handleFileUpload = async (certId: string, file: File, isUpdate = false) => {
    setUploadingId(certId);
    const ext = file.name.split(".").pop();
    // Always use unique path so old files are preserved in storage
    const filePath = `${certId}/v-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      toast({ title: "Ошибка загрузки", description: uploadError.message, variant: "destructive" });
      setUploadingId(null);
      return;
    }

    await supabase
      .from("partner_certificates")
      .update({ file_path: filePath })
      .eq("id", certId);

    toast({ title: isUpdate ? "Сертификат обновлён" : "Файл загружен" });
    setUploadingId(null);
    fetchCertificates();
  };

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from("certificates").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const isImageFile = (filePath: string) => {
    const ext = filePath.split(".").pop()?.toLowerCase();
    return ["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/partners")}
              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Партнерские сертификаты</h1>
              <p className="text-sm text-muted-foreground">Сертификаты и статусы партнёров</p>
            </div>
          </div>

          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl">
                  <Plus size={16} />
                  Добавить сертификат
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Новый сертификат</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Имя вендора</Label>
                    <Input placeholder="Например: Базальт" value={formName} onChange={(e) => setFormName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Наименование юрлица</Label>
                    <Input placeholder='ООО "..."' value={formLegal} onChange={(e) => setFormLegal(e.target.value)} />
                  </div>
                  <div>
                    <Label>Теги (через запятую)</Label>
                    <Input placeholder="ОС, Linux, Импортозамещение" value={formTags} onChange={(e) => setFormTags(e.target.value)} />
                  </div>
                  <div>
                    <Label>Партнерский статус</Label>
                    <Input placeholder="Авторизованный партнёр" value={formStatus} onChange={(e) => setFormStatus(e.target.value)} />
                  </div>
                  <div>
                    <Label>Скидка</Label>
                    <Input placeholder="Например: 15%" value={formDiscount} onChange={(e) => setFormDiscount(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Дата выдачи</Label>
                      <Input type="date" value={formIssued} onChange={(e) => setFormIssued(e.target.value)} />
                    </div>
                    <div>
                      <Label>Дата истечения</Label>
                      <Input type="date" value={formExpiry} onChange={(e) => setFormExpiry(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={handleCreate} className="w-full rounded-xl">Добавить</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по наименованию или тегам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </motion.div>

        {/* Cards */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Загрузка...</div>
        ) : filteredCertificates.length === 0 ? (
          <div className="card-modern p-10 shadow-card text-center">
            <p className="text-muted-foreground">Сертификаты не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCertificates.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.08 * i }}
                  className="card-modern shadow-card flex flex-col overflow-hidden"
                >
                  {/* Certificate preview */}
                  {cert.file_path && isImageFile(cert.file_path) && (
                    <div className="relative w-full h-40 bg-muted border-b border-border overflow-hidden">
                      <img
                        src={getPublicUrl(cert.file_path)}
                        alt={`Сертификат ${cert.vendor_name}`}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  )}
                  {cert.file_path && !isImageFile(cert.file_path) && (
                    <div className="relative w-full h-28 bg-muted border-b border-border flex items-center justify-center gap-2 text-muted-foreground">
                      <FileImage size={24} />
                      <span className="text-sm font-medium">PDF-сертификат</span>
                    </div>
                  )}

                  {/* Card header */}
                  <div className="p-5 flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl icon-wrapper flex items-center justify-center">
                          <Shield size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-card-foreground">{cert.vendor_name}</h3>
                          {cert.legal_entity && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 size={11} /> {cert.legal_entity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {cert.partner_status && (
                      <p className="text-xs font-semibold text-accent mb-2">{cert.partner_status}</p>
                    )}

                    {cert.discount && (
                      <p className="text-xs font-semibold text-primary mb-3 flex items-center gap-1">
                        <Percent size={12} />
                        Скидка: {cert.discount}
                      </p>
                    )}

                    {/* Tags */}
                    {cert.tags && cert.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {cert.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs font-medium rounded-lg">
                            <Tag size={10} className="mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Dates */}
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={14} className="text-primary" />
                        <span>Выдан <span className="font-medium text-foreground">{formatDate(cert.issued_date)}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={14} className="text-destructive" />
                        <span>Истекает <span className="font-medium text-foreground">{formatDate(cert.expiry_date)}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-border p-4 flex flex-wrap gap-2 items-center">
                    {cert.file_path ? (
                      <a
                        href={getPublicUrl(cert.file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:brightness-110 transition-all"
                      >
                        <Download size={14} />
                        Скачать
                      </a>
                    ) : isAdmin ? (
                      <>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[cert.id] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(cert.id, file);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-xs gap-1.5"
                          disabled={uploadingId === cert.id}
                          onClick={() => fileInputRefs.current[cert.id]?.click()}
                        >
                          <Upload size={14} />
                          {uploadingId === cert.id ? "Загрузка..." : "Загрузить файл"}
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Файл не загружен</span>
                    )}

                    {isAdmin && cert.file_path && (
                      <>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                          ref={(el) => { updateInputRefs.current[cert.id] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(cert.id, file, true);
                            e.target.value = "";
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-xs gap-1.5"
                          disabled={uploadingId === cert.id}
                          onClick={() => updateInputRefs.current[cert.id]?.click()}
                        >
                          <RefreshCw size={14} />
                          {uploadingId === cert.id ? "Обновление..." : "Обновить"}
                        </Button>
                      </>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl text-xs gap-1.5"
                      onClick={() => setHistoryCert(cert)}
                    >
                      <History size={14} />
                      История
                    </Button>

                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl text-xs text-destructive hover:bg-destructive/10 gap-1.5 ml-auto"
                        onClick={() => handleDelete(cert)}
                      >
                        <Trash2 size={14} />
                        Удалить
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <CertificateHistoryDialog
          certificateId={historyCert?.id ?? null}
          currentFilePath={historyCert?.file_path ?? null}
          open={!!historyCert}
          onOpenChange={(o) => !o && setHistoryCert(null)}
        />
      </div>
    </div>
  );
};

export default CertificatesPage;
