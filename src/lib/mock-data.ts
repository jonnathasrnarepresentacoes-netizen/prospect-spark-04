export const mockUser = {
  name: "João Prospect",
  email: "joao@empresa.com",
  plan: "Pro",
  credits: 12480,
  role: "admin" as "admin" | "user",
};

export const mockStats = {
  extractionsLeft: 1850,
  sendsLeft: 980,
  totalWhatsappCampaigns: 14,
  totalEmailCampaigns: 7,
  totalWhatsappConnections: 5,
  totalEmailConnections: 3,
  totalTemplates: 22,
  totalContacts: 48230,
};

export const recentScans = [
  { id: 1, name: "Indústrias SP - Capital", filters: "SP · São Paulo · Indústria", results: 1240, date: "2026-04-26" },
  { id: 2, name: "Comércio RJ Zona Sul", filters: "RJ · Rio de Janeiro · Copacabana", results: 387, date: "2026-04-25" },
  { id: 3, name: "Restaurantes BH", filters: "MG · Belo Horizonte · CNAE 5611", results: 612, date: "2026-04-24" },
  { id: 4, name: "MEI Curitiba", filters: "PR · Curitiba · MEI", results: 2890, date: "2026-04-23" },
];

export const mockCompanies = Array.from({ length: 24 }, (_, i) => ({
  cnpj: `${(12345678 + i).toString().padStart(8, "0")}/0001-${(10 + i).toString().slice(-2)}`,
  razaoSocial: [
    "Indústria Metalúrgica Brasil Ltda",
    "Comércio de Alimentos Sabor & Cia",
    "Tech Solutions Software ME",
    "Construtora Horizonte SA",
    "Farmácia Saúde Total Ltda",
    "Auto Peças Express Eireli",
  ][i % 6],
  fantasia: ["MetalBrasil", "Sabor&Cia", "TechSol", "Horizonte", "SaúdeTotal", "AutoExpress"][i % 6],
  uf: ["SP", "RJ", "MG", "PR", "RS", "BA"][i % 6],
  cidade: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Salvador"][i % 6],
  bairro: ["Centro", "Vila Madalena", "Copacabana", "Savassi", "Batel", "Moinhos"][i % 6],
  cnae: ["2511-0/00", "5611-2/01", "6201-5/01", "4120-4/00", "4771-7/01", "4530-7/03"][i % 6],
  porte: ["Demais", "ME", "EPP", "Demais", "ME", "EPP"][i % 6],
  telefone: `(${11 + (i % 30)}) 3${1000 + i}-${4000 + i}`,
  whatsapp: i % 3 === 0,
  email: `contato${i}@empresa${i}.com.br`,
  status: "ATIVA",
  mei: i % 5 === 0,
  simples: i % 2 === 0,
  matriz: true,
}));

export const mockCampaigns = [
  { id: 1, name: "Black Friday Indústrias", status: "Enviando", sent: 842, total: 1500, channel: "whatsapp", created: "2026-04-25" },
  { id: 2, name: "Lançamento Produto X", status: "Concluída", sent: 2100, total: 2100, channel: "whatsapp", created: "2026-04-20" },
  { id: 3, name: "Newsletter Abril", status: "Agendada", sent: 0, total: 5400, channel: "email", created: "2026-04-22" },
  { id: 4, name: "Reativação Clientes", status: "Pausada", sent: 320, total: 980, channel: "whatsapp", created: "2026-04-18" },
  { id: 5, name: "Promoção Restaurantes", status: "Rascunho", sent: 0, total: 0, channel: "email", created: "2026-04-26" },
];

export const mockTemplates = [
  { id: 1, name: "Boas-vindas WhatsApp", channel: "whatsapp", body: "Olá {nome}! Tudo bem? Somos da Atual Prospect..." },
  { id: 2, name: "Promoção 50% OFF", channel: "whatsapp", body: "{nome}, oferta exclusiva pra você em {cidade}!" },
  { id: 3, name: "Newsletter Mensal", channel: "email", body: "Confira as novidades do mês..." },
  { id: 4, name: "Follow-up Reunião", channel: "whatsapp", body: "Oi {nome}, seguindo nossa conversa..." },
];

export const mockConnections = [
  { id: 1, name: "WhatsApp Vendas", number: "+55 11 99999-1111", status: "connected", channel: "whatsapp" },
  { id: 2, name: "WhatsApp Suporte", number: "+55 11 99999-2222", status: "connected", channel: "whatsapp" },
  { id: 3, name: "WhatsApp Marketing", number: "+55 11 99999-3333", status: "disconnected", channel: "whatsapp" },
  { id: 4, name: "SMTP Principal", number: "smtp.empresa.com:587", status: "connected", channel: "email" },
];

export const ufList = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
