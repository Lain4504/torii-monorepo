# Environment Variables Guide

## 🌍 Required Environment Variables

After migrating from TCP to NATS, here's what you need:

---

## ✅ NATS Microservices (No Ports Needed!)

With NATS, microservices **DO NOT need individual ports**. They all connect to a single NATS server.

### Required Variables:

```bash
# NATS Server Connection
NATS_URL=nats://localhost:4222

# Optional: NATS Authentication (for production)
NATS_NKEY_SEED=your-nkey-seed-here

# NATS WebSocket URL (for client connections via browser)
NATS_WS_URL=ws://localhost:8222
```

---

## ✅ Services That Still Need Ports

Only **Gateway** (HTTP API server) needs a port:

### 1. Gateway (HTTP API Server)
```bash
GATEWAY_PORT=8080  # Default: 8080
```

**ALL microservices use NATS - NO ports needed!** 🎉

---

## ❌ **DEPRECATED** - No Longer Needed

These variables were for TCP transport and are **NO LONGER USED**:

```bash
# ❌ REMOVED - Auth Service (now uses NATS, no port needed)
AUTH_HOST=127.0.0.1
AUTH_PORT=8081

# ❌ REMOVED - Course Service (now uses NATS, no port needed)
COURSE_HOST=127.0.0.1
COURSE_PORT=8082

# ❌ REMOVED - AI Service (now uses NATS, no port needed)
AI_HOST=127.0.0.1
AI_PORT=8086

# ❌ REMOVED - Assessment Service (now uses NATS, no port needed)
ASSESSMENT_HOST=127.0.0.1
ASSESSMENT_PORT=8084

# ❌ REMOVED - Payment Service (now uses NATS, no port needed)
PAYMENT_HOST=127.0.0.1
PAYMENT_PORT=8085

# ❌ REMOVED - Notification Service (now uses NATS, no port needed)
NOTIFICATION_HOST=127.0.0.1
NOTIFICATION_PORT=8087
```

**You can safely DELETE these from your `.env` file!**

---

## 📋 Complete `.env` Template

Here's your clean, minimal `.env` file:

```bash
# ============================================
# NATS Configuration
# ============================================
NATS_URL=nats://localhost:4222
NATS_WS_URL=ws://localhost:8222

# Optional: Uncomment for production with NKEY auth
# NATS_NKEY_SEED=SUACIGT...your-seed-here

# ============================================
# HTTP Services (with ports)
# ============================================
GATEWAY_PORT=8080

# ============================================
# Database
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# ============================================
# Redis (for caching, not microservice transport)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# Supabase
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# ============================================
# LiveKit (for Room Service)
# ============================================
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_URL=ws://localhost:7880

# ============================================
# Other Services
# ============================================
NODE_ENV=development
JWT_SECRET=your-jwt-secret
```

---

## 🎯 Before vs After

### Before (TCP - Each Service Needs Port)
```
┌──────────┐ Port 8080
│ Gateway  │
└──────────┘

┌──────────┐ Port 8081
│  Auth    │
└──────────┘

┌──────────┐ Port 8082
│ Course   │
└──────────┘

... 8 different ports to manage! 😫
```

### After (NATS - No Ports Needed)
```
┌──────────┐ Port 8080 (HTTP only)
│ Gateway  │
└──────────┘

┌──────────┐ No port!
│  Auth    │───┐
└──────────┘   │
               │
┌──────────┐   ├──→ NATS (Port 4222)
│ Course   │───┤
└──────────┘   │
               │
┌──────────┐   │
│   AI     │───┘
└──────────┘

Only 1 NATS port! 🎉
```

---

## 🚀 How to Update

### Step 1: Clean Your `.env`

Remove all the deprecated `*_HOST` and `*_PORT` variables (except GATEWAY and ROOM).

### Step 2: Add NATS Variables

```bash
NATS_URL=nats://localhost:4222
NATS_WS_URL=ws://localhost:8222
```

### Step 3: Start NATS Server

```bash
docker run --name nats-server -p 4222:4222 -p 8222:8222 nats:latest
```

### Step 4: Start Your Services

```bash
npm run dev
```

All services will connect to NATS automatically - no port conflicts! ✅

---

## 💡 Benefits

1. **Less Configuration**: Only 1 NATS URL instead of 8 service ports
2. **No Port Conflicts**: Services don't bind to ports
3. **Easier Deployment**: Don't need to manage port mappings
4. **Better Scalability**: Can run multiple instances without port issues
5. **Cleaner `.env`**: From 20+ variables down to ~5 for microservices

---

## 🔒 Production Considerations

For production, add:

```bash
# NATS with authentication
NATS_URL=nats://your-nats-server.com:4222
NATS_NKEY_SEED=SUACIGT3AO...your-production-seed

# Use NATS cluster for high availability
NATS_URL=nats://server1:4222,nats://server2:4222,nats://server3:4222
```

---

## ✅ Verification

To verify your services are connected:

1. **Check NATS monitoring**: http://localhost:8222
2. **Test API endpoint**:
   ```bash
   curl http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"pass"}'
   ```

If it works, your microservices are communicating via NATS! 🎉

---

## 📝 Summary

| Variable Type | TCP (Old) | NATS (New) | Change |
|--------------|-----------|------------|--------|
| Service Ports | 8 variables | 0 variables | ❌ Removed |
| NATS Config | 0 variables | 1-2 variables | ✅ Added |
| HTTP Ports | 2 variables | 2 variables | ✅ Keep |
| **Total** | **10 vars** | **3-4 vars** | **70% reduction!** |

Much cleaner! 🎊
