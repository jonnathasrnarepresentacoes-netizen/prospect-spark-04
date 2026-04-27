import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockCompanies, ufList } from "@/lib/mock-data";
import { useState } from "react";
import { Search, Download, Send, Mail, Filter, Building2, Loader2, CheckCircle2, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/companies")({
  component: CompaniesPage,
  head: () => ({ meta: [{ title: "Empresas (CNPJ) — Atual Prospect" }] }),
});

function CompaniesPage() {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<typeof mockCompanies>([]);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const runSearch = () => {
    setSearching(true);
    setResults([]);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setResults(mockCompanies);
          setSearching(false);
        }, 300);
      } else {
        setProgress(p);
      }
    }, 200);
  };

  const toggle = (cnpj: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(cnpj) ? next.delete(cnpj) : next.add(cnpj);
      return next;
    });
  };

  return (
    <AppShell title="Empresas (CNPJ Brasil)" subtitle="Busca avançada na base nacional · Status: ATIVA">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Filters */}
        <aside className="space-y-4">
          <div className="bg-gradient-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-primary" />
              <h2 className="font-semibold">Filtros</h2>
            </div>
            <div className="space-y-3">
              <Field label="UF">
                <select className="w-full h-9 px-3 rounded-md bg-input border border-border text-sm">
                  <option>Selecione</option>
                  {ufList.map(uf => <option key={uf}>{uf}</option>)}
                </select>
              </Field>
              <Field label="Cidade"><Input placeholder="Carregando..." /></Field>
              <Field label="Bairro"><Input placeholder="Carregando..." /></Field>
              <Field label="CNAE / Ramo"><Input placeholder="Ex: 5611-2" /></Field>
              <Field label="Porte">
                <select className="w-full h-9 px-3 rounded-md bg-input border border-border text-sm">
                  <option>Todos</option><option>ME</option><option>EPP</option><option>Demais</option>
                </select>
              </Field>
              <Field label="DDD"><Input placeholder="Ex: 11" /></Field>
              <Field label="Texto livre"><Input placeholder="Razão, fantasia, ramo" /></Field>

              <div className="pt-2 space-y-2 border-t border-border">
                <Toggle label="Apenas MEI" />
                <Toggle label="Apenas Simples Nacional" />
                <Toggle label="Apenas Matriz" defaultChecked />
                <Toggle label="Somente indústria" />
                <Toggle label="Somente com e-mail" defaultChecked />
                <Toggle label="Somente com celular" defaultChecked />
                <Toggle label="Somente com WhatsApp" defaultChecked />
              </div>

              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-success" /> Status travado em ATIVA
                </div>
                <Button variant="hero" className="w-full" onClick={runSearch} disabled={searching}>
                  {searching ? <><Loader2 className="w-4 h-4 animate-spin" /> Buscando...</> : <><Search className="w-4 h-4" /> Buscar empresas</>}
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section>
          {searching && (
            <div className="bg-gradient-card border border-primary/30 rounded-2xl p-8 mb-4 shadow-glow animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center animate-pulse-glow">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Varrendo base CNPJ Brasil...</div>
                  <div className="text-xs text-muted-foreground">
                    {progress < 30 ? "Conectando à fonte..." : progress < 60 ? "Lendo registros..." : progress < 90 ? "Aplicando filtros..." : "Organizando resultados..."}
                  </div>
                </div>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-brand transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-right text-xs text-muted-foreground mt-2 font-mono">{Math.round(progress)}%</div>
            </div>
          )}

          {!searching && results.length === 0 && (
            <div className="bg-gradient-card border border-border rounded-2xl p-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-1">Configure os filtros e busque</h3>
              <p className="text-sm text-muted-foreground">Encontre empresas ATIVAS na base nacional CNPJ.</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="text-sm">
                  <span className="font-bold text-primary text-lg">{results.length}</span>{" "}
                  <span className="text-muted-foreground">empresas encontradas</span>
                  {selected.size > 0 && <span className="ml-3 text-accent font-medium">{selected.size} selecionadas</span>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Download className="w-4 h-4" /> Exportar CSV</Button>
                  <Button asChild variant="outline" size="sm"><Link to="/campaigns"><Send className="w-4 h-4" /> WhatsApp</Link></Button>
                  <Button asChild variant="hero" size="sm"><Link to="/email-campaigns"><Mail className="w-4 h-4" /> E-mail</Link></Button>
                </div>
              </div>

              <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-card/60 sticky top-0">
                      <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="px-3 py-3 w-8"></th>
                        <th className="px-3 py-3 font-medium">Empresa</th>
                        <th className="px-3 py-3 font-medium">Localização</th>
                        <th className="px-3 py-3 font-medium">CNAE</th>
                        <th className="px-3 py-3 font-medium">Contato</th>
                        <th className="px-3 py-3 font-medium">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((c) => (
                        <tr key={c.cnpj} className="border-t border-border hover:bg-card/40 transition">
                          <td className="px-3 py-3">
                            <input type="checkbox" checked={selected.has(c.cnpj)} onChange={() => toggle(c.cnpj)} className="accent-primary" />
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium">{c.razaoSocial}</div>
                            <div className="text-xs text-muted-foreground font-mono">{c.cnpj}</div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1 text-xs">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {c.cidade}/{c.uf}
                            </div>
                            <div className="text-xs text-muted-foreground">{c.bairro}</div>
                          </td>
                          <td className="px-3 py-3 text-xs font-mono text-muted-foreground">{c.cnae}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1 text-xs"><Phone className="w-3 h-3 text-muted-foreground" />{c.telefone}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">{c.email}</div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              <Badge color="success">{c.status}</Badge>
                              {c.whatsapp && <Badge color="primary">WA</Badge>}
                              {c.mei && <Badge color="accent">MEI</Badge>}
                              {c.simples && <Badge color="warning">Simples</Badge>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between cursor-pointer text-sm">
      <span>{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="accent-primary" />
    </label>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: "success" | "primary" | "accent" | "warning" }) {
  const map = {
    success: "bg-success/15 text-success border-success/30",
    primary: "bg-primary/15 text-primary border-primary/30",
    accent: "bg-accent/15 text-accent border-accent/30",
    warning: "bg-warning/15 text-warning border-warning/30",
  };
  return <span className={`text-[10px] px-1.5 py-0.5 rounded border ${map[color]} font-semibold`}>{children}</span>;
}
