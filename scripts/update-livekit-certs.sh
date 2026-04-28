#!/bin/bash

# ==============================================================================
# Torii LiveKit Cert Sync Script
# Description: Syncs Let's Encrypt certs to project folder for Docker access.
# Supports single domain or dedicated TURN domain.
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERTS_DIR="$PROJECT_ROOT/certs"
API_DOMAIN="api.torii.sbs"
TURN_DOMAIN="turn.torii.sbs"

echo "Starting SSL certificate sync for LiveKit..."

# 1. Create certs directory if not exists
mkdir -p "$CERTS_DIR"

# 2. Determine which cert to use
# Priority:
# 1. Dedicated TURN domain cert
# 2. Main API domain cert
if [ -d "/etc/letsencrypt/live/$TURN_DOMAIN" ]; then
    SELECTED_DOMAIN="$TURN_DOMAIN"
    echo "Found dedicated TURN domain cert: $TURN_DOMAIN"
elif [ -d "/etc/letsencrypt/live/$API_DOMAIN" ]; then
    SELECTED_DOMAIN="$API_DOMAIN"
    echo "Using main API domain cert: $API_DOMAIN"
else
    echo "ERROR: No SSL certificates found in /etc/letsencrypt/live/ for $API_DOMAIN or $TURN_DOMAIN"
    echo "Please run Certbot first to generate certificates."
    exit 1
fi

# 3. Copy certificates
# Using -L to follow symlinks from Let's Encrypt (CRITICAL for Docker volumes)
echo "Copying certificates from /etc/letsencrypt/live/$SELECTED_DOMAIN..."
sudo cp -L "/etc/letsencrypt/live/$SELECTED_DOMAIN/fullchain.pem" "$CERTS_DIR/fullchain.pem"
sudo cp -L "/etc/letsencrypt/live/$SELECTED_DOMAIN/privkey.pem" "$CERTS_DIR/privkey.pem"

# 4. Set proper permissions for Docker
sudo chmod 644 "$CERTS_DIR/fullchain.pem"
sudo chmod 644 "$CERTS_DIR/privkey.pem"
sudo chown $USER:$USER "$CERTS_DIR/fullchain.pem" "$CERTS_DIR/privkey.pem"

echo "Success! Certificates synced to $CERTS_DIR"
ls -l "$CERTS_DIR"

# 5. Restart LiveKit to pick up changes
echo "Restarting LiveKit container..."
sudo docker compose up -d --force-recreate livekit

echo "Done!"
