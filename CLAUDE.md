# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebSocket relay/message broker server built with Fastify 5 and TypeScript. It manages authenticated WebSocket connections from clients (JWT) and exposes an HTTP API (API key auth) for sending targeted or broadcast messages to connected users.

## Commands

```bash
npm run dev      # Start dev server with tsx watch (hot reload)
npm run build    # Compile TypeScript → dist/
npm start        # Run compiled dist/server.js
```

No test runner or linter is configured.

## Architecture

- **Entry point**: `src/server.ts` — registers Fastify plugins (JWT, WebSocket) and routes
- **WebSocket route** (`src/routes/ws.ts`): clients connect at `/ws` with JWT auth; handles ping/pong keep-alive
- **HTTP API routes** (`src/routes/api.ts`): `POST /api/send` (targeted), `POST /api/broadcast`, `GET /api/online`, `GET /health` — all protected by API key header
- **Connection manager** (`src/services/connections.ts`): tracks userId → Set\<WebSocket\> (supports multiple connections per user), handles send/broadcast/cleanup
- **Types** (`src/types/ws.ts`): shared interfaces (WsEvent, WsSendPayload, WsBroadcastPayload, JwtPayload)

## Environment

Requires `.env` file (see `.env.example`): `PORT`, `JWT_SECRET`, `API_KEY`.

## Tech Stack

ES Modules (`"type": "module"`), TypeScript with strict mode targeting ES2022, module resolution set to `bundler`.
