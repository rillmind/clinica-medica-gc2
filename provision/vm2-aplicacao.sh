#!/usr/bin/env bash
# Instala os pacotes npm, compila e inicia a API a partir de /vagrant_data.
set -euo pipefail

APP_DIR=/vagrant_data
MODULES_DIR=/opt/clinica/node_modules

# node_modules fica no disco da VM: evita depender de symlinks na pasta
# compartilhada e não altera o node_modules da máquina host.
mkdir -p "$MODULES_DIR" "$APP_DIR/node_modules"
chown -R vagrant:vagrant /opt/clinica
mountpoint -q "$APP_DIR/node_modules" || mount --bind "$MODULES_DIR" "$APP_DIR/node_modules"

sudo -u vagrant -H bash -c "cd '$APP_DIR' && npm ci --ignore-scripts --include=dev && npm run build"

systemctl restart clinica-api

for _ in $(seq 1 30); do
  if curl -fs http://localhost:3000/health >/dev/null; then
    echo "API disponível em http://192.168.56.11:3000"
    exit 0
  fi
  sleep 1
done

echo "A API não respondeu em /health" >&2
journalctl -u clinica-api --no-pager -n 30 >&2
exit 1
