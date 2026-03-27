import type { FastifyInstance } from "fastify"
import { addClient, removeClient } from "../services/connections.js"
import type { JwtPayload } from "../types/ws.js"

export async function wsRoute(app: FastifyInstance) {
  app.get("/ws", { websocket: true }, (socket, req) => {
    const token =
      (req.query as Record<string, string>).token ??
      req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      socket.send(JSON.stringify({ type: "error", data: { message: "Token required" } }))
      socket.close(4001, "Token required")
      return
    }

    let user: JwtPayload
    try {
      user = app.jwt.verify<JwtPayload>(token)
    } catch {
      socket.send(JSON.stringify({ type: "error", data: { message: "Invalid token" } }))
      socket.close(4003, "Invalid token")
      return
    }

    addClient(user.id, socket)

    socket.send(JSON.stringify({ id: user.id, type: "connected", data: { userId: user.id } }))

    socket.on("message", (raw: any) => {
      // ping/pong ou futuro: client pode mandar mensagens
      const msg = raw.toString()
      if (msg === "ping") {
        socket.send("pong")
      }
    })

    socket.on("close", () => {
      removeClient(user.id, socket)
    })
  })
}
