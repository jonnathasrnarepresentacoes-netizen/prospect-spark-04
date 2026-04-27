import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Search, Building2, Send, Mail, FileText, Plug, Coins,
  TrendingUp, Zap, ArrowUpRight, Flame, Loader2
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Atual Prospect" }] }),
});

const shortcuts = [
  { label: "Buscar empresas", desc: "Base CNPJ Brasil", icon: Building2, to: "/companies", color: "from-cyan-500/20 to-cyan-500/5" },
  { label: "Scanner contatos", desc: "Planilhas Google/local", icon: Search, to: "/scan", color: "from-indigo-500/20 to-indigo-500/5" },
  { label: "Nova campanha WA", desc: "Disparo seguro", icon: Send, to: "/campaigns", color: "from-fuchsia-500/20 to-fuchsia-500/5" },
  { label: "Aquecer contas", desc: "Reduzir bloqueios", icon: Flame, to: "/warmup", color: "from-orange-500/20 to-orange-500/5" },
];

function Dashboard() {
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState({ wa: 0, email: 0, conn: 0, tpl: 0, warm: 0, scans: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [wa, em, conn, tpl, warm, scans, recents] = await Promise.all([
        supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("channel", "whatsapp"),
        supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("channel", "email"),
        supabase.from("connections").select("id", { count: "exact", head: true }),
        supabase.from("templates").select("id", { count: "exact", head: true }),
        supabase.from("warmup_campaigns").select("id", { count: "exact", head: true }),
        supabase.from("scan_history").select("id", { count: "exact", head: true }),
        supabase.from("scan_history").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setCounts({
        wa: wa.count ?? 0, email: em.count ?? 0, conn: conn.count ?? 0,
        tpl: tpl.count ?? 0, warm: warm.count ?? 0, scans: scans.count ?? 0,
      });
      setRecent(recents.data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const cards = [
    { label: "Camp. WhatsApp", value: counts.wa, icon: Send, to: "/campaigns" },
    { label: "Camp. E-mail", value: counts.email, icon: Mail, to: "/email-campaigns" },
    { label: "Conexões", value: counts.conn, icon: Plug, to: "/connections" },
    { label: "Templates", value: counts.tpl, icon: FileText, to: "/templates" },
    { label: "Aquecimento", value: counts.warm, icon: Flame, to: "/warmup" },
    { label: "Buscas CNPJ", value: counts.scans, icon: Search, to: "/companies" },
  ];

  return (
    <AppShell title="Dashboard" subtitle={`Bem-vindo, ${(profile?.full_name ?? "explorador").split(" ")[0]} 👋`}>
      <div className="rounded-2xl bg-gradient-brand-soft border border-primary/20 p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Plano atual</div>
            <div className="text-xl font-bold capitalize">{profile?.plan_slug ?? "free"} · {(profile?.credits ?? 0).toLocaleString("pt-BR")} créditos</div>
          </div>
        </div>
        <Link to="/credits" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
          Comprar créditos <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Atalhos rápidos</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {shortcuts.map((s) => (
          <Link key={s.to} to={s.to} className={`group rounded-2xl p-5 border border-border bg-gradient-to-br ${s.color} hover:border-primary/40 transition-all hover:shadow-glow`}>
            <s.icon className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition" />
            <div className="font-semibold">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Resumo da conta</h2>
          <div className="grid grid-cols-2 gap-3">
            {cards.map((c) => (
              <Link key={c.label} to={c.to} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition">
                <c.icon className="w-4 h-4 text-muted-foreground mb-2" />
                <div className="text-xl font-bold">{loading ? "..." : c.value}</div>
                <div className="text-[10px] text-muted-foreground">{c.label}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Buscas recentes</h2>
            <Link to="/companies" className="text-xs text-primary hover:underline">Nova busca →</Link>
          </div>
          <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : recent.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Nenhuma busca ainda. <Link to="/companies" className="text-primary hover:underline">Faça a primeira →</Link></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-card/50">
                  <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium text-right">Resultados</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-card/40 transition">
                      <td className="px-4 py-3 font-medium">{r.name ?? "Busca sem nome"}</td>
                      <td className="px-4 py-3 text-right font-mono text-primary">{r.results_count.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
