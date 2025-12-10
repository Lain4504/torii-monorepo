# Shared library (server)

- Place cross-cutting helpers, DTOs, filters, guards, interceptors, and utilities that need to be reused across Nest services.
- Keep dependencies minimal and framework-agnostic where possible.
- Consider subfolders by concern (e.g., `logging`, `validation`, `http`, `messaging`).
- Export from `src/index.ts` when you start adding code.

