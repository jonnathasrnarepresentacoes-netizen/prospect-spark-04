# Instalação na VPS — Atual Prospect

Script único que prepara a VPS, instala dependências, sobe **Postgres + Supabase self-hosted via Docker**, faz build do app, configura **Nginx + SSL** no seu subdomínio e cria o serviço systemd.

> Resultado: tudo roda **100% na sua VPS**, sem depender da Lovable Cloud.

---

## Requisitos da VPS

| Item | Mínimo | Recomendado |
|------|--------|-------------|
| SO | Ubuntu 22.04 / 24.04 ou Debian 12 | Ubuntu 24.04 |
| CPU | 1 vCPU | 2 vCPU |
| RAM | 2 GB | 4 GB |
| Disco | 20 GB SSD | 40 GB SSD |
| Rede | Portas 80, 443 e 22 abertas | + IPv6 |
| DNS | **A record** do subdomínio (ex: `app.seudominio.com`) apontando para o IP da VPS, **antes** de rodar o script | — |

Acesso: usuário `root` ou `sudo`.

---

## Passo a passo

### 1. Aponte o subdomínio para a VPS

No painel DNS do seu domínio crie um registro:

```
Tipo: A      Nome: app      Valor: <IP_DA_VPS>      TTL: 300
```

Aguarde a propagação (`dig app.seudominio.com +short` deve retornar o IP).

### 2. Conecte na VPS

```bash
ssh root@SEU_IP
```

### 3. Baixe e rode o instalador

```bash
curl -fsSL https://raw.githubusercontent.com/SEU_USUARIO/atual-prospect/main/install.sh -o install.sh
sudo bash install.sh \
  --domain app.seudominio.com \
  --email voce@seudominio.com \
  --repo  https://github.com/SEU_USUARIO/atual-prospect.git
```

Ou modo interativo (sem flags):

```bash
sudo bash install.sh
```

O script vai:

1. Atualizar o SO (`apt update && upgrade`)
2. Instalar Docker, Node 20, Nginx, Certbot, ufw
3. Configurar firewall (libera 80/443/SSH)
4. Subir **Supabase self-hosted** (Postgres 15, GoTrue Auth, PostgREST, Storage, Realtime, Studio) via `docker compose`
5. Gerar JWT_SECRET, ANON_KEY e SERVICE_ROLE_KEY próprios
6. Clonar o app, criar `.env`, aplicar todas as migrations em `supabase/migrations/`
7. `bun install && bun run build`
8. Criar serviço `systemd` (auto-restart, inicia no boot)
9. Configurar Nginx como reverse proxy (app + API Supabase no mesmo domínio)
10. Emitir certificado SSL Let's Encrypt

Tempo estimado: **5–10 minutos**.

Ao final, acesse `https://app.seudominio.com`. As credenciais geradas (senha do Postgres, do Studio, anon/service keys) são exibidas no resumo final.

---

## Atualizações

### Atualizar o app (após push no git)

```bash
cd /opt/atual-prospect
git pull
bun install
bun run build
systemctl restart atual-prospect
```

### Atualizar o servidor (SO + pacotes)

```bash
apt update && apt upgrade -y
reboot
```

### Atualizar o Supabase

```bash
cd /opt/supabase
docker compose pull
docker compose up -d
```

### Renovar SSL

Automático via cron do certbot. Forçar manualmente:

```bash
certbot renew --nginx
```

---

## Comandos úteis

```bash
# Status / logs do app
systemctl status atual-prospect
journalctl -u atual-prospect -f

# Logs do Supabase
cd /opt/supabase && docker compose logs -f

# Acessar Postgres
docker exec -it supabase-db psql -U postgres

# Backup do banco
docker exec supabase-db pg_dump -U postgres postgres | gzip > backup-$(date +%F).sql.gz

# Restaurar
gunzip -c backup.sql.gz | docker exec -i supabase-db psql -U postgres
```

---

## Estrutura instalada

```
/opt/atual-prospect/        # código do app (TanStack Start)
  ├── .env                  # gerado pelo instalador
  └── .output/server/...    # build de produção

/opt/supabase/              # docker-compose do Supabase self-hosted
  ├── .env                  # JWT_SECRET, senhas, keys (NÃO COMMITAR)
  └── docker-compose.yml

/etc/systemd/system/atual-prospect.service
/etc/nginx/sites-available/atual-prospect
```

---

## Observações importantes

- **Mesmo código, mesma SDK**: o app continua usando `@supabase/supabase-js`, todas as RLS, auth e migrations funcionam idênticas. Só muda a URL/keys.
- **Sem custo de Lovable Cloud**: tudo roda na sua VPS.
- **Backup**: agende o `pg_dump` em cron diário para um storage externo.
- **E-mail (signup confirm)**: por padrão o Supabase self-hosted usa SMTP fake. Edite `/opt/supabase/.env` (`SMTP_*`) com seu provedor (Resend, SendGrid, etc.) e rode `docker compose up -d`.
- **Domínio**: o script assume **um único subdomínio** servindo app + API Supabase. Se quiser separar (`api.seudominio.com`), basta duplicar o bloco `server` no Nginx.
