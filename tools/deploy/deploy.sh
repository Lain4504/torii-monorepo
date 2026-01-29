#!/bin/bash

# ==============================================================================
# Torii Meet Deployment Script
# Description: Automates the deployment of LiveKit + Meet TS Server with TURN
# ==============================================================================

set -e

# Configuration
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONOREPO_ROOT="$(cd "$DEPLOY_DIR/../.." && pwd)"
OUTPUT_DIR="$DEPLOY_DIR/output"
SSL_DIR="$OUTPUT_DIR/ssl"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Torii Meet Deployment...${NC}"

# 1. Check Prerequisites
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo -e "${RED}pnpm is required but not installed. Aborting.${NC}" >&2; exit 1; }

# 2. Gather Configuration
if [ -f "$MONOREPO_ROOT/.env" ]; then
    source "$MONOREPO_ROOT/.env"
fi

DEFAULT_DOMAIN=${DOMAIN:-"meet.torii.edu"}
DEFAULT_IP=${EXTERNAL_IP:-"127.0.0.1"}
DEFAULT_LK_KEY=${LIVEKIT_API_KEY:-"API$(openssl rand -hex 6)"}
DEFAULT_LK_SECRET=${LIVEKIT_API_SECRET:-"$(openssl rand -hex 20)"}

read -p "Enter public domain (default: $DEFAULT_DOMAIN): " DOMAIN
DOMAIN=${DOMAIN:-$DEFAULT_DOMAIN}

read -p "Enter server external IP (default: $DEFAULT_IP): " EXTERNAL_IP
EXTERNAL_IP=${EXTERNAL_IP:-$DEFAULT_IP}

read -p "Enter LiveKit API Key (default: $DEFAULT_LK_KEY): " LIVEKIT_API_KEY
LIVEKIT_API_KEY=${LIVEKIT_API_KEY:-$DEFAULT_LK_KEY}

read -p "Enter LiveKit API Secret (default: $DEFAULT_LK_SECRET): " LIVEKIT_API_SECRET
LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET:-$DEFAULT_LK_SECRET}

# 3. Preparation
mkdir -p "$OUTPUT_DIR"
mkdir -p "$SSL_DIR"

# 4. Generate SSL (Self-signed for now, use Certbot in production)
if [ ! -f "$SSL_DIR/server.pem" ]; then
    echo -e "${YELLOW}Generating self-signed SSL certificate for $DOMAIN...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/server.key" \
        -out "$SSL_DIR/server.crt" \
        -subj "/C=US/ST=State/L=City/O=Torii/OU=Meet/CN=$DOMAIN"
    
    # HAProxy expects combined PEM
    cat "$SSL_DIR/server.crt" "$SSL_DIR/server.key" > "$SSL_DIR/server.pem"
fi

# 5. Generate Config Files from Templates
echo -e "${YELLOW}Generating configuration files...${NC}"

sed -e "s/{{DOMAIN}}/$DOMAIN/g" \
    -e "s/{{LIVEKIT_API_KEY}}/$LIVEKIT_API_KEY/g" \
    -e "s/{{LIVEKIT_API_SECRET}}/$LIVEKIT_API_SECRET/g" \
    "$DEPLOY_DIR/livekit.template.yaml" > "$OUTPUT_DIR/livekit.yaml"

sed -e "s/{{DOMAIN}}/$DOMAIN/g" \
    "$DEPLOY_DIR/haproxy.template.cfg" > "$OUTPUT_DIR/haproxy.cfg"

# For docker-compose, we use a fixed image name for this deployment
DOCKER_IMAGE="torii-server-prod"
DATABASE_URL_VAL=${DATABASE_URL:-"postgresql://postgres:postgres@db:5432/torii"}

sed -e "s/{{DOMAIN}}/$DOMAIN/g" \
    -e "s/{{LIVEKIT_API_KEY}}/$LIVEKIT_API_KEY/g" \
    -e "s/{{LIVEKIT_API_SECRET}}/$LIVEKIT_API_SECRET/g" \
    -e "s/{{DOCKER_IMAGE}}/$DOCKER_IMAGE/g" \
    -e "s|{{DATABASE_URL}}|$DATABASE_URL_VAL|g" \
    "$DEPLOY_DIR/docker-compose.deploy.template.yaml" > "$OUTPUT_DIR/docker-compose.yaml"

# 6. Build Docker Image
echo -e "${YELLOW}Building Torii Server Docker image...${NC}"
docker build -t "$DOCKER_IMAGE" -f "$MONOREPO_ROOT/apps/server/Dockerfile" "$MONOREPO_ROOT"

# 7. Deployment
echo -e "${GREEN}Deploying stack via Docker Compose...${NC}"
cd "$OUTPUT_DIR"
docker compose up -d

echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "LiveKit URL: wss://$DOMAIN/livekit"
echo -e "Meet API:    https://$DOMAIN"
echo -e "TURN Status: Enabled on 443 (TCP) and 5349 (TLS)"
echo -e "${YELLOW}Note: If using self-signed certs, you must accept them in your browser.${NC}"
echo -e "${GREEN}==================================================================${NC}"
