import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Users, Shield, Coins, ScrollText, FileSpreadsheet } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Atual Prospect" }] }),
});

const sections = [
  { to: "/admin", label: "Usuários", desc: "Gerenciar contas, papéis e planos", icon: Users, count: "248" },
  { to: "/admin", label: "Planos", desc: "Configurar planos e permissões", icon: Shield, count: "4" },
  { to: "/admin", label: "Créditos", desc: "Pacotes, custos e ajustes manuais", icon: Coins, count: "12 pkgs" },
  { to: "/admin", label: "Logs de auditoria", desc: "Ações administrativas e do sistema", icon: ScrollText, count: "1.2k" },
  { to: "/sheets", label: "Fontes de planilha", desc: "Google Sheets e arquivos locais", icon: FileSpreadsheet, count: "8" },
];

const recentUsers = [
  { name: "Maria Silva", email: "maria@empresa.com", plan: "Pro", credits: 4500, role: "user" },
  { name: "Carlos Souza", email: "carlos@empresa.com", plan: "Business", credits: 12300, role: "user" },
  { name: "Admin Master", email: "admin@empresa.com", plan: "Enterprise", credits: 99999, role: "admin" },
];

function AdminPage() {
  return (
    <AppShell title="Painel Administrativo" subtitle="Gerencie usuários, planos, créditos e logs">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {sections.map((s) => (
          <Link key={s.label} to={s.to} className="group bg-gradient-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all hover:shadow-glow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-brand-soft border border-primary/20 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">{s.count}</span>
            </div>
            <h3 className="font-semibold">{s.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Usuários recentes</h2>
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/50">
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 font-medium">Papel</th>
              <th className="px-4 py-3 font-medium text-right">Créditos</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u) => (
              <tr key={u.email} className="border-t border-border hover:bg-card/40 transition">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3"><span className="text-xs bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded font-semibold">{u.plan}</span></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-semibold border ${u.role === "admin" ? "bg-accent/15 text-accent border-accent/30" : "bg-muted text-muted-foreground border-border"}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-right font-mono">{u.credits.toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
