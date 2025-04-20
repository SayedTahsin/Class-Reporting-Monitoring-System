# React + Tanstack Router + Hono + Drizzle

This project was created with a modern TypeScript stack that combines React, TanStack Router, Hono, tRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Hono** - Lightweight, performant server framework
- **tRPC** - End-to-end type-safe APIs
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **SQLite/Turso** - Database engine
- **Authentication** - Email & password authentication with Better Auth
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. Start the local SQLite database:

```bash
cd apps/server && bun db:local
```

2. Update your `.env` file in the `apps/server` directory with the appropriate connection details if needed.

3. Apply the schema to your database:

```bash
bun db:push
```

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.

The API is running at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env` file in both **apps/server** and **apps/web** before starting the app. Below are working examples for local development.

### Backend (`apps/server/.env`)

```env
CORS_ORIGIN=http://localhost:3001
# Generate a fresh 32‑byte secret for production (see next section)
BETTER_AUTH_SECRET=kgQjeoklizgXI6FdfANg9VNse0m0ma9E
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=file:./local.db
```

### Frontend (`apps/web/.env`)

```env
VITE_SERVER_URL=http://localhost:3000
```

### Generating a secure `BETTER_AUTH_SECRET`

Generate a cryptographically‑secure secret with **OpenSSL**:

```bash
# 32‑byte base64 string (recommended length for production)
openssl rand -base64 32
```

Copy the output and paste it into the `BETTER_AUTH_SECRET` entry in your backend `.env` file.

> **Tip:** Regenerate the secret when deploying to a different environment (staging, production, etc.) to isolate sessions across environments.

## Project Structure

```
react-tanstack-router-hono-drizzle/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono, tRPC)
```

## Available Scripts

- `bun dev`: Start all applications in development mode
- `bun build`: Build all applications
- `bun dev:web`: Start only the web application
- `bun dev:server`: Start only the server
- `bun check-types`: Check TypeScript types across all apps
- `bun db:push`: Push schema changes to database
- `bun db:studio`: Open database studio UI
- `cd apps/server && bun db:local`: Start the local SQLite database
- `bun check`: Run Biome formatting and linting
