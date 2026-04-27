import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { mockTemplates } from "@/lib/mock-data";
import { Plus, FileText, MessageCircle, Mail, Trash2 } from "lucide-react";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
  head: () => ({ meta: [{ title: "Templates — Atual Prospect" }] }),
});

function TemplatesPage() {
  return (
    <AppShell title="Templates de Mensagem" subtitle="WhatsApp e e-mail · suporte a variáveis {nome}, {cidade}">
      <div className="flex justify-end mb-4 gap-2">
        <Button variant="outline"><Plus className="w-4 h-4" /> Novo e-mail</Button>
        <Button variant="hero"><Plus className="w-4 h-4" /> Novo WhatsApp</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {mockTemplates.map((t) => {
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
                <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
              <div className="text-sm text-muted-foreground bg-card/40 rounded-lg p-3 border border-border font-mono text-xs leading-relaxed">
                {t.body}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
