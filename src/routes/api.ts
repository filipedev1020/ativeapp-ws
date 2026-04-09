import type { FastifyInstance, FastifyRequest } from "fastify"
import {
  sendToUser,
  broadcast,
  getOnlineUsers,
  isOnline,
  getConnectionCount,
} from "../services/connections.js"
import type { WsSendPayload, WsBroadcastPayload } from "../types/ws.js"

function validateApiKey(req: FastifyRequest): boolean {
  const key = req.headers["x-api-key"]
  return key === process.env.API_KEY
}

export async function apiRoutes(app: FastifyInstance) {
  // Middleware para validar API key em todas as rotas deste plugin
  app.addHook("onRequest", async (req, reply) => {
    if (!validateApiKey(req)) {
      reply.code(401).send({ error: "Invalid API key" })
    }
  })

  // Envia eventos para usuários específicos
  app.post<{ Body: WsSendPayload }>("/send", async (req, reply) => {
    const { messages } = req.body

    if (!Array.isArray(messages)) {
      return reply.code(400).send({ error: "messages array is required" })
    }

    for (const msg of messages) {
      if (!msg.userId || !msg.type) continue

      sendToUser(msg.userId, msg.type, msg.data)
    }

    return {}
  })

  // Broadcast para todos conectados
  app.post<{ Body: WsBroadcastPayload }>("/broadcast", async (req, reply) => {
    const { type, data } = req.body

    if (!type) {
      return reply.code(400).send({ error: "type is required" })
    }

    broadcast(type, data ?? {})
    return { broadcasted: true, type }
  })

  // Lista usuários online
  app.get("/online", async () => {
    return {
      users: getOnlineUsers(),
      total: getConnectionCount(),
    }
  })

  // Checa se um usuário específico está online
  app.get<{ Params: { userId: string } }>("/online/:userId", async (req) => {
    const { userId } = req.params
    return { userId, online: isOnline(userId) }
  })
}
