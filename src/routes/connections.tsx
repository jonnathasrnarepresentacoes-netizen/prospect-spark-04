import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { mockConnections } from "@/lib/mock-data";
import { Plus, Plug, RefreshCw, Trash2, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/connections")({
  component: ConnectionsPage,
  head: () => ({ meta: [{ title: "Conexões — Atual Prospect" }] }),
});

function ConnectionsPage() {
  return (
    <AppShell title="Conexões" subtitle="WhatsApp gateway e SMTP de e-mail">
      <div className="flex justify-end mb-4">
        <Button variant="hero"><Plus className="w-4 h-4" /> Nova conexão</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {mockConnections.map((c) => (
          <div key={c.id} className="bg-gradient-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-brand-soft border border-primary/20 flex items-center justify-center">
                  <Plug className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <div className="text-xs text-muted-foreground font-mono">{c.number}</div>
                </div>
              </div>
              {c.status === "connected"
                ? <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="w-3 h-3" /> Conectado</span>
                : <span className="flex items-center gap-1 text-xs text-destructive"><XCircle className="w-3 h-3" /> Off</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><RefreshCw className="w-3 h-3" /> Sincronizar</Button>
              <Button variant="outline" size="sm">Testar</Button>
              <Button variant="ghost" size="sm" className="ml-auto"><Trash2 className="w-3 h-3 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
