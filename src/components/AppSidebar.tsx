import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Search, Building2, Send, Mail, FileText,
  Plug, Flame, Coins, Users, LogOut, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const groups = [
  { label: "Principal", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/scan", label: "Scanner Contatos", icon: Search },
    { to: "/companies", label: "Empresas (CNPJ)", icon: Building2 },
  ]},
  { label: "Campanhas", items: [
    { to: "/campaigns", label: "WhatsApp", icon: Send },
    { to: "/email-campaigns", label: "E-mail", icon: Mail },
    { to: "/templates", label: "Templates", icon: FileText },
    { to: "/warmup", label: "Aquecimento", icon: Flame },
  ]},
  { label: "Configurações", items: [
    { to: "/connections", label: "Conexões", icon: Plug },
    { to: "/credits", label: "Créditos", icon: Coins },
    { to: "/admin", label: "Admin", icon: Users },
  ]},
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <aside className="w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sidebar-foreground leading-none">Atual Prospect</div>
            <div className="text-[10px] text-muted-foreground tracking-widest mt-1">v12.7.2</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{g.label}</div>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link to={item.to} className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      active
                        ? "bg-gradient-brand-soft text-foreground border border-primary/20 shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}>
                      <Icon className={cn("w-4 h-4", active && "text-primary")} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </aside>
  );
}
