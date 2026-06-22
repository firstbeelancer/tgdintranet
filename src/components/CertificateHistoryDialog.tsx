import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, History } from "lucide-react";

interface Version {
  id: string;
  file_path: string;
  version_number: number;
  uploaded_at: string;
  uploaded_by: string | null;
}

interface Props {
  certificateId: string | null;
  currentFilePath: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CertificateHistoryDialog({ certificateId, currentFilePath, open, onOpenChange }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !certificateId) return;
    setLoading(true);
    supabase
      .from("certificate_versions")
      .select("*")
      .eq("certificate_id", certificateId)
      .order("version_number", { ascending: false })
      .then(({ data }) => {
        setVersions((data as Version[]) || []);
        setLoading(false);
      });
  }, [open, certificateId]);

  const url = (p: string) => supabase.storage.from("certificates").getPublicUrl(p).data.publicUrl;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History size={18} className="text-primary" /> История сертификата
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">История пуста</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {versions.map((v) => {
              const isCurrent = v.file_path === currentFilePath;
              return (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Версия {v.version_number}</span>
                      {isCurrent && <Badge className="bg-primary text-primary-foreground text-[10px]">Актуальная</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{fmt(v.uploaded_at)}</p>
                  </div>
                  <a
                    href={url(v.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:brightness-110"
                  >
                    <Download size={12} /> Скачать
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
