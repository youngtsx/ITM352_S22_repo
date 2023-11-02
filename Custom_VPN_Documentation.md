sudo apt install openssh-server openssh-client

##### $ sudo vim /etc/ssh/sshd_config

Edit the file to change the port from 22 to 41235 or whatever port you want

on CS server droplet, add the vpn server's key to .ssh/authorized_keys file
and vice versa. 

##### $ ssh-keygen and then cat ~/.ssh/id_rsa.pub

##### $ copy paste the key into .ssh/authorized_keys

##### $ scp /home/tiffany/easy-rsa/pki/reqs/server.req tiffany@24.199.104.111:/tmpserver.req

##### $ ~/easy-rsa$ ./easyrsa import-req /tmp/server.req server

##### $ sudo ufw allow 41235/tcp