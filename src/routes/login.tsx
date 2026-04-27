import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — Atual Prospect" }] }),
});

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />
      <div className="w-full max-w-md relative animate-scale-in">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl">Atual Prospect</span>
        </Link>

        <div className="bg-gradient-card border border-border rounded-2xl p-8 shadow-premium">
          <h1 className="text-2xl font-bold mb-1">Bem-vindo de volta</h1>
          <p className="text-sm text-muted-foreground mb-6">Acesse sua conta para começar a prospectar</p>

          <form className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">E-mail</label>
              <Input type="email" placeholder="voce@empresa.com" defaultValue="joao@empresa.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Senha</label>
              <Input type="password" placeholder="••••••••" defaultValue="demo1234" />
            </div>
            <Button asChild variant="hero" className="w-full"><Link to="/dashboard">Entrar</Link></Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">Cadastre-se</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
