<template>
  <div class="create-post-view">
    <v-container>  
      <PostForm 
        v-model="postForm"
        @submit="handleSubmit" 
        @cancel="goBack" 
      />
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/postsStore'
import PostForm from '@/components/PostForm.vue'

const router = useRouter()
const postsStore = usePostsStore()

const postForm = ref({
  userId: null,
  title: '',
  briefDescription: '',
  fullDescription: ''
})

const handleSubmit = async (postData) => {
  try {
    if (!postData.userId) {
      alert('Пожалуйста, выберите пользователя')
      return
    }
    await postsStore.createPost({
      title: postData.title,
      briefDescription: postData.briefDescription,
      fullDescription: postData.fullDescription || ''
    }, postData.userId)
    router.push('/')
  } catch (error) {
    console.error('Ошибка при создании поста:', error)
  }
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.create-post-view {
  padding-top: 20px;
}

@media (max-width: 767px) {
  .create-post-view {
    padding-top: 68px; /* AppBar + небольшой отступ */
  }
}
</style>