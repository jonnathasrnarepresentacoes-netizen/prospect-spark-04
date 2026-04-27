import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Coins, ArrowDown, ArrowUp, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

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

type Tx = { id: string; type: "credit" | "debit"; amount: number; description: string | null; service: string | null; created_at: string };

function CreditsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("credit_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setTxs((data ?? []) as Tx[]);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const buy = async (pkg: typeof packages[0]) => {
    if (!user || !profile) return;
    setBuying(pkg.name);
    // Mock: adds credits directly. Real flow would integrate Stripe.
    const { error: txErr } = await supabase.from("credit_transactions").insert({
      user_id: user.id,
      type: "credit",
      amount: pkg.credits,
      service: "purchase",
      description: `Compra pacote ${pkg.name} (R$ ${pkg.price})`,
    });
    if (txErr) { setBuying(null); return toast.error(txErr.message); }
    await supabase.from("profiles").update({ credits: profile.credits + pkg.credits }).eq("id", user.id);
    await refreshProfile();
    setBuying(null);
    toast.success(`+${pkg.credits} créditos adicionados!`);
    load();
  };

  return (
    <AppShell title="Meus Créditos" subtitle="Carteira, pacotes e extrato de transações">
      <div className="bg-gradient-brand rounded-2xl p-8 mb-6 shadow-glow flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Coins className="w-12 h-12 text-white" />
          <div>
            <div className="text-xs text-white/80 uppercase tracking-widest">Saldo atual</div>
            <div className="text-4xl font-bold text-white">{(profile?.credits ?? 0).toLocaleString("pt-BR")}</div>
            <div className="text-xs text-white/80">créditos disponíveis</div>
          </div>
        </div>
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
            <Button variant={p.popular ? "hero" : "outline"} className="w-full" onClick={() => buy(p)} disabled={buying === p.name}>
              {buying === p.name && <Loader2 className="w-3 h-3 animate-spin" />} Comprar
            </Button>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Extrato</h2>
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : txs.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Sem movimentações ainda.</div>
        ) : (
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
              {txs.map((t) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    {t.type === "credit"
                      ? <ArrowUp className="w-4 h-4 text-success" />
                      : <ArrowDown className="w-4 h-4 text-destructive" />}
                  </td>
                  <td className="px-4 py-3">{t.description ?? t.service}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${t.type === "credit" ? "text-success" : "text-destructive"}`}>
                    {t.type === "credit" ? "+" : "-"}{t.amount.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
