#!/usr/bin/env bash
# Autoriza a chave da VM1 para que o Ansible acesse a VM2 por SSH.
set -euo pipefail

PUB=/chaves/vm1.pub
AUTORIZADAS=/home/vagrant/.ssh/authorized_keys

if [[ ! -f "$PUB" ]]; then
  echo "Chave da VM1 não encontrada em $PUB. Suba a vm1 antes da vm2." >&2
  exit 1
fi

grep -qxF "$(cat "$PUB")" "$AUTORIZADAS" || cat "$PUB" >> "$AUTORIZADAS"
