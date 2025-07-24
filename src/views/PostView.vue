<template>
  <div class="post">
    <div v-if="loading">Загрузка...</div>
    <div v-else>
      <h1>{{ post.title }}</h1>
      <p class="summary">{{ post.briefDescription }}</p>
      <div class="content">{{ post.fullDescription }}</div>
      <div class="meta">
        <span @click="goToBlog(post.userInfoId)" class="author">{{ post.userInfo }}</span>
        <span class="date">{{ formatDate(post.dateTime) }}</span>
      </div>
      
      <div class="comments-section">
        <h2>Комментарии ({{ comments.length }})</h2>

                
        <div class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment">
            <div class="comment-header">
              <span class="commenter-name">{{ comment.userInfo }}</span>
              <span v-if="comment.email" class="commenter-email">{{ comment.email }}</span>
              <span class="comment-date">{{ formatDate(comment.dateTime) }}</span>
              <button 
                v-if="isAuthenticated" 
                @click="deleteComment(comment.id)" 
                class="delete-comment"
              >
                Удалить
              </button>
            </div>
            <div class="comment-text">{{ comment.textComment }}</div>
          </div>
        </div>
        
        <div v-if="isAuthenticated" class="add-comment">
          <h3>Добавить комментарий</h3>
          <form @submit.prevent="submitComment">
            <div class="form-group">
              <label for="commenterName">Имя*</label>
              <input 
                type="text" 
                id="commenterName" 
                v-model="newComment.userInfo" 
                :class="{ 'error': errors.userInfo }"
                maxlength="50"
              />
              <span class="error-message" v-if="errors.userInfo">{{ errors.userInfo }}</span>
              <span class="char-count">{{ newComment.userInfo?.length || 0 }}/50</span>
            </div>
            
            <div class="form-group">
              <label for="commenterEmail">Email</label>
              <input 
                type="email" 
                id="commenterEmail" 
                v-model="newComment.email" 
                :class="{ 'error': errors.email }"
                maxlength="50"
              />
              <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
              <span class="char-count">{{ newComment.email?.length || 0 }}/50</span>
            </div>
            
            <div class="form-group">
              <label for="commentText">Текст комментария*</label>
              <textarea 
                id="commentText" 
                v-model="newComment.textComment" 
                :class="{ 'error': errors.textComment }"
                maxlength="255"
              ></textarea>
              <span class="error-message" v-if="errors.textComment">{{ errors.textComment }}</span>
              <span class="char-count">{{ newComment.textComment?.length || 0 }}/255</span>
            </div>
            
            <button type="submit">Отправить</button>
          </form>
        </div>
        
        <div v-else class="login-prompt">
          <p>Чтобы оставить комментарий, пожалуйста, <router-link to="/login">войдите в систему</router-link>.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePostsStore } from '@/stores/postsStore'
import { useCommentsStore } from '@/stores/commentsStore'
import { storeToRefs } from 'pinia'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()
const commentsStore = useCommentsStore()

const { isAuthenticated } = storeToRefs(authStore)
const { currentPost, loading: postLoading } = storeToRefs(postsStore)
const { comments, loading: commentsLoading } = storeToRefs(commentsStore)

const post = ref({})
const loading = ref(true)

const newComment = ref({
  userInfo: '',
  email: '',
  textComment: ''
})

const errors = ref({
  userInfo: '',
  email: '',
  textComment: ''
})

const validateComment = () => {
  let isValid = true
  errors.value = { userInfo: '', email: '', textComment: '' }
  
  if (!newComment.value.userInfo.trim()) {
    errors.value.userInfo = 'Имя обязательно'
    isValid = false
  } else if (newComment.value.userInfo.length > 50) {
    errors.value.userInfo = 'Максимальная длина 50 символов'
    isValid = false
  }
  
  if (newComment.value.email && !/^\S+@\S+\.\S+$/.test(newComment.value.email)) {
    errors.value.email = 'Введите корректный email'
    isValid = false
  } else if (newComment.value.email.length > 50) {
    errors.value.email = 'Максимальная длина 50 символов'
    isValid = false
  }
  
  if (!newComment.value.textComment.trim()) {
    errors.value.textComment = 'Текст комментария обязателен'
    isValid = false
  } else if (newComment.value.textComment.length > 255) {
    errors.value.textComment = 'Максимальная длина 255 символов'
    isValid = false
  }
  
  return isValid
}

const submitComment = async () => {
  if (!validateComment()) return
  
  try {
    await commentsStore.createComment({
      userInfo: newComment.value.userInfo,
      email: newComment.value.email || null,
      textComment: newComment.value.textComment
    }, props.id)
    
    newComment.value = { userInfo: '', email: '', textComment: '' }
    await commentsStore.fetchCommentsByPostId(props.id)
  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error)
  }
}

const deleteComment = async (commentId) => {
  if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) return
  
  try {
    await commentsStore.deleteComment(commentId)
    await commentsStore.fetchCommentsByPostId(props.id)
  } catch (error) {
    console.error('Ошибка при удалении комментария:', error)
  }
}

const goToBlog = (userId) => {
  router.push({ name: 'blog', params: { id: userId } })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

onMounted(async () => {
  try {
    await postsStore.fetchPostById(props.id)
    post.value = currentPost.value
    await commentsStore.fetchCommentsByPostId(props.id)
  } catch (error) {
    console.error('Ошибка при загрузке поста:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.post {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 68px; /* Добавляем отступ равный высоте AppBar */
}

.summary {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 20px;
}

.content {
  margin-bottom: 30px;
  line-height: 1.6;
}

.meta {
  display: flex;
  justify-content: space-between;
  color: #888;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.author {
  cursor: pointer;
  color: #3498db;
}

.author:hover {
  text-decoration: underline;
}

.comments-section {
  margin-top: 40px;
}

.add-comment {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
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

.login-prompt {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-align: center;
}

.comments-list {
  margin-top: 20px;
}

.comment {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
}

.comment-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
  gap: 10px;
}

.commenter-name {
  font-weight: bold;
}

.commenter-email {
  color: #666;
  font-size: 0.9em;
}

.comment-date {
  color: #888;
  font-size: 0.8em;
  margin-left: auto;
}

.delete-comment {
  padding: 2px 5px;
  font-size: 0.8em;
  background-color: #e74c3c;
}

.delete-comment:hover {
  background-color: #c0392b;
}

.comment-text {
  line-height: 1.5;
}

@media (max-width: 600px) {
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .comment-date {
    margin-left: 0;
  }
}
</style>