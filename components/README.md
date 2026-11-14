# UI Components Directory

This directory is reserved for reusable frontend React UI components.

## Guidelines
- Strict separation between presentation and backend data layer.
- Client components should communicate with `/app/api/*` endpoints or server actions.
- Do not import `@/lib/db` directly inside client components.
