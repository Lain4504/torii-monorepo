# 🔑 NATS Authentication Configuration Guide

## ⚠️ CRITICAL: Account-Based Authentication

Your NATS server is configured with **Account-based Auth Callout**. You MUST use the correct key types.

---

## 📋 Required Environment Variables

Add these to your `.env` file:

```bash
################################
# NATS ACCOUNT AUTHENTICATION
################################

# 🔥 ACCOUNT SEED (MUST start with SA...)
# This is used to SIGN User JWTs
# Public key MUST match nats_server.conf auth_callout.issuer
NATS_ACCOUNT_SEED=SAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 🔐 XKEY SEED (for encryption, starts with SX...)
NATS_XKEY_SEED=SXAMBYY64TKXZCLFQGWDATGPIPURA4SIV3GDCSGG7A74USK6XDO6WQTIUU

# 👤 USER NKEY SEED (for auth service connection, starts with SU...)
# This user must be in nats_server.conf auth_users list
NATS_NKEY_SEED=SUABC...
```

---

## 🔍 How to Generate Keys

### Option 1: Using `nsc` CLI (Recommended)

```bash
# Install nsc
go install github.com/nats-io/nsc/v2@latest

# Create Operator
nsc add operator -n MyOperator

# Create Account
nsc add account -n PNM

# Generate Account Seed
nsc describe account PNM --json | jq -r '.nkey'
# Output: SAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Get Account Public Key
nsc describe account PNM --json | jq -r '.sub'
# Output: ADQJVKRRWCBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option 2: Using Node.js

```javascript
const { nkeys } = require('nats');

// Generate Account Key
const accountKp = nkeys.createAccount();
console.log('Account Seed:', accountKp.getSeed().toString());
console.log('Account Public:', accountKp.getPublicKey());

// Generate XKey
const xkeyKp = nkeys.createCurveKeys();
console.log('XKey Seed:', xkeyKp.getSeed().toString());
console.log('XKey Public:', xkeyKp.getPublicKey());

// Generate User NKey
const userKp = nkeys.createUser();
console.log('User Seed:', userKp.getSeed().toString());
console.log('User Public:', userKp.getPublicKey());
```

---

## ✅ Verification Checklist

### 1. Check Account Public Key Match

Run this script to verify your Account Seed matches the config:

```javascript
const { nkeys } = require('nats');

const accountSeed = 'SAxxxx...'; // From NATS_ACCOUNT_SEED
const expectedPublic = 'ADQJVKRRWCB32QRIR6OL6WDSTOK6VLZCLI7Z3WGZWJCP2UFH4EXLHHJ6'; // From nats_server.conf

const kp = nkeys.fromSeed(Buffer.from(accountSeed));
const actualPublic = kp.getPublicKey();

console.log('Expected:', expectedPublic);
console.log('Actual:  ', actualPublic);
console.log('Match:', actualPublic === expectedPublic ? '✅ YES' : '❌ NO');
```

### 2. Verify nats_server.conf

```conf
authorization {
  auth_callout {
    # ✅ This MUST match your Account Public Key
    issuer: ADQJVKRRWCB32QRIR6OL6WDSTOK6VLZCLI7Z3WGZWJCP2UFH4EXLHHJ6
    
    # ✅ This MUST include your User NKey Public
    auth_users: [ UD4JADBMDSQCA5D475KSMFV43TAINASJ3TIEFQ7LP43XENPMQYFTRFKP ]
    
    # ✅ Account name
    account: PNM
    
    # ✅ XKey Public (from NATS_XKEY_SEED)
    xkey: XAVXJLXWZR7W24SAOPN6YATDOF2B6URA4GMBKYM7SBQIFO4O6OLQKSZB
  }
}
```

---

## ❌ Common Mistakes

### 🚫 DO NOT USE:

1. **Operator Seed (SO...)** - This is for cluster management, NOT for signing User JWTs
2. **User Seed (SU...)** - This is for client connection, NOT for signing JWTs
3. **Public Key (AD...)** - You cannot sign with a public key
4. **Random Private Key** - Must be a valid NATS Account Seed

### ✅ MUST USE:

- **Account Seed (SA...)** - For signing User JWTs in Auth Callout response

---

## 🔄 Key Hierarchy

```
Operator (SO...)
  └─ Account (SA...) ← USE THIS for signing User JWTs
       └─ User (SU...) ← For client connection only
```

---

## 🧪 Testing

After updating `.env`, restart your server and check logs:

```bash
pnpm start
```

Look for:
```
✅ NATS Account Public Key: ADQJVKRRWCB32QRIR6OL6WDSTOK6VLZCLI7Z3WGZWJCP2UFH4EXLHHJ6
⚠️  Verify this matches nats_server.conf auth_callout.issuer
```

If you see this, your Account Seed is correct!

---

## 📚 References

- [NATS Auth Callout Documentation](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_callout)
- [NATS JWT Documentation](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/jwt)
- [PlugNmeet Server Reference](https://github.com/mynaparrot/plugNmeet-server)
