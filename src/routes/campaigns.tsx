import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pause, Play, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/campaigns")({
  component: CampaignsPage,
  head: () => ({ meta: [{ title: "Campanhas WhatsApp — Atual Prospect" }] }),
});

type Campaign = {
  id: string;
  name: string;
  channel: "whatsapp" | "email";
  status: "draft" | "scheduled" | "running" | "paused" | "completed";
  sent_count: number;
  failed_count: number;
  total_recipients: number;
  template_id: string | null;
  connection_id: string | null;
  created_at: string;
};

const statusLabel: Record<string, string> = {
  draft: "Rascunho", scheduled: "Agendada", running: "Enviando", paused: "Pausada", completed: "Concluída",
};
const statusColor: Record<string, string> = {
  running: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-success/15 text-success border-success/30",
  scheduled: "bg-warning/15 text-warning border-warning/30",
  paused: "bg-muted text-muted-foreground border-border",
  draft: "bg-card text-muted-foreground border-border",
};

function CampaignsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [conns, setConns] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", template_id: "", connection_id: "", total: 0 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: c }, { data: t }, { data: cn }] = await Promise.all([
      supabase.from("campaigns").select("*").eq("channel", "whatsapp").order("created_at", { ascending: false }),
      supabase.from("templates").select("id,name").eq("channel", "whatsapp"),
      supabase.from("connections").select("id,name").eq("channel", "whatsapp"),
    ]);
    setItems((c ?? []) as Campaign[]);
    setTemplates(t ?? []);
    setConns(cn ?? []);
    setLoading(false);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const create = async () => {
    if (!user || !form.name) return;
    setSaving(true);
    const { error } = await supabase.from("campaigns").insert({
      user_id: user.id,
      name: form.name,
      channel: "whatsapp",
      status: "draft",
      template_id: form.template_id || null,
      connection_id: form.connection_id || null,
      total_recipients: form.total,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Campanha criada!");
    setOpen(false);
    setForm({ name: "", template_id: "", connection_id: "", total: 0 });
    load();
  };

  const updateStatus = async (id: string, status: Campaign["status"]) => {
    await supabase.from("campaigns").update({ status }).eq("id", id);
    toast.success(`Campanha ${statusLabel[status].toLowerCase()}`);
    load();
  };

  return (
    <AppShell title="Campanhas WhatsApp" subtitle="Disparos em massa com modo seguro">
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="w-4 h-4" /> Nova campanha</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Campanha WhatsApp</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome da campanha" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Select value={form.template_id} onValueChange={(v) => setForm({ ...form, template_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione template" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.connection_id} onValueChange={(v) => setForm({ ...form, connection_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione conexão" /></SelectTrigger>
                <SelectContent>
                  {conns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Total de destinatários" value={form.total || ""} onChange={(e) => setForm({ ...form, total: +e.target.value })} />
              <Button variant="hero" className="w-full" onClick={create} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl">
          <Send className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma campanha. Crie a primeira!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((c) => {
            const pct = c.total_recipients ? (c.sent_count / c.total_recipients) * 100 : 0;
            return (
              <div key={c.id} className="bg-gradient-card border border-border rounded-2xl p-5 hover:border-primary/40 transition">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{c.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${statusColor[c.status]}`}>{statusLabel[c.status]}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Criada em {new Date(c.created_at).toLocaleDateString("pt-BR")} · {c.total_recipients.toLocaleString("pt-BR")} contatos</div>
                    {c.total_recipients > 0 && (
                      <div className="mt-3">
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-gradient-brand transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{c.sent_count.toLocaleString("pt-BR")} / {c.total_recipients.toLocaleString("pt-BR")} enviados ({Math.round(pct)}%)</div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {c.status === "running" ? (
                      <Button variant="outline" size="sm" onClick={() => updateStatus(c.id, "paused")}><Pause className="w-4 h-4" /></Button>
                    ) : c.status !== "completed" ? (
                      <Button variant="outline" size="sm" onClick={() => updateStatus(c.id, "running")}><Play className="w-4 h-4" /></Button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-6 p-5 rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground">
        💡 Importe contatos do <Link to="/companies" className="text-primary hover:underline">scanner de empresas</Link> para criar uma nova campanha.
      </div>
    </AppShell>
  );
}
