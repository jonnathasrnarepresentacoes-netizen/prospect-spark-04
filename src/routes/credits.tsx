import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { mockUser } from "@/lib/mock-data";
import { Coins, ArrowDown, ArrowUp, Sparkles } from "lucide-react";

export const Route = createFileRoute("/credits")({
  component: CreditsPage,
  head: () => ({ meta: [{ title: "Créditos — Atual Prospect" }] }),
});

const packages = [
  { name: "Starter", credits: 1000, price: 49 },
  { name: "Pro", credits: 5000, price: 199, popular: true },
  { name: "Business", credits: 15000, price: 499 },
  { name: "Enterprise", credits: 50000, price: 1499 },
];

const transactions = [
  { type: "credit", amount: 5000, desc: "Compra pacote Pro", date: "2026-04-26" },
  { type: "debit", amount: -120, desc: "Disparo WhatsApp · Camp #14", date: "2026-04-26" },
  { type: "debit", amount: -340, desc: "Extração empresas · 340 CNPJ", date: "2026-04-25" },
  { type: "debit", amount: -88, desc: "Disparo e-mail · Newsletter", date: "2026-04-24" },
];

function CreditsPage() {
  return (
    <AppShell title="Meus Créditos" subtitle="Carteira, pacotes e extrato de transações">
      <div className="bg-gradient-brand rounded-2xl p-8 mb-6 shadow-glow flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Coins className="w-12 h-12 text-white" />
          <div>
            <div className="text-xs text-white/80 uppercase tracking-widest">Saldo atual</div>
            <div className="text-4xl font-bold text-white">{mockUser.credits.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-white/80">créditos disponíveis</div>
          </div>
        </div>
        <Button variant="premium" className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20">Adicionar créditos</Button>
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Pacotes</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {packages.map((p) => (
          <div key={p.name} className={`relative bg-gradient-card border rounded-2xl p-5 ${p.popular ? "border-primary shadow-glow" : "border-border"}`}>
            {p.popular && <span className="absolute -top-2 left-4 text-[10px] bg-gradient-brand text-white px-2 py-0.5 rounded font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> POPULAR</span>}
            <h3 className="font-semibold">{p.name}</h3>
            <div className="text-2xl font-bold text-primary mt-2">{p.credits.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-muted-foreground mb-4">créditos</div>
            <div className="text-xl font-bold mb-3">R$ {p.price}</div>
            <Button variant={p.popular ? "hero" : "outline"} className="w-full">Comprar</Button>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Extrato</h2>
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/50">
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium text-right">Valor</th>
              <th className="px-4 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-3">
                  {t.type === "credit"
                    ? <ArrowUp className="w-4 h-4 text-success" />
                    : <ArrowDown className="w-4 h-4 text-destructive" />}
                </td>
                <td className="px-4 py-3">{t.desc}</td>
                <td className={`px-4 py-3 text-right font-mono font-semibold ${t.amount > 0 ? "text-success" : "text-destructive"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
