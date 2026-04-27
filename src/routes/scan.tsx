import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recentScans } from "@/lib/mock-data";
import { Search, FileSpreadsheet, History, Download } from "lucide-react";

export const Route = createFileRoute("/scan")({
  component: ScanPage,
  head: () => ({ meta: [{ title: "Scanner de Contatos — Atual Prospect" }] }),
});

function ScanPage() {
  return (
    <AppShell title="Scanner de Contatos" subtitle="Busque em planilhas Google e arquivos locais">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-gradient-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Filtros de busca</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <Input placeholder="Cidade" />
            <Input placeholder="Bairro" />
            <Input placeholder="Segmento" />
            <Input placeholder="Limite (ex: 1000)" />
            <Input placeholder="Texto livre" className="sm:col-span-2" />
          </div>
          <div className="flex gap-2">
            <Button variant="hero"><Search className="w-4 h-4" /> Iniciar varredura</Button>
            <Button asChild variant="outline"><Link to="/sheets">Gerenciar planilhas</Link></Button>
          </div>
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">Buscas recentes</h2>
          </div>
          <ul className="space-y-2">
            {recentScans.map((s) => (
              <li key={s.id} className="p-3 rounded-lg bg-card border border-border hover:border-primary/40 transition">
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.filters}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-primary font-mono">{s.results} contatos</span>
                  <Button variant="ghost" size="sm"><Download className="w-3 h-3" /></Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
