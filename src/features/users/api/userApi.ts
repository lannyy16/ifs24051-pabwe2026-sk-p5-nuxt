import { apiRequest } from '../../../helpers/apiHelper'

export interface User {
  id: number
  name: string
  email: string
  photo?: string | null
  created_at?: string
  updated_at?: string
}

export interface UpdateProfilePayload {
  name: string
  email: string
}

export interface ChangePasswordPayload {
  password: string
  new_password: string
  new_password_confirmation: string
}

export const getUsersApi = () => apiRequest<{ users: User[] }>('/users')

export const getMeApi = () => apiRequest<{ user: User }>('/users/me')

export const updateMeApi = (payload: UpdateProfilePayload) =>
  apiRequest<{ user: User }>('/users/me', { method: 'PUT', body: payload })

export const uploadPhotoApi = (file: File) => {
  const formData = new FormData()
  formData.append('photo', file)
  return apiRequest('/users/me/photo', { method: 'POST', formData })
}

// Endpoint resmi Delcom Open API untuk ubah kata sandi: PUT /users/password
export const changePasswordApi = (payload: ChangePasswordPayload) =>
  apiRequest('/users/password', { method: 'PUT', body: payload })
