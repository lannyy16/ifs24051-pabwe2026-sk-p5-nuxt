import { defineStore } from 'pinia'
import { getErrorMessage } from '../../../helpers/apiHelper'
import { changePasswordApi, getMeApi, getUsersApi, updateMeApi, uploadPhotoApi } from '../api/userApi'
import type { ChangePasswordPayload, UpdateProfilePayload, User } from '../api/userApi'

export interface UsersState {
  users: User[]
  profile: User | null
  isLoading: boolean
  isSaving: boolean
  message: string
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    profile: null,
    isLoading: false,
    isSaving: false,
    message: '',
  }),
  actions: {
    async fetchUsers(): Promise<boolean> {
      this.isLoading = true
      try {
        const { data } = await getUsersApi()
        this.users = data.users
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    async fetchProfile(): Promise<boolean> {
      this.isLoading = true
      try {
        const { data } = await getMeApi()
        this.profile = data.user
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    async updateProfile(payload: UpdateProfilePayload): Promise<boolean> {
      this.isSaving = true
      try {
        const { data, message } = await updateMeApi(payload)
        this.profile = data.user
        this.message = message
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isSaving = false
      }
    },
    async uploadPhoto(file: File): Promise<boolean> {
      this.isSaving = true
      try {
        const { message } = await uploadPhotoApi(file)
        this.message = message
        return await this.fetchProfile()
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isSaving = false
      }
    },
    async changePassword(payload: ChangePasswordPayload): Promise<boolean> {
      this.isSaving = true
      try {
        const { message } = await changePasswordApi(payload)
        this.message = message
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isSaving = false
      }
    },
  },
})
