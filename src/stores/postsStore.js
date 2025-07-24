import { defineStore } from 'pinia'
import api from '@/api'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [],
    currentPost: null,
    loading: false,
    error: null
  }),
  actions: {
    async fetchPosts() {
      this.loading = true
      this.error = null
      try {
        const response = await api.getUserInfos()
        
        // Сохраняем оригинальные данные пользователей для использования в блогах
        this.usersData = response.data
        
        // Собираем все посты из всех пользователей (ваша логика)
        this.posts = response.data.flatMap(user => 
          (user.post || []).map(post => ({
            ...post,
            userInfoId: user.id,
            userInfo: user.fullName || `Пользователь ${user.id}`,
            blogName: user.blogName || `Блог пользователя ${user.id}`, // Добавляем название блога
            comments: post.comments || []
          }))
        )
        
        // Сортируем по дате (новые сначала) - ваша сортировка
        this.posts.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        
        // Возвращаем и оригинальные данные пользователей, и обработанные посты
        return {
          users: response.data,
          posts: this.posts
        }
      } catch (error) {
        this.error = error
        console.error('Error fetching posts:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async fetchPostById(id) {
      this.loading = true
      try {
        const response = await api.getPostById(id)
        this.currentPost = response.data
        return response.data
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createPost(postData, userId) {
      this.loading = true
      try {
        const response = await api.createPost(postData, userId)
        await this.fetchPosts()
        return response.data
      } catch (error) {
        console.error('Error creating post:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updatePost(postData) {
      this.loading = true
      try {
        const response = await api.updatePost(postData)
        const index = this.posts.findIndex(p => p.id === postData.id)
        if (index !== -1) {
          this.posts[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deletePost(id) {
      this.loading = true
      try {
        await api.deletePost(id)
        this.posts = this.posts.filter(p => p.id !== id)
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    }
  },
  getters: {
    getPostsByBlogId: (state) => (blogId) => {
      return state.posts.filter(post => post.blog.id === blogId)
    }
  }
})