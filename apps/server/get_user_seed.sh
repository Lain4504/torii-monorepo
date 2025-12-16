#!/bin/bash

echo "=========================================="
echo "🔍 Getting User Seed for auth-service"
echo "=========================================="
echo ""

USER_PUBLIC_KEY="UDYEW2MZL77X2DBXBOZF2XPD3ENQWALQRXPOKYQ2PFZIW2TDAPLJEH4C"
USER_FILE="/nsc/nkeys/keys/U/DY/${USER_PUBLIC_KEY}.nk"

if [ -f "$USER_FILE" ]; then
    echo "✅ Found user seed file!"
    echo ""
    echo "User: auth-service"
    echo "Public Key: $USER_PUBLIC_KEY"
    echo ""
    echo "Seed (copy this to .env as NATS_NKEY_SEED):"
    echo "-------------------------------------------"
    cat "$USER_FILE"
    echo ""
    echo "-------------------------------------------"
    echo ""
    echo "✅ Copy the seed above to your .env file:"
    echo "   NATS_NKEY_SEED=<paste here>"
else
    echo "❌ User seed file not found at: $USER_FILE"
    echo ""
    echo "Checking .creds file instead..."
    CREDS_FILE="/nsc/nkeys/creds/MYOP/PNM/auth-service.creds"
    
    if [ -f "$CREDS_FILE" ]; then
        echo "✅ Found .creds file!"
        echo ""
        echo "Looking for seed (line starting with SU...):"
        echo "-------------------------------------------"
        grep "^SU" "$CREDS_FILE" || echo "❌ Seed not found in .creds file"
        echo "-------------------------------------------"
    else
        echo "❌ .creds file not found at: $CREDS_FILE"
        echo ""
        echo "Please run: nsc add user auth-service -a PNM"
    fi
fi

echo ""
echo "=========================================="
