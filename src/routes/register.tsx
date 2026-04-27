import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Criar conta — Atual Prospect" }] }),
});

function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) toast.error(error);
    else { toast.success("Conta criada! 100 créditos grátis 🎉"); navigate({ to: "/dashboard" }); }
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
          <h1 className="text-2xl font-bold mb-1">Crie sua conta</h1>
          <p className="text-sm text-muted-foreground mb-6">Comece grátis com 100 créditos</p>
          <form onSubmit={submit} className="space-y-4">
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" />
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" />
            <Input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha (mín. 8 caracteres)" />
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta? <Link to="/login" className="text-primary hover:underline font-medium">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
