import { defineStore } from 'pinia'
import { getAccessToken, getErrorMessage, putAccessToken } from '../../../helpers/apiHelper'
import { loginApi, logoutApi, registerApi } from '../api/authApi'
import type { AuthUserData, LoginPayload, RegisterPayload } from '../api/authApi'

export interface AuthState {
  user: AuthUserData | null
  token: string | null
  isLoading: boolean
  message: string
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: getAccessToken(),
    isLoading: false,
    message: '',
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },
  actions: {
    async login(payload: LoginPayload): Promise<boolean> {
      this.isLoading = true
      try {
        const { data, message } = await loginApi(payload)
        putAccessToken(data.token)
        this.token = data.token
        this.user = data.user
        this.message = message
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    async register(payload: RegisterPayload): Promise<boolean> {
      this.isLoading = true
      try {
        const { message } = await registerApi(payload)
        this.message = message
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    clearSession(): void {
      putAccessToken(null)
      this.token = null
      this.user = null
    },
    async logout(): Promise<void> {
      try {
        await logoutApi()
      } catch {
        // token mungkin sudah kedaluwarsa; sesi lokal tetap dibersihkan
      } finally {
        this.clearSession()
      }
    },
  },
})
