import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Play, Pause, Square, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/warmup")({
  component: WarmupPage,
  head: () => ({ meta: [{ title: "Aquecimento WhatsApp — Atual Prospect" }] }),
});

type W = {
  id: string; name: string; target_interactions: number; done_interactions: number;
  delay_min_seconds: number; delay_max_seconds: number; status: string; participants: any;
};

function WarmupPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<W[]>([]);
  const [form, setForm] = useState({ name: "", target: 100, min: 30, max: 120 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("warmup_campaigns").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as W[]);
    setLoading(false);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const create = async () => {
    if (!user || !form.name) return toast.error("Informe o nome");
    const { error } = await supabase.from("warmup_campaigns").insert({
      user_id: user.id, name: form.name, target_interactions: form.target,
      delay_min_seconds: form.min, delay_max_seconds: form.max, status: "running", participants: [],
    });
    if (error) return toast.error(error.message);
    toast.success("Aquecimento iniciado!");
    setForm({ name: "", target: 100, min: 30, max: 120 });
    load();
  };

  const update = async (id: string, status: "running" | "paused" | "completed") => {
    await supabase.from("warmup_campaigns").update({ status }).eq("id", id);
    load();
  };

  return (
    <AppShell title="Aquecimento de Contas" subtitle="Aumente reputação e reduza bloqueios automáticos">
      <div className="bg-gradient-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Flame className="w-5 h-5 text-accent" /> Nova campanha de aquecimento</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input type="number" placeholder="Alvo" value={form.target} onChange={(e) => setForm({ ...form, target: +e.target.value })} />
          <Input type="number" placeholder="Delay mín. (s)" value={form.min} onChange={(e) => setForm({ ...form, min: +e.target.value })} />
          <Input type="number" placeholder="Delay máx. (s)" value={form.max} onChange={(e) => setForm({ ...form, max: +e.target.value })} />
        </div>
        <Button variant="hero" className="mt-4" onClick={create}><Play className="w-4 h-4" /> Iniciar</Button>
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Campanhas</h2>
      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /> : items.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-2xl">Nenhuma campanha de aquecimento.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((c) => {
            const pct = c.target_interactions ? (c.done_interactions / c.target_interactions) * 100 : 0;
            return (
              <div key={c.id} className="bg-gradient-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <div className="text-xs text-muted-foreground">meta {c.target_interactions} · delay {c.delay_min_seconds}-{c.delay_max_seconds}s · {c.status}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => update(c.id, "paused")}><Pause className="w-3 h-3" /></Button>
                    <Button variant="outline" size="sm" onClick={() => update(c.id, "completed")}><Square className="w-3 h-3" /></Button>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-accent" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{c.done_interactions} / {c.target_interactions} interações</div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
