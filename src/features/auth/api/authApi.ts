import { apiRequest } from '../../../helpers/apiHelper'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}

export interface AuthUserData {
  id: number
  name: string
  email: string
  photo?: string | null
}

export interface LoginData {
  user: AuthUserData
  token: string
}

export const loginApi = (payload: LoginPayload) =>
  apiRequest<LoginData>('/auth/login', { method: 'POST', body: payload, auth: false })

export const registerApi = (payload: RegisterPayload) =>
  apiRequest('/auth/register', { method: 'POST', body: payload, auth: false })

export const logoutApi = () => apiRequest('/auth/logout', { method: 'POST' })
