import { defineStore } from 'pinia'
import api from '@/api'

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    comments: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchCommentsByPostId(postId) {
      this.loading = true
      try {
        const response = await api.getPostById(postId)
        this.comments = response.data.comments || []
      } catch (error) {
        this.error = error
        console.error('Error fetching comments:', error)
      } finally {
        this.loading = false
      }
    },
    
    async createComment(commentData, postId) {
      try {
        const response = await api.createComment(commentData, postId)
        await this.fetchCommentsByPostId(postId)
        return response.data
      } catch (error) {
        console.error('Error creating comment:', error)
        throw error
      }
    },
    
    async deleteComment(id, postId) {
      try {
        await api.deleteComment(id)
        await this.fetchCommentsByPostId(postId)
      } catch (error) {
        console.error('Error deleting comment:', error)
        throw error
      }
    }
  }
})