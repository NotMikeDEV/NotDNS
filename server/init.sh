#!/bin/sh
mkdir -p /data/public
caddy start --config /etc/caddy/Caddyfile
rsync -v --daemon --no-detach --config=/etc/rsyncd.conf &
( cd /opt/www/ && npm start ) &
sleep 1
pdns_server &
chmod 0777 /data -R
while true; do sleep 600; done
