#!/usr/bin/env bash
#
# Local HTTPS for testing on a phone (push notifications, service worker and
# other secure-context APIs do not work over plain http on a LAN address).
#
# Creates, with openssl only, in ./certificates (git-ignored):
#   ozone-dev-ca.key / .crt   a private certificate authority for this machine
#   dev-key.pem / dev-cert.pem a server certificate for localhost and this
#                              machine's LAN addresses, signed by that CA
#   ca-public/ozone-dev-ca.crt the CA certificate alone, to install on a phone
#
# Re-running is safe: the CA is kept; the server certificate is recreated
# when the LAN addresses change or it is about to expire. Private keys are
# readable by the owner only and are never printed. Trust the CA only on
# your own devices, and never share its key.
set -euo pipefail

cd "$(dirname "$0")/.."
DIR=certificates
CA_KEY="$DIR/ozone-dev-ca.key"
CA_CERT="$DIR/ozone-dev-ca.crt"
KEY="$DIR/dev-key.pem"
CERT="$DIR/dev-cert.pem"
SANS_FILE="$DIR/dev-cert.sans"
PUBLIC_DIR="$DIR/ca-public"

umask 077
mkdir -p "$DIR" "$PUBLIC_DIR"

if [[ ! -s "$CA_KEY" || ! -s "$CA_CERT" ]]; then
  echo "Creating the local certificate authority…"
  openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out "$CA_KEY" 2>/dev/null
  openssl req -x509 -new -key "$CA_KEY" -sha256 -days 3650 \
    -subj "/O=Ozone development/CN=Ozone dev CA ($(hostname))" \
    -addext "basicConstraints=critical,CA:TRUE,pathlen:0" \
    -addext "keyUsage=critical,keyCertSign,cRLSign" \
    -addext "subjectKeyIdentifier=hash" \
    -out "$CA_CERT"
  rm -f "$CERT" # a new CA invalidates the old server certificate
fi

# localhost plus every IPv4 address of this machine.
sans="DNS:localhost,IP:127.0.0.1,IP:::1"
for ip in $(hostname -I); do
  [[ "$ip" == *.*.*.* ]] && sans+=",IP:$ip"
done

needs_cert=false
if [[ ! -s "$CERT" || ! -s "$KEY" ]] || [[ "$(cat "$SANS_FILE" 2>/dev/null)" != "$sans" ]]; then
  needs_cert=true
elif ! openssl x509 -checkend $((30 * 24 * 3600)) -noout -in "$CERT" >/dev/null; then
  needs_cert=true
fi

if $needs_cert; then
  echo "Creating the server certificate…"
  openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out "$KEY" 2>/dev/null
  # 397 days: the longest validity Apple devices accept for TLS certificates.
  openssl req -new -key "$KEY" -subj "/O=Ozone development/CN=localhost" 2>/dev/null |
    openssl x509 -req -CA "$CA_CERT" -CAkey "$CA_KEY" -CAcreateserial \
      -days 397 -sha256 \
      -extfile <(printf '%s\n' \
        "basicConstraints=critical,CA:FALSE" \
        "keyUsage=critical,digitalSignature" \
        "extendedKeyUsage=serverAuth" \
        "subjectAltName=$sans" \
        "authorityKeyIdentifier=keyid") \
      -out "$CERT" 2>/dev/null
  printf '%s' "$sans" >"$SANS_FILE"
  rm -f "$DIR"/*.srl
fi

chmod 600 "$CA_KEY" "$KEY"
chmod 644 "$CA_CERT" "$CERT"
cp "$CA_CERT" "$PUBLIC_DIR/ozone-dev-ca.crt"
chmod 755 "$PUBLIC_DIR"
chmod 644 "$PUBLIC_DIR/ozone-dev-ca.crt"

echo "HTTPS ready for: ${sans//,/ }"
lan_ip=$(hostname -I | awk '{print $1}')
echo "Phone (once): run  python3 -m http.server 8099 -d $PUBLIC_DIR"
echo "  then open http://$lan_ip:8099/ozone-dev-ca.crt on the phone and install it."
