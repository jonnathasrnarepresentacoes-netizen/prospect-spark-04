import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Plug, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/connections")({
  component: ConnectionsPage,
  head: () => ({ meta: [{ title: "Conexões — Atual Prospect" }] }),
});

type Connection = {
  id: string;
  name: string;
  channel: "whatsapp" | "email";
  identifier: string | null;
  status: "connected" | "disconnected" | "connecting";
};

function ConnectionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "whatsapp" as "whatsapp" | "email", identifier: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("connections").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Connection[]);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const create = async () => {
    if (!form.name || !user) return;
    setSaving(true);
    const { error } = await supabase.from("connections").insert({
      user_id: user.id,
      name: form.name,
      channel: form.channel,
      identifier: form.identifier,
      status: "disconnected",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Conexão criada! Configure o gateway externo para conectar.");
    setOpen(false);
    setForm({ name: "", channel: "whatsapp", identifier: "" });
    load();
  };

  const toggle = async (c: Connection) => {
    const newStatus = c.status === "connected" ? "disconnected" : "connected";
    await supabase.from("connections").update({ status: newStatus }).eq("id", c.id);
    toast.success(`Conexão ${newStatus === "connected" ? "ativada" : "desativada"} (mock)`);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir conexão?")) return;
    await supabase.from("connections").delete().eq("id", id);
    load();
  };

  return (
    <AppShell title="Conexões" subtitle="WhatsApp gateway e SMTP de e-mail">
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="w-4 h-4" /> Nova conexão</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Conexão</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome (ex: WhatsApp Vendas)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Select value={form.channel} onValueChange={(v: any) => setForm({ ...form, channel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail (SMTP)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder={form.channel === "whatsapp" ? "+55 11 99999-9999" : "smtp.servidor.com:587"}
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              />
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
          <Plug className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma conexão configurada.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((c) => (
            <div key={c.id} className="bg-gradient-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-brand-soft border border-primary/20 flex items-center justify-center">
                    <Plug className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <div className="text-xs text-muted-foreground font-mono">{c.identifier}</div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.channel}</span>
                  </div>
                </div>
                {c.status === "connected"
                  ? <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="w-3 h-3" /> Conectado</span>
                  : <span className="flex items-center gap-1 text-xs text-destructive"><XCircle className="w-3 h-3" /> Off</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggle(c)}>
                  {c.status === "connected" ? "Desconectar" : "Conectar"}
                </Button>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => remove(c.id)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
