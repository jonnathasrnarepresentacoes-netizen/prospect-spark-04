import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet, ToggleRight } from "lucide-react";

export const Route = createFileRoute("/sheets")({
  component: SheetsPage,
  head: () => ({ meta: [{ title: "Planilhas — Atual Prospect" }] }),
});

const sheets = [
  { id: 1, name: "Empresas SP - Indústria", type: "Google Sheets", rows: 12450, active: true },
  { id: 2, name: "Restaurantes BH", type: "Local", rows: 3120, active: true },
  { id: 3, name: "MEI Curitiba 2025", type: "Google Sheets", rows: 8960, active: false },
];

function SheetsPage() {
  return (
    <AppShell title="Fontes de Planilha" subtitle="Google Sheets e arquivos locais para o scanner">
      <div className="flex justify-end mb-4">
        <Button variant="hero"><Plus className="w-4 h-4" /> Adicionar fonte</Button>
      </div>
      <div className="grid gap-3">
        {sheets.map((s) => (
          <div key={s.id} className="bg-gradient-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-brand-soft border border-primary/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{s.name}</h3>
              <div className="text-xs text-muted-foreground">{s.type} · {s.rows.toLocaleString("pt-BR")} linhas</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${s.active ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}`}>
                {s.active ? "Ativa" : "Inativa"}
              </span>
              <Button variant="outline" size="sm">Mapear</Button>
              <Button variant="ghost" size="sm"><ToggleRight className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
