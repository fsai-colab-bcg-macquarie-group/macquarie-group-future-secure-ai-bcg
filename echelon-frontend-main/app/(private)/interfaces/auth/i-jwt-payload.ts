export interface JwtPayload {
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  email: string
  phone: string
  app_metadata: {
    provider: string
    providers: string[]
  }
  user_metadata: Record<string, any>
  role: string
  aal: string
  amr: Array<{
    method: string
    timestamp: number
  }>
  session_id: string
  is_anonymous: boolean
  user_permissions?: string[]
}
