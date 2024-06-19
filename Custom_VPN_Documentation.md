---
layout: project
type: project
title: Custom VPN Walkthrough
date: 2023-04-16
labels:
  - ITM 684
  - Linux
---
## Prerequisites 
- One Ubuntu server with a sudo non-root user and a firewall enabled. [Initial Server Set Up](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04)
- A second server to act as the CA. Follow the same [Initial Server Set Up](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04) and [steps 1-3](https://www.digitalocean.com/community/tutorials/how-to-set-up-and-configure-a-certificate-authority-ca-on-ubuntu-20-04)

Generate a droplet
- ubuntu 22.04 LTS x64; SFO3; 0.04/month
- adduser tiffany
- sudo usermod -aG sudo tiffany

sudo apt install openssh-server openssh-client

- $ sudo vim /etc/ssh/sshd_config
    - Edit the file to change the port from 22 to 41235 or whatever port you want
- enable pubkey authentication

- mkdir ~/.ssh

- vim ~/.ssh/authorized_keys
    - append key created during ssh-keygen
    - cat /etc/ssh/id_rsa.pub

- ssh -p 41235 name@ip


    - CA should only be on during use of authenticating, making, or revoking client certificates. It should be off when not in use to prevent it from being compromised. 

Generate another droplet for CA 

Step 1
- ubuntu 22.04 LTS x64; SFO3; 0.04/month
- adduser tiffany
- sudo usermod -aG sudo tiffany

Step 2
- sudo apt update
- sudo apt install easy-rsa 

Step 3 - PKI directory
- mkdir ~/easy-rsa
- ln -s /usr/share/easy-rsa/* ~/easy-rsa/
    - symlinks 
- chmod 700 /home/tiffany/easy-rsa
    - change permissions only for owner
- cd ~/easy-rsa
- ./easyrsa init-pki
    - initialize PKI inside the directory

Step 4
- cd ~/easy-rsa
- nano vars

> ~/easy-rsa/vars

> set_var EASYRSA_REQ_COUNTRY    "US"

> set_var EASYRSA_REQ_PROVINCE   "Hawaii"

> set_var EASYRSA_REQ_CITY       "Honolulu"

> set_var EASYRSA_REQ_ORG        "DigitalOcean"

> set_var EASYRSA_REQ_EMAIL      "tyoung24@hawaii.edu"

> set_var EASYRSA_REQ_OU         "Community"

> set_var EASYRSA_ALGO           "ec"

> set_var EASYRSA_DIGEST         "sha512"

- ./easyrsa build-ca
    - enter password

Step 5 - Distributing your Certificate Authority’s Public Certificate
- cat ~/easy-rsa/pki/ca.crt
    - copy the output
- nano /tmp/ca.crt
    - paste 
- sudo cp /tmp/ca.crt /usr/local/share/ca-certificates/
- sudo update-ca-certificates
    - these import the certificates 

#### Public Keys

sudo apt install openssh-server openssh-client

- $ sudo vim /etc/ssh/sshd_config
    - Edit the file to change the port from 22 to 41235 or whatever port you want
- enable pubkey authentication

- mkdir ~/.ssh

- vim ~/.ssh/authorized_keys
    - append key created during ssh-keygen
    - cat /etc/ssh/id_rsa.pub

## OpenVPN 
### Installing OpenVPN and Easy RSA
- sudo apt update
- sudo apt install openvpn easy-rsa
- mkdir ~/easy-rsa
    - make an easy-rsa directory
- ln -s /usr/share/easy-rsa/* ~/easy-rsa/
    - create a symlink from the easyrsa script that was installed to the directory
-sudo chown tiffany ~/easy-rsa
-chmod 700 ~/easy-rsa
    - ensure the directory’s owner is your non-root sudo user and restrict access to that user

### Creating a PKI 

- cd ~/easy-rsa
- nano vars
    - in the file, paste:

    > set_var EASYRSA_ALGO "ec"

    > set_var EASYRSA_DIGEST "sha512"

    - this server is not the CA so these two lines is all.
- ./easyrsa init-pki

### Create a certificate request and private key
- cd ~/easy-rsa
- ./easyrsa gen-req server nopass
    - name the server, can leave blank
- sudo cp /home/tiffany/easy-rsa/pki/private/server.key /etc/openvpn/server/

### Signing the certificate
- scp /home/tiffany/easy-rsa/pki/reqs/server.req tiffany@your_ca_server_ip:/tmp
    - ensure the CA has vpn server's public key (ssh in the prereqs)

On CA server
- cd ~/easy-rsa
- ./easyrsa import-req /tmp/server.req server
    - this imports the server from the secure copy
- ./easyrsa sign-req server server
    - it will ask if this is from a trusted source, say yes and confirm
- scp pki/issued/server.crt tiffany@your_vpn_server_ip:/tmp
- scp pki/ca.crt tiffany@your_vpn_server_ip:/tmp
    - make sure vpn server has the CA server's public key

On VPN server
- sudo cp /tmp/{server.crt,ca.crt} /etc/openvpn/server
    - copy the files from /tmp

### Configuring OpenVPN cryptographic material
- cd ~/easy-rsa
- openvpn --genkey secret ta.key
- sudo cp ta.key /etc/openvpn/server

### Generate client certificate and key pair
- mkdir -p ~/client-configs/keys
- chmod -R 700 ~/client-configs
- cd ~/easy-rsa
- ./easyrsa gen-req client1 nopass
    - create key
- cp pki/private/client1.key ~/client-configs/keys/
    - copy the key
- scp pki/reqs/client1.req tiffany@your_ca_server_ip:/tmp
    - transfer to the CA server

On CA server
- cd ~/easy-rsa
- ./easyrsa import-req /tmp/client1.req client1
- ./easyrsa sign-req client client1
    - prompted to sign
- scp pki/issued/client1.crt tiffany@your_server_ip:/tmp
    - copy the client certificate back to VPN server

On VPN Server
- cp /tmp/client1.crt ~/client-configs/keys/
    - copy the certificate to the client-configs/keys/ directory
- cp ~/easy-rsa/ta.key ~/client-configs/keys/
- sudo cp /etc/openvpn/server/ca.crt ~/client-configs/keys/
- sudo chown tiffany.tiffany ~/client-configs/keys/*

### Configure OpenVPN
- sudo cp /usr/share/doc/openvpn/examples/sample-config-files/server.conf.gz /etc/openvpn/server/
- sudo gunzip /etc/openvpn/server/server.conf.gz
- sudo nano /etc/openvpn/server/server.conf

change ';tls-auth ta.key 0 # This file is secret' to <b>tls-crypt ta.key</b>

change ';cipher AES-256-CBC' to <b>cipher AES-256-GCM</b>
- after this line,  add <b>auth SHA256</b>

change ';dh dh2048.pem' to <b>dh none</b>

uncomment 
- user nobody
- group nogroup

if it says group nobody, change it to nobody

- push "redirect-gateway def1 bypass-dhcp"
- push "dhcp-option DNS 208.67.222.222"
- push "dhcp-option DNS 208.67.220.220"

Adjust port 1194 to 443 and change protocol to proto tcp

change explicity-exit-notify *0*

This is necessary for TCP or it will cause errors.

change port 1194 to 443

uncomment proto tcp

### Adjusting networking configuration
- sudo nano /etc/sysctl.conf
- net.ipv4.ip_forward = 1

sudo sysctl -p should output "net.ipv4.ip_forward = 1"

### Firewall conf
-ip route list default
output: default via 159.65.160.1 dev *eth0* proto static

-sudo nano /etc/ufw/before.rules

paste : 
>\# START OPENVPN RULES

>\# NAT table rules

>*nat

>:POSTROUTING ACCEPT [0:0]

>\# Allow traffic from OpenVPN client to eth0 (change to the interface you discovered!)

>-A POSTROUTING -s 10.8.0.0/8 -o eth0 -j MASQUERADE

>COMMIT

>\# END OPENVPN RULES

save and close

- sudo nano /etc/default/ufw
change drop to accept: DEFAULT_FORWARD_POLICY="ACCEPT"

allowing 443 and 53 means our traffic will never be blocked
- sudo ufw allow 443/tcp
- sudo ufw allow 53/udp
- sudo ufw allow 41235/tcp
- sudo ufw allow openssh
- sufo ufw disable
- sudo ufw enable

### Starting OpenVPN
- sudo systemctl -f enable openvpn-server@server.service
- sudo systemctl start openvpn-server@server.service

Check if it started
- sudo systemctl status openvpn-server@server.service


### Creating Client Config Infrastructure
- mkdir -p ~/client-configs/files
- cp /usr/share/doc/openvpn/examples/sample-config-files/client.conf ~/client-configs/base.conf
- nano ~/client-configs/base.conf
- proto tcp

uncomment: 
> \# Downgrade privileges after initialization (non-Windows only)

> user nobody

> group nogroup

comment out ca, cert, key, and tls-auth ta.key 1

mirror cipher and auth 
>cipher AES-256-GCM

>auth SHA256

add key-direction somewhere

> key-direction 1

comment out 

>; script-security 2

>; up /etc/openvpn/update-resolv-conf

>; down /etc/openvpn/update-resolv-conf


>; script-security 2

>; up /etc/openvpn/update-systemd-resolved

>; down /etc/openvpn/update-systemd-resolved

>; down-pre

>; dhcp-option DOMAIN-ROUTE .

save and close

nano ~/client-configs/make_config.sh

#!/bin/bash
 
\# First argument: Client identifier
 
KEY_DIR=~/client-configs/keys

OUTPUT_DIR=~/client-configs/files

BASE_CONFIG=~/client-configs/base.conf
 
cat ${BASE_CONFIG} \

> <(echo -e '<ca>') \

> ${KEY_DIR}/ca.crt \

> <(echo -e '</ca>\n<cert>') \

> ${KEY_DIR}/${1}.crt \

> <(echo -e '</cert>\n<key>') \

> ${KEY_DIR}/${1}.key \

> <(echo -e '</key>\n<tls-crypt>') \

> ${KEY_DIR}/ta.key \

> <(echo -e '</tls-crypt>') \

> ${OUTPUT_DIR}/${1}.ovpn

Mark this as an executable
- chmod 700 ~/client-configs/make_config.sh

### Generating Client Configurations
- cd ~/client-configs
- ./make_config.sh client1

- ls ~/client-configs/files

On your local machine
- sftp -P 41235 tiffany@openvpn_server_ip:client-configs/files/client1.ovpn ~/
copies the client config from the server

- sudo apt update
    - or pacman -Syu
- sudo apt install openvpn
    - or sudo pacman -S openvpn

- ls /etc/openvpn/
- nano client1.opvn

uncomment:
- script-security-2
- up /etc/openvpn/update-resolv-conf
- down /etc/openvpn/update-resolv-conf

connect with:
- sudo openvpn --config client1.ovpn

## AlgoVPN
get a copy of algo
- git clone https://github.com/trailofbits/algo.git
install core dependencies 
- sudo apt install -y --no-install-recommends python3-virtualenv
other dependencies
- cd algo
- python3 -m virtualenv --python="$(command -v python3)" .env &&
  source .env/bin/activate &&
  python3 -m pip install -U pip virtualenv &&
  python3 -m pip install -r requirements.txt
set config options
- vim config.cfg 
    - adjust ports or users
- run ./algo

on *client machine* (linux)
- sudo apt update && sudo apt upgrade
If the file /var/run/reboot-required exists then reboot:
- [ -e /var/run/reboot-required ] && sudo reboot 
Install wireguard
- sudo apt install wireguard openresolv

Locate the config file
- sftp -P 41235 tiffany@147.182.232.139:algo/configs/147.182.194.171/wireguard/laptop.conf ~/

Install config file 
- sudo install -o root -g root -m 600 <username>.conf /etc/wireguard/wg0.conf
    - i used laptop.conf in the previous command

## Wireguard on pc
Download wireguard and setup
- add tunnel and find the .conf file previously downloaded


## Start wireguard on linux
- sudo systemctl start wg-quick@wg0
Check if it started correctly
- sudo systemctl status wg-quick@wg0
Verify connection
- sudo wg
See if client is using IP address of algovpn
- curl ipv4.icanhazip.com
    - may need to install curl
Optionally configure connection to come up at boot
- sudo systemctl enable wg-quick@wg0

## Cronjobs
- crontab -e 
    - open with preferred text editor




