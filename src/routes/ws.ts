import type { FastifyInstance } from "fastify"
import { addClient, removeClient } from "../services/connections.js"
import type { JwtPayload } from "../types/ws.js"

export async function wsRoute(app: FastifyInstance) {
  app.get("/ws", { websocket: true }, async (socket, req) => {
    const token =
      (req.query as Record<string, string>).token 

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

    const user_id = user.sub as string

    addClient(user_id, socket)

    socket.send(JSON.stringify({ id: user_id, type: "connected", data: { userId: user_id } }))

    socket.on("close", () => {
      removeClient(user_id, socket)
    })
  })
}
