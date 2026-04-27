import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Play, Pause, Square } from "lucide-react";

export const Route = createFileRoute("/warmup")({
  component: WarmupPage,
  head: () => ({ meta: [{ title: "Aquecimento WhatsApp — Atual Prospect" }] }),
});

const campaigns = [
  { id: 1, name: "Aquecimento - Vendas", participants: 4, target: 100, done: 67, status: "running" },
  { id: 2, name: "Aquecimento - Marketing", participants: 3, target: 200, done: 200, status: "completed" },
  { id: 3, name: "Aquecimento - Suporte", participants: 5, target: 150, done: 0, status: "paused" },
];

function WarmupPage() {
  return (
    <AppShell title="Aquecimento de Contas" subtitle="Aumente reputação e reduza bloqueios automáticos">
      <div className="bg-gradient-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Flame className="w-5 h-5 text-accent" /> Nova campanha de aquecimento</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input placeholder="Nome da campanha" />
          <Input type="number" placeholder="Alvo (interações)" defaultValue="100" />
          <Input type="number" placeholder="Delay mín. (s)" defaultValue="30" />
          <Input type="number" placeholder="Delay máx. (s)" defaultValue="120" />
        </div>
        <Button variant="hero" className="mt-4"><Play className="w-4 h-4" /> Iniciar aquecimento</Button>
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Campanhas ativas</h2>
      <div className="grid gap-3">
        {campaigns.map((c) => {
          const pct = (c.done / c.target) * 100;
          return (
            <div key={c.id} className="bg-gradient-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <div className="text-xs text-muted-foreground">{c.participants} contas participando · meta {c.target} interações</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm"><Pause className="w-3 h-3" /></Button>
                  <Button variant="outline" size="sm"><Square className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-accent" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{c.done} / {c.target} interações</div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
