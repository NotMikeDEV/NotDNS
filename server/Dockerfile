FROM debian:stable-slim
RUN apt-get update && apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl wget && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | apt-key add - && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
RUN wget -O/dev/stdout https://deb.nodesource.com/setup_16.x | bash
RUN apt-get update && apt-get install -y nodejs caddy pdns-backend-remote rsync
ENV YARN_VERSION 1.22.5
RUN curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && mkdir -p /opt/yarn \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/yarn --strip-components=1 \
    && ln -s /opt/yarn/bin/yarn /usr/local/bin/yarn \
    && ln -s /opt/yarn/bin/yarn /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz
RUN mkdir -p /data/public
WORKDIR /opt/www
COPY www/package.json package.json
RUN npm install
COPY www ./
RUN npm run build
WORKDIR /opt/
COPY pdns.conf /etc/powerdns/pdns.conf
COPY rsyncd.conf /etc/rsyncd.conf
COPY Caddyfile /etc/caddy/Caddyfile
COPY init.sh .
CMD "./init.sh"