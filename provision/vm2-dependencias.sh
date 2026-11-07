#!/usr/bin/env bash
# Instala Node.js e PostgreSQL, prepara o banco e registra o serviço da API.
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

if ! command -v node >/dev/null || [[ "$(node --version)" != v20.* ]]; then
  apt-get update -y
  apt-get install -y ca-certificates curl
  curl --proto '=https' --tlsv1.2 -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

apt-get install -y postgresql
systemctl enable --now postgresql

sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER postgres PASSWORD 'postgres';"

# O init.sql insere dados de exemplo, então só roda quando o banco é criado.
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = 'clinica'" | grep -q 1; then
  sudo -u postgres createdb clinica
  sudo -u postgres psql -v ON_ERROR_STOP=1 -d clinica < /vagrant_data/init.sql
fi

cat > /etc/systemd/system/clinica-api.service <<'UNIT'
[Unit]
Description=API Clinica Medica GC2
After=network.target postgresql.service
Requires=postgresql.service

[Service]
User=vagrant
WorkingDirectory=/vagrant_data
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DATABASE_URL=postgres://postgres:postgres@localhost:5432/clinica
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
