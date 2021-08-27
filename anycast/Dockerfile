FROM debian:stable-slim
RUN apt-get update && apt-get install -y wget && wget -O/dev/stdout https://deb.nodesource.com/setup_16.x | bash
RUN apt-get update ; apt-get install -y build-essential git wget pdns-backend-remote nodejs rsync nginx iproute2
RUN cd /tmp && wget https://dl.google.com/go/go1.16.5.linux-amd64.tar.gz && tar -xf go1.16.5.linux-amd64.tar.gz && \
    git clone https://github.com/NotMikeDEV/MegaLAN3.git && cd MegaLAN3 && GOROOT=/tmp/go GOCACHE=/tmp/go/.cache GOPATH=/tmp/go PATH=/tmp/go/bin:$PATH make install && rm -rf /tmp/go /tmp/go1.16.5.linux-amd64.tar.gz
WORKDIR /opt/anycast
RUN mkdir -p /data/public
COPY package.json .
RUN npm install
COPY tsconfig.json .
COPY src ./src/
RUN npm run build
COPY pdns.conf /etc/powerdns/pdns.conf
COPY init.sh .
CMD [ "./init.sh" ]