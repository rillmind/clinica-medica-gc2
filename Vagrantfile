# -*- mode: ruby -*-
# vi: set ft=ruby :

# Algumas distribuições instalam o Vagrant com outro provedor como padrão.
ENV["VAGRANT_DEFAULT_PROVIDER"] = "virtualbox"

BOX = "bento/ubuntu-24.04"
VM1_IP = "192.168.56.10"
VM2_IP = "192.168.56.11"

Vagrant.configure("2") do |config|
  config.vm.box = BOX

  # Só a VM2 recebe a aplicação, em /vagrant_data.
  config.vm.synced_folder ".", "/vagrant", disabled: true

  # VM1: cliente usado para testar a API da VM2.
  config.vm.define "vm1" do |vm1|
    vm1.vm.hostname = "vm1"
    vm1.vm.network "private_network", ip: VM1_IP

    vm1.vm.provider "virtualbox" do |vb|
      vb.name = "clinica-vm1"
      vb.memory = 1024
    end
  end

  # VM2: backend (API Node.js + PostgreSQL).
  config.vm.define "vm2" do |vm2|
    vm2.vm.hostname = "vm2"
    vm2.vm.network "private_network", ip: VM2_IP
    vm2.vm.synced_folder ".", "/vagrant_data"

    vm2.vm.provider "virtualbox" do |vb|
      vb.name = "clinica-vm2"
      vb.memory = 2048
    end

    vm2.vm.provision "shell", name: "dependencias", path: "provision/vm2-dependencias.sh"

    # A pasta sincronizada só é montada depois do boot, então a API
    # é iniciada aqui a cada vagrant up/reload, e não pelo systemd no boot.
    vm2.vm.provision "shell", name: "aplicacao", path: "provision/vm2-aplicacao.sh", run: "always"
  end
end
