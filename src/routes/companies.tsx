import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Search, Download, Send, Mail, Filter, Building2, Loader2, CheckCircle2, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/companies")({
  component: CompaniesPage,
  head: () => ({ meta: [{ title: "Empresas (CNPJ) — Atual Prospect" }] }),
});

const ufList = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

type Company = {
  id: string; cnpj: string; razao_social: string; fantasia: string | null;
  uf: string | null; cidade: string | null; bairro: string | null;
  cnae: string | null; porte: string | null; status: string | null;
  mei: boolean | null; simples: boolean | null; whatsapp: boolean | null;
  telefone: string | null; email: string | null;
};

function CompaniesPage() {
  const { user, refreshProfile } = useAuth();
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Company[]>([]);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({ uf: "", cidade: "", bairro: "", cnae: "", porte: "", text: "", onlyWa: false, onlyEmail: false, onlyMei: false });

  const runSearch = async () => {
    if (!user) return;
    setSearching(true); setResults([]); setProgress(0); setSelected(new Set());

    let p = 0;
    const interval = setInterval(() => {
      p = Math.min(p + Math.random() * 15, 92);
      setProgress(p);
    }, 200);

    let query = supabase.from("companies").select("*").eq("status", "ATIVA").limit(100);
    if (filters.uf) query = query.eq("uf", filters.uf);
    if (filters.cidade) query = query.ilike("cidade", `%${filters.cidade}%`);
    if (filters.bairro) query = query.ilike("bairro", `%${filters.bairro}%`);
    if (filters.cnae) query = query.ilike("cnae", `%${filters.cnae}%`);
    if (filters.porte) query = query.eq("porte", filters.porte);
    if (filters.text) query = query.or(`razao_social.ilike.%${filters.text}%,fantasia.ilike.%${filters.text}%,cnae_descricao.ilike.%${filters.text}%`);
    if (filters.onlyWa) query = query.eq("whatsapp", true);
    if (filters.onlyEmail) query = query.not("email", "is", null);
    if (filters.onlyMei) query = query.eq("mei", true);

    const { data, error } = await query;
    clearInterval(interval);
    setProgress(100);

    if (error) {
      toast.error("Erro: " + error.message);
      setSearching(false);
      return;
    }

    setTimeout(async () => {
      setResults((data || []) as Company[]);
      setSearching(false);

      // Salva histórico + debita 1 crédito por busca
      await supabase.from("scan_history").insert({
        user_id: user.id,
        name: `Busca CNPJ ${filters.uf || "Brasil"}`,
        filters: filters as any,
        results_count: data?.length || 0,
      });
      await supabase.from("credit_transactions").insert({
        user_id: user.id, type: "debit", amount: -1,
        service: "company_search", description: `Busca de empresas (${data?.length || 0} resultados)`,
      });
      const { data: prof } = await supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle();
      if (prof) await supabase.from("profiles").update({ credits: (prof.credits ?? 0) - 1 }).eq("id", user.id);
      refreshProfile();
      toast.success(`${data?.length || 0} empresas encontradas`);
    }, 300);
  };

  const toggle = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const exportCsv = () => {
    const rows = results.filter(r => selected.size === 0 || selected.has(r.id));
    const header = ["CNPJ","Razao Social","Fantasia","UF","Cidade","Bairro","CNAE","Telefone","Email","WhatsApp"];
    const csv = [header.join(",")].concat(rows.map(r => [r.cnpj, r.razao_social, r.fantasia, r.uf, r.cidade, r.bairro, r.cnae, r.telefone, r.email, r.whatsapp ? "Sim" : "Nao"].map(v => `"${v ?? ""}"`).join(","))).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `empresas-${Date.now()}.csv`; a.click();
    toast.success("CSV exportado");
  };

  return (
    <AppShell title="Empresas (CNPJ Brasil)" subtitle="Busca avançada · Status: ATIVA">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <aside>
          <div className="bg-gradient-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><Filter className="w-4 h-4 text-primary" /><h2 className="font-semibold">Filtros</h2></div>
            <div className="space-y-3">
              <Field label="UF">
                <select value={filters.uf} onChange={e => setFilters({...filters, uf: e.target.value})} className="w-full h-9 px-3 rounded-md bg-input border border-border text-sm">
                  <option value="">Todos</option>
                  {ufList.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </Field>
              <Field label="Cidade"><Input value={filters.cidade} onChange={e => setFilters({...filters, cidade: e.target.value})} placeholder="Ex: São Paulo" /></Field>
              <Field label="Bairro"><Input value={filters.bairro} onChange={e => setFilters({...filters, bairro: e.target.value})} placeholder="Ex: Vila Madalena" /></Field>
              <Field label="CNAE"><Input value={filters.cnae} onChange={e => setFilters({...filters, cnae: e.target.value})} placeholder="Ex: 5611-2" /></Field>
              <Field label="Porte">
                <select value={filters.porte} onChange={e => setFilters({...filters, porte: e.target.value})} className="w-full h-9 px-3 rounded-md bg-input border border-border text-sm">
                  <option value="">Todos</option><option>ME</option><option>EPP</option><option>Demais</option>
                </select>
              </Field>
              <Field label="Texto livre"><Input value={filters.text} onChange={e => setFilters({...filters, text: e.target.value})} placeholder="Razão, fantasia, ramo" /></Field>
              <div className="pt-2 space-y-2 border-t border-border">
                <Toggle label="Apenas MEI" checked={filters.onlyMei} onChange={v => setFilters({...filters, onlyMei: v})} />
                <Toggle label="Somente com e-mail" checked={filters.onlyEmail} onChange={v => setFilters({...filters, onlyEmail: v})} />
                <Toggle label="Somente com WhatsApp" checked={filters.onlyWa} onChange={v => setFilters({...filters, onlyWa: v})} />
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
                  <Button variant="outline" size="sm" onClick={exportCsv}><Download className="w-4 h-4" /> Exportar CSV</Button>
                  <Button asChild variant="outline" size="sm"><Link to="/campaigns"><Send className="w-4 h-4" /> WhatsApp</Link></Button>
                  <Button asChild variant="hero" size="sm"><Link to="/email-campaigns"><Mail className="w-4 h-4" /> E-mail</Link></Button>
                </div>
              </div>
              <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-card/60">
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
                        <tr key={c.id} className="border-t border-border hover:bg-card/40 transition">
                          <td className="px-3 py-3"><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="accent-primary" /></td>
                          <td className="px-3 py-3">
                            <div className="font-medium">{c.razao_social}</div>
                            <div className="text-xs text-muted-foreground font-mono">{c.cnpj}</div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1 text-xs"><MapPin className="w-3 h-3 text-muted-foreground" />{c.cidade}/{c.uf}</div>
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
  return (<div><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">{label}</label>{children}</div>);
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (<label className="flex items-center justify-between cursor-pointer text-sm"><span>{label}</span><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="accent-primary" /></label>);
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
