#!/bin/sh
echo 0 > /proc/sys/net/ipv6/conf/all/disable_ipv6
ip rule add from 44.131.14.53/32 lookup 20
ip -6 rule add from 2a06:8187:fe19::53/128 lookup 20
ip -6 rule add lookup 20
ip addr add 44.131.14.53/32 dev lo
ip addr add 2a06:8187:fe19::53/128 dev lo
ip route add 2a06:8187:fe19::53/128 dev lo table 20 prio 0
ip route add 44.131.14.53/32 dev lo table 20
megalan DEBUG=0 PORT="53535" PASSWORD="AS206671" FILE="/etc/megalan.db" NIC="backbone" RT="20" HOST="44.131.14.255" HOST="44.131.14.0" HOST="199.247.29.154" HOST="78.141.195.79" HOST="108.61.245.199" &
sleep 1
pdns_server &
npm start