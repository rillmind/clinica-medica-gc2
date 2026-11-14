#!/usr/bin/env bash
# Instala o Ansible na VM1 e gera a chave SSH que ele usa para acessar a VM2.
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

if ! command -v ansible-playbook >/dev/null; then
  apt-get update -y
  apt-get install -y ansible-core
fi

CHAVE=/home/vagrant/.ssh/id_ed25519

if [[ ! -f "$CHAVE" ]]; then
  sudo -u vagrant ssh-keygen -q -t ed25519 -N '' -C vm1-ansible -f "$CHAVE"
fi

# A VM2 lê a chave pública dessa pasta compartilhada para autorizar o acesso.
cp "$CHAVE.pub" /chaves/vm1.pub

ansible --version | head -1
