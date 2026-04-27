import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { mockCampaigns } from "@/lib/mock-data";
import { Plus, Send, Pause, Play } from "lucide-react";

export const Route = createFileRoute("/campaigns")({
  component: CampaignsPage,
  head: () => ({ meta: [{ title: "Campanhas WhatsApp — Atual Prospect" }] }),
});

const statusColor: Record<string, string> = {
  Enviando: "bg-primary/15 text-primary border-primary/30",
  Concluída: "bg-success/15 text-success border-success/30",
  Agendada: "bg-warning/15 text-warning border-warning/30",
  Pausada: "bg-muted text-muted-foreground border-border",
  Rascunho: "bg-card text-muted-foreground border-border",
};

function CampaignsPage() {
  const wa = mockCampaigns.filter(c => c.channel === "whatsapp");
  return (
    <AppShell title="Campanhas WhatsApp" subtitle="Disparos em massa com modo seguro">
      <div className="flex justify-end mb-4">
        <Button variant="hero"><Plus className="w-4 h-4" /> Nova campanha</Button>
      </div>
      <div className="grid gap-3">
        {wa.map((c) => {
          const pct = c.total ? (c.sent / c.total) * 100 : 0;
          return (
            <div key={c.id} className="bg-gradient-card border border-border rounded-2xl p-5 hover:border-primary/40 transition">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{c.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${statusColor[c.status]}`}>{c.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Criada em {c.created} · {c.total.toLocaleString("pt-BR")} contatos</div>
                  {c.total > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-gradient-brand" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{c.sent.toLocaleString("pt-BR")} / {c.total.toLocaleString("pt-BR")} enviados ({Math.round(pct)}%)</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  {c.status === "Enviando" ? (
                    <Button variant="outline" size="sm"><Pause className="w-4 h-4" /></Button>
                  ) : (
                    <Button variant="outline" size="sm"><Play className="w-4 h-4" /></Button>
                  )}
                  <Button variant="ghost" size="sm">Detalhes</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-5 rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground">
        💡 Importe contatos do <Link to="/companies" className="text-primary hover:underline">scanner de empresas</Link> ou{" "}
        <Link to="/scan" className="text-primary hover:underline">scanner de planilhas</Link> para criar uma nova campanha.
      </div>
    </AppShell>
  );
}
