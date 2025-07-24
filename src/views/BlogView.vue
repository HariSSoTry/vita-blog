<template>
  <div class="blog">
    <div class="blog-header">
      <h1 class="blog-name">{{ blog.blogName || `Блог пользователя ${props.id}` }}</h1>
      <p class="author-name" v-if="blog.fullName">Автор: {{ blog.fullName }}</p>
    </div>
    
    <div class="create-post-container">
      <button 
        v-if="isAuthenticated && !showAddPostForm" 
        @click="showPostForm" 
        class="create-post-btn"
      >
        Создать запись
      </button>
    </div>
    
    <PostForm
      v-if="showAddPostForm"
      v-model="postForm"
      :is-editing="isEditing"
      :show-user-select="false"
      @submit="handleFormSubmit"
      @cancel="cancelForm"
    />
    
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="!showAddPostForm">
      <div v-if="blog.posts.length === 0" class="no-posts">
        В этом блоге пока нет записей
      </div>
      <div v-else>
        <div v-for="post in blog.posts" :key="post.id" class="post-card">
          <div class="post-header">
            <h2 @click="goToPost(post.id)" class="post-title">{{ post.title }}</h2>
            <div v-if="isAuthenticated" class="post-actions">
              <button @click.stop="editPost(post)" class="edit-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button @click.stop="deletePost(post.id)" class="delete-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <p class="post-summary">{{ post.briefDescription }}</p>
          <div class="post-meta">
            <span class="date">{{ formatDate(post.dateTime) }}</span>
            <span class="comments-count">
              {{ post.comments?.length || 0 }} комментариев
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { storeToRefs } from 'pinia'
import PostForm from '@/components/PostForm.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()

const { isAuthenticated } = storeToRefs(authStore)
const { loading } = storeToRefs(postsStore)

const blog = ref({
  id: props.id,
  name: '',
  fullName: '',
  posts: []
})

const showAddPostForm = ref(false)
const isEditing = ref(false)
const editingPostId = ref(null)
const postForm = ref({
  userId: props.id,
  title: '',
  briefDescription: '',
  fullDescription: ''
})

const newPost = ref({
  title: '',
  briefDescription: '',
  fullDescription: ''
})

const errors = ref({
  title: '',
  briefDescription: '',
  fullDescription: ''
})

const cancelForm = () => {
  showAddPostForm.value = false
  isEditing.value = false
  editingPostId.value = null
}

const blogName = computed(() => {
  return blog.value.name || `Блог пользователя ${props.id}`
})

const showPostForm = () => {
  resetForm()
  showAddPostForm.value = true
  isEditing.value = false
}

const fetchBlog = async () => {
  try {
    // Получаем все данные пользователей
    const response = await postsStore.fetchPosts()
    
    // Находим нужного пользователя
    const userPosts = postsStore.posts.filter(post => post.userInfoId == props.id)
    
    if (userPosts.length > 0) {
      blog.value = {
        id: props.id,
        name: userPosts[0].userInfo || `Блог пользователя ${props.id}`,
        fullName: userPosts[0].userInfo || '',
        posts: userPosts
      }
    } else {
      blog.value = {
        id: props.id,
        name: `Блог пользователя ${props.id}`,
        fullName: '',
        posts: []
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке блога:', error)
  }
}

const validateForm = () => {
  let isValid = true
  errors.value = { title: '', briefDescription: '', fullDescription: '' }
  
  if (!newPost.value.title.trim()) {
    errors.value.title = 'Заголовок обязателен'
    isValid = false
  } else if (newPost.value.title.length > 50) {
    errors.value.title = 'Максимальная длина 50 символов'
    isValid = false
  }
  
  if (!newPost.value.briefDescription.trim()) {
    errors.value.briefDescription = 'Краткое описание обязательно'
    isValid = false
  } else if (newPost.value.briefDescription.length > 100) {
    errors.value.briefDescription = 'Максимальная длина 100 символов'
    isValid = false
  }
  
  if (newPost.value.fullDescription.length > 255) {
    errors.value.fullDescription = 'Максимальная длина 255 символов'
    isValid = false
  }
  
  return isValid
}

const editPost = (post) => {
  postForm.value = {
    title: post.title,
    briefDescription: post.briefDescription,
    fullDescription: post.fullDescription || ''
  }
  editingPostId.value = post.id
  showAddPostForm.value = true
  isEditing.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleFormSubmit = async (formData) => {
  try {
    if (isEditing.value) {
      await postsStore.updatePost({
        ...formData,
        id: editingPostId.value
      })
    } else {
      const userIdToUse = formData.userId || props.id
      await postsStore.createPost({
        title: formData.title,
        briefDescription: formData.briefDescription,
        fullDescription: formData.fullDescription || ''
      }, userIdToUse)
    }
    
    await fetchBlog()
    cancelForm()
  } catch (error) {
    console.error('Ошибка при сохранении поста:', error)
  }
}

const deletePost = async (postId) => {
  if (!confirm('Вы уверены, что хотите удалить эту запись?')) return
  
  try {
    await postsStore.deletePost(postId)
    await fetchBlog()
  } catch (error) {
    console.error('Ошибка при удалении поста:', error)
  }
}

const cancelAddPost = () => {
  resetForm()
  showAddPostForm.value = false
}

const resetForm = () => {
  newPost.value = { title: '', briefDescription: '', fullDescription: '' }
  errors.value = { title: '', briefDescription: '', fullDescription: '' }
  isEditing.value = false
  editingPostId.value = null
}

const goToPost = (postId) => {
  router.push({ name: 'post', params: { id: postId } })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(async () => {
  await fetchBlog()
})
</script>

<style scoped>
.blog {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 20px 0; /* Убираем нижний отступ */
}

.blog-header {
  margin-bottom: 20px;
}

.blog-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #000000;
}

.author-name {
  font-size: 1rem;
  color: #666;
  margin-top: 0;
}

.post-form {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

textarea {
  min-height: 100px;
}

.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8em;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.8em;
  color: #888;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  padding: 8px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}

.post-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
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
}

.post-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #666;
}

.edit-btn:hover {
  color: #1976d2;
}

.delete-btn:hover {
  color: #e53935;
}

@media (max-width: 600px) {
  .post-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .post-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 767px) {
  .blog {
    padding-top: 68px; /* Учитываем высоту AppBar */
  }
  
  .blog-name {
    font-size: 1.5rem;
  }
}

.create-post-container {
  margin: 20px 0;
}

.create-post-btn {
  padding: 8px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-post-btn:hover {
  background-color: #2980b9;
}
</style>