# Ky9 Project

This is a monorepo project managed with TurboRepo, consisting of a NestJS backend (Microservices + Gateway) and a React frontend (Web Admin).

## Prerequisites
- Node.js (v20+)
- pnpm (v9+)
- Docker (for database/infrastructure if needed)

## Setup

1.  **Install Dependencies**
    ```bash
    pnpm install
    ```

2.  **Environment Variables**
    Ensure `.env` files are configured in `apps/server` and `apps/web-admin`.

## Quick Start (TurboRepo)

The easiest way to start the entire stack (Gateway, Microservices, Web Admin, Web Learner) is using TurboRepo from the root:

```bash
pnpm dev
```
This command runs `turbo dev`, which starts all applications in parallel.

## Project Structure

```
Ky9/
├── apps/
│   ├── server/           # NestJS Monolith (Gateway + Microservices)
│   │   ├── modules/
│   │   │   ├── gateway/         # API Gateway (REST + GraphQL)
│   │   │   ├── auth-service/    # Authentication Microservice
│   │   │   └── course-service/  # Course Microservice
│   │   └── libs/shared/         # Shared backend code (Interceptors, constants)
│   ├── web-admin/        # Vite + React Admin Dashboard
│   └── web-learner/      # Next.js Learner Platform
├── packages/
│   ├── data-access/      # Shared API Clients (Orval REST + Apollo GraphQL)
│   ├── eslint-config/    # Shared ESLint config
│   └── typescript-config/# Shared TS config
└── turbo.json            # TurboRepo configuration
```

## Running Individually

If you prefer to run specific parts of the stack:

### 1. Backend
```bash
cd apps/server
pnpm dev        # Runs Gateway + All Services
# OR
pnpm dev:gateway
pnpm dev:course
```

### 2. Web Admin
```bash
cd apps/web-admin
pnpm dev
# http://localhost:5173
```

### 3. Web Learner
```bash
cd apps/web-learner
pnpm dev
# http://localhost:3000
```

## Architecture Highlights

*   **REST API**: Exposed via Gateway, documented with Swagger (`http://localhost:8080/api/docs`).
*   **GraphQL**: Exposed via Gateway (`/graphql`).
*   **Shared Client**: REST API hooks are generated using Orval and located in `packages/data-access`.
    *   **Auth**: Auto-attaches `Authorization: Bearer <token>` from localStorage.
    *   **Response**: Automatically unwraps standard `ApiResponse` format.

## Development

### Regenerate REST Client
If you change the Backend API, regenerate the shared client:

```bash
pnpm --filter @workspace/data-access gen:api
```
