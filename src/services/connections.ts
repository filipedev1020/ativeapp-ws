import type { WebSocket } from "@fastify/websocket"
import type { WsEvent } from "../types/ws.js"

/** Map de userId -> Set de WebSockets conectados */
const clients = new Map<string, Set<WebSocket>>()

export function addClient(userId: string, socket: WebSocket) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set())
  }
  clients.get(userId)!.add(socket)
  console.log(`[ws] connected: ${userId} (${clients.get(userId)!.size} sockets)`)
}

export function removeClient(userId: string, socket: WebSocket) {
  const sockets = clients.get(userId)
  if (!sockets) return
  sockets.delete(socket)
  if (sockets.size === 0) {
    clients.delete(userId)
  }
  console.log(`[ws] disconnected: ${userId} (${sockets?.size ?? 0} remaining)`)
}

export function sendToUser(
  userId: string,
  type: string,
  data?: string
): boolean {
  const sockets = clients.get(userId)
  if (!sockets || sockets.size === 0) return false

  const event: WsEvent = { id: userId, type, data }
  const payload = JSON.stringify(event)

  for (const socket of sockets) {
    if (socket.readyState === 1) {
      socket.send(payload)
    }
  }
  return true
}

export function broadcast<T = Record<string, unknown>>(type: string, data: T) {
  const event = JSON.stringify({ id: "broadcast", type, data })
  for (const [, sockets] of clients) {
    for (const socket of sockets) {
      if (socket.readyState === 1) {
        socket.send(event)
      }
    }
  }
}

export function getOnlineUsers(): string[] {
  return Array.from(clients.keys())
}

export function isOnline(userId: string): boolean {
  return clients.has(userId)
}

export function getConnectionCount(): number {
  let count = 0
  for (const [, sockets] of clients) {
    count += sockets.size
  }
  return count
}
