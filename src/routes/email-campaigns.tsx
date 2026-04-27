import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Mail, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/email-campaigns")({
  component: EmailCampaignsPage,
  head: () => ({ meta: [{ title: "Campanhas E-mail — Atual Prospect" }] }),
});

type C = { id: string; name: string; status: string; total_recipients: number; sent_count: number; created_at: string };
const labels: Record<string, string> = { draft: "Rascunho", scheduled: "Agendada", running: "Enviando", paused: "Pausada", completed: "Concluída" };

function EmailCampaignsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<C[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [conns, setConns] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", template_id: "", connection_id: "", total: 0 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: c }, { data: t }, { data: cn }] = await Promise.all([
      supabase.from("campaigns").select("*").eq("channel", "email").order("created_at", { ascending: false }),
      supabase.from("templates").select("id,name").eq("channel", "email"),
      supabase.from("connections").select("id,name").eq("channel", "email"),
    ]);
    setItems((c ?? []) as C[]); setTemplates(t ?? []); setConns(cn ?? []); setLoading(false);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const create = async () => {
    if (!user || !form.name) return;
    setSaving(true);
    const { error } = await supabase.from("campaigns").insert({
      user_id: user.id, name: form.name, channel: "email", status: "draft",
      template_id: form.template_id || null, connection_id: form.connection_id || null,
      total_recipients: form.total,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Campanha criada!");
    setOpen(false); setForm({ name: "", template_id: "", connection_id: "", total: 0 }); load();
  };

  return (
    <AppShell title="Campanhas E-mail" subtitle="SMTP, templates HTML e agendamento">
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="hero"><Plus className="w-4 h-4" /> Nova campanha</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Campanha E-mail</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Select value={form.template_id} onValueChange={(v) => setForm({ ...form, template_id: v })}>
                <SelectTrigger><SelectValue placeholder="Template" /></SelectTrigger>
                <SelectContent>{templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.connection_id} onValueChange={(v) => setForm({ ...form, connection_id: v })}>
                <SelectTrigger><SelectValue placeholder="SMTP" /></SelectTrigger>
                <SelectContent>{conns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="Destinatários" value={form.total || ""} onChange={(e) => setForm({ ...form, total: +e.target.value })} />
              <Button variant="hero" className="w-full" onClick={create} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /> : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma campanha de e-mail.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((c) => (
            <div key={c.id} className="bg-gradient-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center"><Mail className="w-5 h-5 text-primary" /></div>
              <div className="flex-1">
                <h3 className="font-semibold">{c.name}</h3>
                <div className="text-xs text-muted-foreground">{labels[c.status]} · {c.total_recipients.toLocaleString("pt-BR")} destinatários · {c.sent_count} enviados</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
