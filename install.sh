#!/usr/bin/env bash
###############################################################################
#  ATUAL PROSPECT - Instalador único para VPS (Ubuntu 22.04 / 24.04 / Debian 12)
# -----------------------------------------------------------------------------
#  O que faz:
#    - Atualiza o servidor
#    - Instala Docker, Docker Compose, Node 20, Nginx, Certbot
#    - Sobe Supabase self-hosted (Postgres + Auth + Storage + REST + Realtime)
#    - Clona o repositório do app (TanStack Start) e faz build
#    - Configura systemd para o app rodar na porta 3000
#    - Configura Nginx + SSL (Let's Encrypt) no subdomínio informado
#    - Aplica as migrations do projeto no Postgres local
#
#  Uso:
#    sudo bash install.sh \
#         --domain app.seudominio.com \
#         --email voce@seudominio.com \
#         --repo https://github.com/SEU_USUARIO/atual-prospect.git
#
#  Ou interativo:
#    sudo bash install.sh
#
#  Requisitos mínimos da VPS:
#    - Ubuntu 22.04+ ou Debian 12+ (root ou sudo)
#    - 2 vCPU / 4 GB RAM / 30 GB SSD  (mínimo absoluto: 1 vCPU / 2 GB)
#    - Portas 80 e 443 abertas
#    - Subdomínio (A record) já apontando para o IP da VPS
###############################################################################

set -euo pipefail

# ----------------------------- helpers --------------------------------------
log()  { echo -e "\033[1;32m[+]\033[0m $*"; }
warn() { echo -e "\033[1;33m[!]\033[0m $*"; }
err()  { echo -e "\033[1;31m[x]\033[0m $*" >&2; }
die()  { err "$*"; exit 1; }
rand() { openssl rand -hex "${1:-24}"; }

[[ $EUID -eq 0 ]] || die "Execute como root: sudo bash install.sh"

# ----------------------------- args -----------------------------------------
DOMAIN=""
EMAIL=""
REPO=""
APP_DIR="/opt/atual-prospect"
SUPABASE_DIR="/opt/supabase"
APP_PORT=3000

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2 ;;
    --email)  EMAIL="$2";  shift 2 ;;
    --repo)   REPO="$2";   shift 2 ;;
    --app-dir) APP_DIR="$2"; shift 2 ;;
    -h|--help)
      grep -E '^#( |!)' "$0" | head -40; exit 0 ;;
    *) die "Argumento desconhecido: $1" ;;
  esac
done

[[ -z "$DOMAIN" ]] && read -rp "Subdomínio (ex: app.seudominio.com): " DOMAIN
[[ -z "$EMAIL"  ]] && read -rp "Email (Let's Encrypt): " EMAIL
[[ -z "$REPO"   ]] && read -rp "Repositório git do app: " REPO

[[ -n "$DOMAIN" && -n "$EMAIL" && -n "$REPO" ]] || die "domain, email e repo são obrigatórios"

log "Domínio:  $DOMAIN"
log "Email:    $EMAIL"
log "Repo:     $REPO"
log "App dir:  $APP_DIR"

# ----------------------------- 1. update SO ---------------------------------
log "Atualizando sistema..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git ca-certificates gnupg lsb-release ufw \
                   nginx certbot python3-certbot-nginx openssl jq

# ----------------------------- 2. firewall ----------------------------------
log "Configurando firewall..."
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
yes | ufw enable || true

# ----------------------------- 3. docker ------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  log "Instalando Docker..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME:-jammy}") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

# ----------------------------- 4. node 20 -----------------------------------
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -dv -f2 | cut -d. -f1)" -lt 20 ]]; then
  log "Instalando Node 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
npm i -g bun >/dev/null 2>&1 || true

