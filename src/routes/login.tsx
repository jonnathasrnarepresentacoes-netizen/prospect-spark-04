import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — Atual Prospect" }] }),
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) toast.error(error);
    else { toast.success("Bem-vindo!"); navigate({ to: "/dashboard" }); }
  };

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
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">E-mail</label>
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@empresa.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Senha</label>
              <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta? <Link to="/register" className="text-primary hover:underline font-medium">Cadastre-se</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
