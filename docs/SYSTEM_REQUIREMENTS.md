# 📑 System Requirements - Torii Nihongo Project

This document defines the system requirements necessary to support the Torii Nihongo application, including hardware, software, and infrastructure configurations for end-users, developers, and production environments.

---

## 2. Installation Guides
### 2.1 System Requirements

#### 2.1.1 Hardware Requirements

##### 🌐 Web Application (Student Learner & Admin Dashboard)
| Component | Minimum | Recommended |
| :--- | :--- | :--- |
| **Device** | PC / Laptop / Tablet | PC / Laptop |
| **Internet Connection** | Cable, Wi-Fi (4 Mbps) | Fiber Optic, Wi-Fi (10 Mbps+) |
| **Processor** | Intel Core i3 1.4Ghz or equivalent | Intel Core i7 2.5Ghz / Apple M1 or above |
| **Memory** | 4GB RAM | 8GB RAM or more |
| **Storage** | 200MB (Browser Cache) | 500MB |
| **Web Browser** | Chrome (v80+), Edge (v80+) | Latest Stable Chrome / Edge / Firefox |

> [!IMPORTANT]
> Since the application uses WebRTC (LiveKit) for live classes, a working **Microphone** and **Camera** are mandatory.

##### 📱 Mobile Application (Student App)
| Component | Minimum | Recommended |
| :--- | :--- | :--- |
| **Device** | Smartphone / Tablet | iPhone 11+ / Mid-range Android (2021+) |
| **Processor** | Quad-core 1.5 GHz | Octa-core 2.0 GHz+ |
| **Memory** | 2GB RAM | 4GB RAM or more |
| **Storage** | 150MB free space | 500MB free space |
| **OS (Android)** | Android 6.0 (Marshmallow) | Android 11.0 or above |
| **OS (iOS)** | iOS 13.0 | iOS 15.0 or above |

---

#### 2.1.2 Software Requirements (Development & Infrastructure)

| Component | Name and Version | Description |
| :--- | :--- | :--- |
| **Operating System** | Windows 10/11, macOS, Linux (Ubuntu 22.04+) | Base OS for local development and production hosting. |
| **Runtime Environment** | Node.js v20+ (LTS), pnpm 8/9+ | Required to host NestJS backend services and Next.js/Vite frontends. |
| **DBMS** | PostgreSQL 16+, Prisma | Primary relational database for all microservices (Identity, Academy, etc.). |
| **Cache & Broker** | Redis 7+, NATS Server 2.12+ | In-memory key-value store for caching and NATS JetStream for inter-service messaging. |
| **Inter-service Protocol**| Protobuf (Protocol Buffers) | Used for high-performance communication between microservices. |
| **Media Server** | LiveKit Server v1.9+, Ingress v1.4+ | Real-time audio/video infrastructure for WebRTC live classes. |
| **Containerization** | Docker v24+, Docker Compose v2.20+ | Orchestrates infrastructure components (DB, Redis, NATS, LiveKit) in isolated containers. |
| **Reverse Proxy** | Nginx (Latest Stable) | Handles SSL termination, load balancing, and routing to the API Gateway. |
| **AI Integration** | Google Gemini API (Flash/Pro) | Powers the AI Sensei Tutor and Voice Agent functionalities. |
| **Monorepo Tooling** | Turborepo | Manages build pipelines and caching for the monorepo structure. |
| **IDE** | Visual Studio Code / Cursor | Recommended IDE with specialized extensions for Flutter and NestJS. |
| **Mobile Framework** | Flutter 3.10.x | Framework used to build and compile the mobile application for iOS/Android. |

---

### 2.1.3 Relevant Configurations

1.  **Network Configuration:**
    *   **Ports:** Ensure ports `7880` (HTTP), `7881` (TCP), and `7882` (UDP) are open for LiveKit.
    *   **STUN/TURN:** For restrictive networks (4G/LTE/Corporate Firewalls), a STUN/TURN server must be configured to relay WebRTC media.
2.  **SSL/TLS:**
    *   Development: Local certs or plain HTTP.
    *   Production: **HTTPS is strictly required** for WebRTC (Camera/Mic) and AI Voice Agent access.
3.  **Environment Variables:**
    *   Must configure `.env` with valid `DATABASE_URL`, `NATS_URL`, `LIVEKIT_API_KEY`, and `GEMINI_API_KEY`.
