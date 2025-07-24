<template>
  <div class="home">
    <h1>Все блоги</h1>
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="posts.length === 0" class="no-posts">
        Нет доступных записей в блоге
      </div>
      <div v-else>
        <div v-for="post in posts" :key="post.id" class="post-card">
          <h2 @click="goToPost(post.id)" class="post-title">{{ post.title }}</h2>
          <p class="post-summary">{{ post.briefDescription }}</p>
          <div class="post-meta">
            <span @click="goToBlog(post.userInfoId)" class="author">{{ post.userInfo }}</span>
            <span class="date">{{ formatDate(post.dateTime) }}</span>
            <span class="comments">{{ post.comments.length }} комментариев</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/postsStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { onMounted, computed } from 'vue'

const router = useRouter()
const postsStore = usePostsStore()
const authStore = useAuthStore()

const { posts, loading, error } = storeToRefs(postsStore)
const { isAuthenticated } = storeToRefs(authStore)

const authors = computed(() => {
  return posts.value.reduce((acc, post) => {
    if (!acc[post.userInfoId]) {
      acc[post.userInfoId] = post.userInfo || `Пользователь ${post.userInfoId}`
    }
    return acc
  }, {})
})

const getAuthorName = (userId) => {
  return authors.value[userId] || `Пользователь ${userId}`
}

onMounted(async () => {
  authStore.checkAuth()
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' })
    return
  }
  
  try {
    await postsStore.fetchPosts()
  } catch (error) {
    console.error('Ошибка при загрузке постов:', error)
  }
})

const goToPost = (postId) => {
  router.push({ name: 'post', params: { id: postId } })
}

const goToBlog = (userId) => {
  router.push({ name: 'blog', params: { id: userId } })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 20px 0; /* Убираем нижний отступ */
}

.loading, .error, .no-posts {
  text-align: center;
  padding: 20px;
  color: #666;
}

.post-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}

.post-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-title {
  color: #2c3e50;
  margin-bottom: 10px;
  cursor: pointer;
}

.post-summary {
  color: #666;
  margin-bottom: 10px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.9em;
  flex-wrap: wrap;
  gap: 10px;
}

.author {
  cursor: pointer;
  color: #3498db;
  font-weight: bold;
}

.author:hover {
  text-decoration: underline;
}

.date {
  white-space: nowrap;
}

.comments {
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

@media (max-width: 600px) {
  .post-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .post-title {
    font-size: 1.2em;
  }
}

@media (max-width: 767px) {
  .home {
    padding-top: 68px; /* Учитываем высоту AppBar */
  }
  
  .page-title {
    padding-top: 0;
  }
}
</style>