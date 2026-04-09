export interface WsEvent {
  id: string
  type: string
  data?: string
}

export interface WsSendMessage {
  /** ID do usuário destino */
  userId: string
  /** Tipo do evento (ex: "notification", "message", "update") */
  type: string
  /** Dados do evento */
  data?: string
}

export interface WsSendPayload {
  messages: WsSendMessage[]
}

export interface WsBroadcastPayload {
  type: string
  data?: string
}

export interface JwtPayload {
  id: string
  [key: string]: unknown
}
