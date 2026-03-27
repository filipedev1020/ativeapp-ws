import "dotenv/config"
import Fastify from "fastify"
import websocket from "@fastify/websocket"
import jwt from "@fastify/jwt"
import { wsRoute } from "./routes/ws.js"
import { apiRoutes } from "./routes/api.js"

const app = Fastify({ logger: true })

await app.register(jwt, {
  secret: process.env.JWT_SECRET!,
})

await app.register(websocket)

// WebSocket — clientes conectam aqui com token
await app.register(wsRoute)

// API HTTP — sua API principal envia POSTs aqui
await app.register(apiRoutes, { prefix: "/api" })

// Health check
app.get("/health", async () => ({ status: "ok" }))

const port = Number(process.env.PORT) || 3001
app.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
