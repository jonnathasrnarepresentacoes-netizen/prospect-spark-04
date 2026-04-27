import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { mockCampaigns } from "@/lib/mock-data";
import { Plus, Mail } from "lucide-react";

export const Route = createFileRoute("/email-campaigns")({
  component: EmailCampaignsPage,
  head: () => ({ meta: [{ title: "Campanhas E-mail — Atual Prospect" }] }),
});

function EmailCampaignsPage() {
  const list = mockCampaigns.filter(c => c.channel === "email");
  return (
    <AppShell title="Campanhas E-mail" subtitle="SMTP, templates HTML e agendamento">
      <div className="flex justify-end mb-4">
        <Button variant="hero"><Plus className="w-4 h-4" /> Nova campanha</Button>
      </div>
      <div className="grid gap-3">
        {list.map((c) => (
          <div key={c.id} className="bg-gradient-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{c.name}</h3>
              <div className="text-xs text-muted-foreground">{c.status} · {c.total.toLocaleString("pt-BR")} destinatários</div>
            </div>
            <Button variant="outline" size="sm"><Link to="/email-campaigns">Detalhes</Link></Button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
