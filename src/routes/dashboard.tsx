import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { mockStats, mockUser, recentScans } from "@/lib/mock-data";
import {
  Search, Building2, Send, Mail, FileText, Plug, Users, Coins,
  TrendingUp, Zap, ArrowUpRight, Flame
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Atual Prospect" }] }),
});

const stats = [
  { label: "Créditos disponíveis", value: mockUser.credits.toLocaleString("pt-BR"), icon: Coins, trend: "+12%", color: "text-primary" },
  { label: "Extrações hoje", value: mockStats.extractionsLeft, icon: Search, trend: "1.85k restantes", color: "text-accent" },
  { label: "Envios hoje", value: mockStats.sendsLeft, icon: Send, trend: "980 restantes", color: "text-success" },
  { label: "Contatos extraídos", value: mockStats.totalContacts.toLocaleString("pt-BR"), icon: Users, trend: "+2.4k esta semana", color: "text-warning" },
];

const cards = [
  { label: "Camp. WhatsApp", value: mockStats.totalWhatsappCampaigns, icon: Send, to: "/campaigns" },
  { label: "Camp. E-mail", value: mockStats.totalEmailCampaigns, icon: Mail, to: "/email-campaigns" },
  { label: "Conexões WhatsApp", value: mockStats.totalWhatsappConnections, icon: Plug, to: "/connections" },
  { label: "Conexões E-mail", value: mockStats.totalEmailConnections, icon: Plug, to: "/connections" },
  { label: "Templates", value: mockStats.totalTemplates, icon: FileText, to: "/templates" },
  { label: "Aquecimento", value: 3, icon: Flame, to: "/warmup" },
];

const shortcuts = [
  { label: "Buscar empresas", desc: "Base CNPJ Brasil", icon: Building2, to: "/companies", color: "from-cyan-500/20 to-cyan-500/5" },
  { label: "Scanner contatos", desc: "Planilhas Google/local", icon: Search, to: "/scan", color: "from-indigo-500/20 to-indigo-500/5" },
  { label: "Nova campanha WA", desc: "Disparo seguro", icon: Send, to: "/campaigns", color: "from-fuchsia-500/20 to-fuchsia-500/5" },
  { label: "Aquecer contas", desc: "Reduzir bloqueios", icon: Flame, to: "/warmup", color: "from-orange-500/20 to-orange-500/5" },
];

function Dashboard() {
  return (
    <AppShell title="Dashboard" subtitle={`Bem-vindo de volta, ${mockUser.name.split(" ")[0]} 👋`}>
      {/* Plan banner */}
      <div className="rounded-2xl bg-gradient-brand-soft border border-primary/20 p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Plano atual</div>
            <div className="text-xl font-bold">Pro · {mockUser.credits.toLocaleString("pt-BR")} créditos</div>
          </div>
        </div>
        <Link to="/credits" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
          Comprar créditos <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-gradient-card border border-border rounded-2xl p-5 hover:border-primary/30 transition">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            <div className="text-[10px] text-success mt-2">{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Shortcuts */}
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

      {/* Mini cards + recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Resumo da conta</h2>
          <div className="grid grid-cols-2 gap-3">
            {cards.map((c) => (
              <Link key={c.label} to={c.to} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition">
                <c.icon className="w-4 h-4 text-muted-foreground mb-2" />
                <div className="text-xl font-bold">{c.value}</div>
                <div className="text-[10px] text-muted-foreground">{c.label}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Varreduras recentes</h2>
            <Link to="/scan" className="text-xs text-primary hover:underline">Ver todas →</Link>
          </div>
          <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-card/50">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Filtros</th>
                  <th className="px-4 py-3 font-medium text-right">Resultados</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-card/40 transition">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.filters}</td>
                    <td className="px-4 py-3 text-right font-mono text-primary">{r.results.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
