import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Search, Building2, Send, Mail, Flame, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Atual Prospect — Prospecção inteligente B2B" },
      { name: "description", content: "Encontre empresas, dispare WhatsApp e e-mail em massa, aqueça contas e escale sua prospecção." },
    ],
  }),
});

const features = [
  { icon: Building2, title: "Base CNPJ Brasil", desc: "Busca avançada em milhões de empresas com filtros por UF, cidade, bairro, CNAE, MEI, porte e mais." },
  { icon: Search, title: "Scanner de Contatos", desc: "Leia planilhas Google/locais, mapeie colunas e exporte em segundos." },
  { icon: Send, title: "Campanhas WhatsApp", desc: "Disparos com pool de conexões, modo seguro, intervalos randomizados e workers." },
  { icon: Mail, title: "Campanhas E-mail", desc: "SMTP, templates HTML, agendamento e logs detalhados de entrega." },
  { icon: Flame, title: "Aquecimento", desc: "Aqueça contas WhatsApp automaticamente para reduzir bloqueios." },
  { icon: Shield, title: "Planos & Créditos", desc: "Sistema completo de planos, permissões e carteira de créditos por usuário." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Atual Prospect</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/login">Entrar</Link></Button>
            <Button asChild variant="hero" size="sm"><Link to="/register">Criar conta</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary mb-6 animate-fade-in">
          <Zap className="w-3 h-3" /> v12.7.2 · Animação de busca profissional
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] animate-slide-up">
          Prospecção B2B <br />
          <span className="text-gradient-brand">em escala industrial</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up">
          Encontre empresas na base CNPJ, dispare campanhas WhatsApp e e-mail, aqueça contas e gerencie tudo num só painel.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-slide-up">
          <Button asChild variant="hero" size="lg"><Link to="/dashboard">Acessar painel</Link></Button>
          <Button asChild variant="premium" size="lg"><Link to="/companies">Buscar empresas →</Link></Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="group p-6 rounded-2xl bg-gradient-card border border-border hover:border-primary/40 transition-all hover:shadow-glow">
              <div className="w-11 h-11 rounded-xl bg-gradient-brand-soft border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © 2026 Atual Prospect. Todos os direitos reservados.
      </footer>
    </div>
  );
}
