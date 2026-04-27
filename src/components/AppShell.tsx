import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Coins, Bell, Loader2 } from "lucide-react";

export function AppShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = (profile?.full_name || profile?.email || "U").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/40 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
          <div>
            {title && <h1 className="text-lg font-semibold leading-tight">{title}</h1>}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">{(profile?.credits ?? 0).toLocaleString("pt-BR")}</span>
              <span className="text-xs text-muted-foreground">créditos</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-card transition relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium leading-none">{profile?.full_name ?? "Usuário"}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">Plano {profile?.plan_slug ?? "free"}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
