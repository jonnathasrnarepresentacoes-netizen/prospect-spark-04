import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, MessageCircle, Mail, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
  head: () => ({ meta: [{ title: "Templates — Atual Prospect" }] }),
});

type Template = {
  id: string;
  name: string;
  channel: "whatsapp" | "email";
  body: string;
  subject: string | null;
};

function TemplatesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "whatsapp" as "whatsapp" | "email", subject: "", body: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("templates").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Template[]);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const create = async () => {
    if (!form.name || !form.body || !user) return;
    setSaving(true);
    const { error } = await supabase.from("templates").insert({
      user_id: user.id,
      name: form.name,
      channel: form.channel,
      subject: form.channel === "email" ? form.subject : null,
      body: form.body,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Template criado!");
    setOpen(false);
    setForm({ name: "", channel: "whatsapp", subject: "", body: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este template?")) return;
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Template removido");
    load();
  };

  return (
    <AppShell title="Templates de Mensagem" subtitle="WhatsApp e e-mail · suporte a variáveis {nome}, {cidade}">
      <div className="flex justify-end mb-4 gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="w-4 h-4" /> Novo template</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Template</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome do template" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Select value={form.channel} onValueChange={(v: any) => setForm({ ...form, channel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                </SelectContent>
              </Select>
              {form.channel === "email" && (
                <Input placeholder="Assunto do e-mail" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              )}
              <Textarea
                placeholder="Mensagem... use {nome}, {cidade}, {empresa}"
                rows={6}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
              <Button variant="hero" className="w-full" onClick={create} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum template ainda. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((t) => {
            const Icon = t.channel === "whatsapp" ? MessageCircle : Mail;
            return (
              <div key={t.id} className="bg-gradient-card border border-border rounded-2xl p-5 hover:border-primary/40 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-brand-soft border border-primary/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t.name}</h3>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.channel}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(t.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                {t.subject && <div className="text-xs font-semibold mb-2">📧 {t.subject}</div>}
                <div className="text-sm text-muted-foreground bg-card/40 rounded-lg p-3 border border-border font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {t.body}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