# ----------------------------- 5. supabase self-hosted ----------------------
log "Provisionando Supabase self-hosted em $SUPABASE_DIR ..."
mkdir -p "$SUPABASE_DIR"
if [[ ! -f "$SUPABASE_DIR/docker-compose.yml" ]]; then
  cd /tmp
  rm -rf supabase-src
  git clone --depth 1 https://github.com/supabase/supabase supabase-src
  cp -rf supabase-src/docker/* "$SUPABASE_DIR/"
  rm -rf supabase-src
fi

cd "$SUPABASE_DIR"
if [[ ! -f .env ]]; then
  log "Gerando segredos do Supabase..."
  cp .env.example .env
  POSTGRES_PASSWORD="$(rand 24)"
  JWT_SECRET="$(rand 40)"
  DASHBOARD_PASSWORD="$(rand 12)"
  # gera ANON e SERVICE_ROLE com o jwt secret usando container temporário
  ANON_KEY="$(docker run --rm -e JWT_SECRET="$JWT_SECRET" node:20-alpine sh -lc '
    npm i -s jsonwebtoken >/dev/null 2>&1
    node -e "console.log(require(\"jsonwebtoken\").sign({role:\"anon\",iss:\"supabase\",iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+60*60*24*365*10},process.env.JWT_SECRET))"')"
  SERVICE_ROLE_KEY="$(docker run --rm -e JWT_SECRET="$JWT_SECRET" node:20-alpine sh -lc '
    npm i -s jsonwebtoken >/dev/null 2>&1
    node -e "console.log(require(\"jsonwebtoken\").sign({role:\"service_role\",iss:\"supabase\",iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+60*60*24*365*10},process.env.JWT_SECRET))"')"

  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|"     .env
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|"                         .env
  sed -i "s|^ANON_KEY=.*|ANON_KEY=$ANON_KEY|"                               .env
  sed -i "s|^SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY|"       .env
  sed -i "s|^DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=$DASHBOARD_PASSWORD|" .env
  sed -i "s|^SITE_URL=.*|SITE_URL=https://$DOMAIN|"                         .env
  sed -i "s|^API_EXTERNAL_URL=.*|API_EXTERNAL_URL=https://$DOMAIN|"         .env
  sed -i "s|^SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=https://$DOMAIN|"   .env
fi

log "Subindo containers Supabase..."
docker compose pull
docker compose up -d
sleep 10

# carrega vars
set -a; source "$SUPABASE_DIR/.env"; set +a

# ----------------------------- 6. clona app ---------------------------------
log "Clonando aplicação em $APP_DIR ..."
if [[ ! -d "$APP_DIR/.git" ]]; then
  git clone "$REPO" "$APP_DIR"
else
  cd "$APP_DIR" && git pull --ff-only
fi

cd "$APP_DIR"

# .env do app apontando para o supabase local
log "Configurando .env do app..."
cat > "$APP_DIR/.env" <<EOF
VITE_SUPABASE_URL=https://$DOMAIN
VITE_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY
SUPABASE_URL=http://localhost:8000
SUPABASE_PUBLISHABLE_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
PORT=$APP_PORT
NODE_ENV=production
EOF

# ----------------------------- 7. migrations --------------------------------
if [[ -d "$APP_DIR/supabase/migrations" ]]; then
  log "Aplicando migrations no Postgres..."
  for f in "$APP_DIR"/supabase/migrations/*.sql; do
    [[ -f "$f" ]] || continue
    log "  -> $(basename "$f")"
    docker exec -i supabase-db psql -U postgres -d postgres < "$f" || warn "Falha em $f (talvez já aplicada)"
  done
fi

# ----------------------------- 8. build app ---------------------------------
log "Instalando deps e buildando app..."
cd "$APP_DIR"
bun install
bun run build

# ----------------------------- 9. systemd -----------------------------------
log "Criando serviço systemd..."
cat > /etc/systemd/system/atual-prospect.service <<EOF
[Unit]
Description=Atual Prospect (TanStack Start)
After=network.target docker.service

[Service]
Type=simple
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now atual-prospect

# ----------------------------- 10. nginx + ssl ------------------------------
log "Configurando Nginx para $DOMAIN ..."
cat > /etc/nginx/sites-available/atual-prospect <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    client_max_body_size 50m;

    # Supabase API (REST/Auth/Storage/Realtime) -> kong na porta 8000
    location ~ ^/(rest|auth|storage|realtime|functions)/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # App (TanStack Start)
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/atual-prospect /etc/nginx/sites-enabled/atual-prospect
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

log "Emitindo certificado SSL via Let's Encrypt..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || \
  warn "Falha no certbot. Verifique se o DNS do $DOMAIN aponta para este servidor."

# ----------------------------- 11. resumo -----------------------------------
cat <<EOF

=========================================================================
  INSTALAÇÃO CONCLUÍDA
=========================================================================
  App URL:            https://$DOMAIN
  Supabase Studio:    https://$DOMAIN/  (proxied)  -> use credenciais abaixo
  Studio user:        supabase
  Studio password:    $(grep ^DASHBOARD_PASSWORD $SUPABASE_DIR/.env | cut -d= -f2)

  Postgres (interno): localhost:5432  (db=postgres user=postgres)
  Postgres password:  $(grep ^POSTGRES_PASSWORD $SUPABASE_DIR/.env | cut -d= -f2)

  Anon key:           $ANON_KEY
  Service role key:   (em $SUPABASE_DIR/.env)

  Comandos úteis:
    systemctl status atual-prospect
    journalctl -u atual-prospect -f
    cd $SUPABASE_DIR && docker compose logs -f
    cd $APP_DIR && git pull && bun install && bun run build && systemctl restart atual-prospect

  Atualizar o sistema operacional:
    apt update && apt upgrade -y && reboot
=========================================================================
EOF
