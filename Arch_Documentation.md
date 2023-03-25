# Arch Linux Installation Documentation 





## Arch Installation
Download .iso file 
Insert file into new VM. It will not detect which OS so choose most recent other linux kernel version.

Give hard disk size (around 20 GB min) and memory (2 GB).

Run pre-installation checks

### Partition and format the disk
>cfdisk /dev/sda
-1M to BIOS
-4 GB to swap 
-Rest of drive for root 

Create Ext4 file system on root partition
>mkfs.ext4 /dev/sda3

Initialize swap partition
>mkswap /dev/sda2


Mount file systems
>mount /dev/sda3 /mnt
enable swap volume
>swapon /dev/sda2

### Install
>pacstrap -K /mnt base linux linux-firmware grub 

It is crucial for the previous steps including mounting the filesystems to /mnt for this to work. 

the first three packages are the essentials, kernel, and firmware. Grub is the bootloader.

### Configure
>genfstab -UI /mnt >> /mnt/etc/fstab

>arch-chroot /mnt
It will give errors if /mnt is not mounted to the file system like during the previous steps.

Localization
>echo LANG=en_US.UTF-8 > /etc/locale.conf
Put the language into that file/create the file. 

Root password
>passwd

### Reboot
>exit
>umount -a
>reboot

It will reboot into the gnu grub. During my first installation, when I rebooted it went right back to the screen I first saw when I started. The boot into arch installation so I thought my work was for nothing. I ended up starting over. But it was because I didn't install any bootloader. 

I trashed that VM because I wasn’t sure if I had done something irredeemable during my trial and errors of throwing commands. I had successfully made it to the reboot but I wasn’t sure if it worked so I started over. 
## VM Modifications