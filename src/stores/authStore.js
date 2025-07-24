import { defineStore } from 'pinia'
import api from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: localStorage.getItem('username') || null,
    isAuthenticated: false
  }),
  actions: {
    async login(username, password) {
      try {
        // Очищаем предыдущий токен
        document.cookie = 'FRONTTESTINGSERVICE_TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        
        const response = await api.login(username, password)
        
        // Даем время на установку cookie
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const token = this.getCookie('FRONTTESTINGSERVICE_TOKEN')
        
        if (token) {
          this.user = username
          this.isAuthenticated = true
          localStorage.setItem('username', username)
          return true
        }
        
        throw new Error('Токен не найден в cookies')
      } catch (error) {
        console.error('Ошибка входа:', error.message)
        this.logout()
        return false
      }
    },
    
    getCookie(name) {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
      return null
    },
    
    logout() {
      document.cookie = 'FRONTTESTINGSERVICE_TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('username')
    },
    
    checkAuth() {
      const token = this.getCookie('FRONTTESTINGSERVICE_TOKEN')
      this.isAuthenticated = !!token
      if (!this.isAuthenticated) {
        this.logout()
      }
    }
  }
})