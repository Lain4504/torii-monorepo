#!/bin/bash

# ==============================================================================
# Torii LiveKit Cert Sync Script
# Description: Syncs Let's Encrypt certs to project folder for Docker access.
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERTS_DIR="$PROJECT_ROOT/certs"
DOMAIN="api.torii.sbs"

echo "Starting SSL certificate sync for LiveKit..."

# 1. Create certs directory if not exists
mkdir -p "$CERTS_DIR"

# 2. Copy certificates from Let's Encrypt
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "Copying certificates for $DOMAIN..."
    sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$CERTS_DIR/"
    sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$CERTS_DIR/"
    
    # 3. Set proper permissions
    sudo chown -R $USER:$USER "$CERTS_DIR"
    chmod 644 "$CERTS_DIR/fullchain.pem"
    chmod 644 "$CERTS_DIR/privkey.pem"
    
    echo "Certificates synced successfully to $CERTS_DIR"
    
    # 4. Restart LiveKit to pick up changes
    echo "Restarting LiveKit container..."
    sudo docker compose up -d --force-recreate livekit
else
    echo "Error: Certificate directory for $DOMAIN not found at /etc/letsencrypt/live/"
    exit 1
fi

echo "Done!"
