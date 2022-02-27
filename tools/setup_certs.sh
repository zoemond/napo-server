#!/bin/sh
TOPDIR=$(cd $(dirname $0)/../; pwd)
WORKDIR=$TOPDIR/docker/psql/certs
rm -fr $WORKDIR
mkdir $WORKDIR
openssl req -new -text -passout pass:abcd -subj /CN=localhost -out $WORKDIR/server.req -keyout $WORKDIR/privkey.pem
openssl rsa -in $WORKDIR/privkey.pem -passin pass:abcd -out $WORKDIR/server.key
openssl req -x509 -in $WORKDIR/server.req -text -key $WORKDIR/server.key -out $WORKDIR/server.crt
chmod 600 $WORKDIR/server.key
test $(uname -s) = Linux && chown 70 $WORKDIR/server.key
