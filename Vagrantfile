# -*- mode: ruby -*-
# vi: set ft=ruby :

# Algumas distribuições instalam o Vagrant com outro provedor como padrão.
ENV["VAGRANT_DEFAULT_PROVIDER"] = "virtualbox"

BOX = "bento/ubuntu-24.04"
VM1_IP = "192.168.56.10"
VM2_IP = "192.168.56.11"

Vagrant.configure("2") do |config|
  config.vm.box = BOX

  config.vm.synced_folder ".", "/vagrant", disabled: true

  # Troca da chave SSH: a VM1 grava a chave pública aqui e a VM2 a autoriza.
  config.vm.synced_folder ".vagrant/chaves", "/chaves", create: true

  # VM1: nó de controle do Ansible.
  config.vm.define "vm1" do |vm1|
    vm1.vm.hostname = "vm1"
    vm1.vm.network "private_network", ip: VM1_IP

    # O Ansible ignora o ansible.cfg de pastas com permissão de escrita para
    # todos, que é o padrão das pastas compartilhadas do VirtualBox.
    vm1.vm.synced_folder "ansible", "/home/vagrant/ansible",
      owner: "vagrant", group: "vagrant",
      mount_options: ["dmode=755", "fmode=644"]

    vm1.vm.provider "virtualbox" do |vb|
      vb.name = "clinica-vm1"
      vb.memory = 1024
    end

    vm1.vm.provision "shell", name: "ansible", path: "provision/vm1-ansible.sh"
  end

  # VM2: backend (API Node.js + PostgreSQL), configurado pelo Ansible da VM1.
  config.vm.define "vm2" do |vm2|
    vm2.vm.hostname = "vm2"
    vm2.vm.network "private_network", ip: VM2_IP

    vm2.vm.provider "virtualbox" do |vb|
      vb.name = "clinica-vm2"
      vb.memory = 2048
    end

    # Roda sempre para aceitar a chave nova se a VM1 for recriada.
    vm2.vm.provision "shell", name: "chave-ssh", path: "provision/vm2-chave-ssh.sh", run: "always"
  end
end
