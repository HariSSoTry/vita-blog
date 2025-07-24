import { defineStore } from 'pinia'
import api from '@/api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchUserInfos() {
      this.loading = true
      try {
        const response = await api.getUserInfos()
        this.users = response.data
      } catch (error) {
        this.error = error
        console.error('Error fetching users:', error)
      } finally {
        this.loading = false
      }
    },
    
    async createUserInfo(userData) {
      try {
        const response = await api.createUserInfo(userData)
        await this.fetchUserInfos() // Обновляем список после создания
        return response.data
      } catch (error) {
        console.error('Error creating user:', error)
        throw error
      }
    },
    
    async deleteUserInfo(id) {
      try {
        await api.deleteUserInfo(id)
        await this.fetchUserInfos() // Обновляем список после удаления
      } catch (error) {
        console.error('Error deleting user:', error)
        throw error
      }
    }
  }
})