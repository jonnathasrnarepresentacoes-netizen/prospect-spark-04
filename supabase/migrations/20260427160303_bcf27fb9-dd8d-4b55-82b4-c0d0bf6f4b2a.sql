-- ================== ENUMS ==================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed');
CREATE TYPE public.campaign_channel AS ENUM ('whatsapp', 'email');
CREATE TYPE public.connection_status AS ENUM ('connected', 'disconnected', 'error');
CREATE TYPE public.transaction_type AS ENUM ('credit', 'debit', 'refund');

-- ================== PROFILES ==================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  credits INTEGER NOT NULL DEFAULT 100,
  plan_slug TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ================== USER ROLES ==================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ================== PLANS ==================
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  credits_included INTEGER NOT NULL DEFAULT 0,
  daily_extraction_limit INTEGER NOT NULL DEFAULT 100,
  daily_send_limit INTEGER NOT NULL DEFAULT 100,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads active plans" ON public.plans FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage plans" ON public.plans FOR ALL USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.plans (slug, name, price_cents, credits_included, daily_extraction_limit, daily_send_limit, permissions) VALUES
('free', 'Free', 0, 100, 50, 50, '{"contacts":true,"companies":true,"whatsapp":false,"email":false,"warmup":false}'::jsonb),
('starter', 'Starter', 4900, 1000, 500, 500, '{"contacts":true,"companies":true,"whatsapp":true,"email":true,"warmup":false}'::jsonb),
('pro', 'Pro', 19900, 5000, 2000, 2000, '{"contacts":true,"companies":true,"whatsapp":true,"email":true,"warmup":true,"unlimited_export":true}'::jsonb),
('business', 'Business', 49900, 15000, 10000, 10000, '{"contacts":true,"companies":true,"whatsapp":true,"email":true,"warmup":true,"unlimited_export":true}'::jsonb);

-- ================== CREDIT TRANSACTIONS ==================
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  service TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own transactions" ON public.credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.credit_transactions(user_id, created_at DESC);

-- ================== COMPANIES (base CNPJ) ==================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj TEXT NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  fantasia TEXT,
  uf TEXT,
  cidade TEXT,
  bairro TEXT,
  endereco TEXT,
  cep TEXT,
  cnae TEXT,
  cnae_descricao TEXT,
  porte TEXT,
  status TEXT DEFAULT 'ATIVA',
  mei BOOLEAN DEFAULT false,
  simples BOOLEAN DEFAULT false,
  matriz BOOLEAN DEFAULT true,
  telefone TEXT,
  email TEXT,
  whatsapp BOOLEAN DEFAULT false,
  ddd TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated reads companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage companies" ON public.companies FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX ON public.companies(uf);
CREATE INDEX ON public.companies(cidade);
CREATE INDEX ON public.companies(cnae);
CREATE INDEX ON public.companies(status);
CREATE INDEX companies_search_idx ON public.companies USING gin(to_tsvector('portuguese', coalesce(razao_social,'') || ' ' || coalesce(fantasia,'') || ' ' || coalesce(cnae_descricao,'')));

-- ================== SCAN HISTORY ==================
CREATE TABLE public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own scans" ON public.scan_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.scan_history(user_id, created_at DESC);

-- ================== TEMPLATES ==================
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel public.campaign_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  body_html TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own templates" ON public.templates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ================== CONNECTIONS ==================
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel public.campaign_channel NOT NULL,
  name TEXT NOT NULL,
  identifier TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.connection_status NOT NULL DEFAULT 'disconnected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own connections" ON public.connections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ================== CAMPAIGNS ==================
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel public.campaign_channel NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  connection_id UUID REFERENCES public.connections(id) ON DELETE SET NULL,
  status public.campaign_status NOT NULL DEFAULT 'draft',
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.campaigns(user_id, created_at DESC);

CREATE TABLE public.campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  email TEXT,
  variables JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error TEXT
);

ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users access campaign contacts" ON public.campaign_contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()));

-- ================== WARMUP ==================
CREATE TABLE public.warmup_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_interactions INTEGER NOT NULL DEFAULT 100,
  done_interactions INTEGER NOT NULL DEFAULT 0,
  delay_min_seconds INTEGER NOT NULL DEFAULT 30,
  delay_max_seconds INTEGER NOT NULL DEFAULT 120,
  status public.campaign_status NOT NULL DEFAULT 'draft',
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.warmup_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own warmups" ON public.warmup_campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ================== AUDIT LOGS ==================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins view logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================== TRIGGER: novo usuário ==================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits, plan_slug)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), 100, 'free');

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  INSERT INTO public.credit_transactions (user_id, type, amount, service, description)
  VALUES (NEW.id, 'credit', 100, 'signup_bonus', 'Bônus de boas-vindas');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================== TIMESTAMP TRIGGER ==================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();