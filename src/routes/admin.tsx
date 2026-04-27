import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Shield, Coins, ScrollText, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Atual Prospect" }] }),
});

type Profile = { id: string; full_name: string | null; email: string | null; plan_slug: string; credits: number };

function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustOpen, setAdjustOpen] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Acesso restrito a administradores");
      navigate({ to: "/dashboard" });
    }
  }, [authLoading, isAdmin, navigate]);

  const load = async () => {
    const [{ data: u }, { data: p }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("plans").select("*").order("price_cents"),
    ]);
    setUsers((u ?? []) as Profile[]);
    setPlans(p ?? []);
    setLoading(false);
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const adjust = async (uid: string, current: number) => {
    if (!adjustAmount) return;
    const newVal = Math.max(0, current + adjustAmount);
    await supabase.from("profiles").update({ credits: newVal }).eq("id", uid);
    await supabase.from("credit_transactions").insert({
      user_id: uid, type: adjustAmount > 0 ? "credit" : "debit",
      amount: Math.abs(adjustAmount), service: "admin_adjust", description: "Ajuste manual admin",
    });
    toast.success("Saldo ajustado");
    setAdjustOpen(null); setAdjustAmount(0); load();
  };

  if (authLoading || !isAdmin) return null;

  const sections = [
    { label: "Usuários", icon: Users, count: users.length },
    { label: "Planos ativos", icon: Shield, count: plans.length },
    { label: "Logs", icon: ScrollText, count: "—" },
    { label: "Pacotes créditos", icon: Coins, count: 4 },
  ];

  return (
    <AppShell title="Painel Administrativo" subtitle="Gerencie usuários, planos, créditos e logs">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {sections.map((s) => (
          <div key={s.label} className="bg-gradient-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-brand-soft border border-primary/20 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">{s.count}</span>
            </div>
            <h3 className="font-semibold">{s.label}</h3>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Planos</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {plans.map((p) => (
          <div key={p.id} className="bg-gradient-card border border-border rounded-2xl p-4">
            <h3 className="font-semibold">{p.name}</h3>
            <div className="text-xs text-muted-foreground">R$ {(p.price_cents / 100).toFixed(2)}/mês</div>
            <div className="text-sm mt-2">{p.credits_included} créditos · {p.daily_send_limit} envios/dia</div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Usuários ({users.length})</h2>
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
        {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-card/50">
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium text-right">Créditos</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-card/40 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded font-semibold capitalize">{u.plan_slug}</span></td>
                  <td className="px-4 py-3 text-right font-mono">{u.credits.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-right">
                    {adjustOpen === u.id ? (
                      <div className="flex gap-1 justify-end items-center">
                        <Input type="number" placeholder="±qtd" className="w-20 h-7" value={adjustAmount || ""} onChange={(e) => setAdjustAmount(+e.target.value)} />
                        <Button size="sm" onClick={() => adjust(u.id, u.credits)}>OK</Button>
                        <Button size="sm" variant="ghost" onClick={() => setAdjustOpen(null)}>×</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setAdjustOpen(u.id)}><Plus className="w-3 h-3" /> Créditos</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
