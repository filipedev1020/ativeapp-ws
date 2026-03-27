export interface WsEvent<T = Record<string, unknown>> {
  id: string
  type: string
  data: T
}

export interface WsSendPayload {
  /** ID do usuário destino */
  userId: string
  /** Tipo do evento (ex: "notification", "message", "update") */
  type: string
  /** Dados do evento */
  data: Record<string, unknown>
}

export interface WsBroadcastPayload {
  type: string
  data: Record<string, unknown>
}

export interface JwtPayload {
  id: string
  [key: string]: unknown
}
