#!/bin/bash

# ==============================================================================
# Torii Meet Deployment & Setup Script (V3 - Monorepo Root Integration)
# Description: Prepares root config files and allows manual deploy.
# Compatible with GitHub Action CI/CD.
# ==============================================================================

set -e

# Configuration
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONOREPO_ROOT="$(cd "$DEPLOY_DIR/../.." && pwd)"
SSL_DIR="$MONOREPO_ROOT/ssl"

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${GREEN}Starting Torii Monorepo Deployment Setup...${NC}"

# 1. Extract settings safely from .env
if [ -f "$MONOREPO_ROOT/.env" ]; then
    get_env_val() {
        grep "^$1=" "$MONOREPO_ROOT/.env" | head -n 1 | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//' -e 's/ #.*$//' -e 's/ *$//'
    }
    ENV_DOMAIN=$(get_env_val "DOMAIN")
    ENV_IP=$(get_env_val "EXTERNAL_IP")
    ENV_LK_KEY=$(get_env_val "LIVEKIT_API_KEY")
    ENV_LK_SECRET=$(get_env_val "LIVEKIT_API_SECRET")
fi

DOMAIN=${ENV_DOMAIN:-"api.torii.sbs"}
EXTERNAL_IP=${ENV_IP:-"127.0.0.1"}

echo -e "${YELLOW}Current Configuration:${NC}"
echo -e "  Domain: $DOMAIN"
echo -e "  IP:     $EXTERNAL_IP"
read -p "Press Enter to use these or Ctrl+C to stop and edit .env"

# 2. Handle SSL (Let's Encrypt support)
mkdir -p "$SSL_DIR"
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    read -p "SSL found for $DOMAIN. Use Let's Encrypt? (y/n): " USE_LE
    if [[ "$USE_LE" =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}Combining Let's Encrypt certs into root SSL folder...${NC}"
        sudo sh -c "cat /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/letsencrypt/live/$DOMAIN/privkey.pem > $SSL_DIR/server.pem"
        sudo chown $USER:$USER "$SSL_DIR/server.pem"
    fi
fi

if [ ! -f "$SSL_DIR/server.pem" ]; then
    echo -e "${YELLOW}Generating self-signed SSL...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "$SSL_DIR/server.key" -out "$SSL_DIR/server.crt" -subj "/CN=$DOMAIN"
    cat "$SSL_DIR/server.crt" "$SSL_DIR/server.key" > "$SSL_DIR/server.pem"
fi

# 3. Generate Root Config Files
echo -e "${YELLOW}Generating config files in monorepo root...${NC}"

sed -e "s/{{DOMAIN}}/$DOMAIN/g" -e "s/{{LIVEKIT_API_KEY}}/${ENV_LK_KEY:-key}/g" -e "s/{{LIVEKIT_API_SECRET}}/${ENV_LK_SECRET:-secret}/g" \
    "$DEPLOY_DIR/livekit.template.yaml" > "$MONOREPO_ROOT/livekit.yaml"

sed -e "s/{{DOMAIN}}/$DOMAIN/g" "$DEPLOY_DIR/haproxy.template.cfg" > "$MONOREPO_ROOT/haproxy.cfg"

# 4. Manual Deploy Option
read -p "Setup complete. Do you want to run 'docker compose up -d' now? (y/n): " RUN_DEPLOY
if [[ "$RUN_DEPLOY" =~ ^[Yy]$ ]]; then
    cd "$MONOREPO_ROOT"
    # Ensure Docker Hub login if needed (for images built by GitHub Action)
    echo -e "${YELLOW}Pulling latest images from Docker Hub...${NC}"
    docker compose pull gateway identity learning meet agents gamification communication storage billing || true
    echo -e "${GREEN}Launching stack...${NC}"
    docker compose up -d
fi

echo -e "${GREEN}==================================================================${NC}"
echo -e "Success! Configuration is ready in the root directory."
echo -e "GitHub Actions will use these files on the next push."
echo -e "==================================================================${NC}"
