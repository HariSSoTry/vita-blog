<template>
  <div class="user-management">
    <div id="page-top"></div>
      <h2>Управление пользователями</h2>
      <button @click="showUserForm = true" class="create-user-btn">
        Создать нового пользователя
      </button>
      
      <div v-if="showUserForm" class="user-form">
        <h3>Новый пользователь</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="fullName">Полное имя*</label>
            <input
              type="text"
              id="fullName"
              v-model="userForm.fullName"
              required
              maxlength="50"
              placeholder="Введите полное имя"
            />
          </div>
          
          <div class="form-group">
            <label for="blogName">Название блога*</label>
            <input
              type="text"
              id="blogName"
              v-model="userForm.blogName"
              required
              maxlength="50"
              placeholder="Введите название блога"
            />
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cancelForm" class="cancel-btn">
              Отмена
            </button>
            <button type="submit" class="submit-btn">
              Создать
            </button>
          </div>
        </form>
      </div>
      
      <div v-if="loading">Загрузка...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div v-if="users.length === 0" class="no-users">
          Нет зарегистрированных пользователей
        </div>
        <div v-else class="users-list">
          <div v-for="user in users" :key="user.id" class="user-card">
            <div class="user-info" @click="goToBlog(user.id)">
              <h3>{{ user.fullName }}</h3>
              <p>Блог: {{ user.blogName }}</p>
              <p>ID: {{ user.id }}</p>
              <p>Постов: {{ user.post?.length || 0 }}</p>
            </div>
            <button 
              @click="deleteUser(user.id)" 
              class="delete-btn"
              v-if="isAuthenticated"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/usersStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const usersStore = useUsersStore()
const authStore = useAuthStore()

const { users, loading, error } = storeToRefs(usersStore)
const { isAuthenticated } = storeToRefs(authStore)
const router = useRouter()

const showUserForm = ref(false)
const userForm = ref({
  fullName: '',
  blogName: ''
})

onMounted(async () => {
  await usersStore.fetchUserInfos()
})

const handleSubmit = async () => {
  try {
    await usersStore.createUserInfo({
      fullName: userForm.value.fullName,
      blogName: userForm.value.blogName
    })
    resetForm()
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error)
  }
}

const deleteUser = async (id) => {
  if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
    try {
      await usersStore.deleteUserInfo(id)
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error)
    }
  }
}

const cancelForm = () => {
  resetForm()
}

const resetForm = () => {
  userForm.value = { fullName: '', blogName: '' }
  showUserForm.value = false
}

const goToBlog = (userId) => {
  router.push({ name: 'blog', params: { id: userId } })
}
</script>

<style scoped>
.user-management {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 56px; /* Высота AppBar */
  min-height: 100vh;
}

.create-user-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  margin-bottom: 20px;
  cursor: pointer;
}

.create-user-btn:hover {
  background-color: #45a049;
}

.user-form {
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

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #333;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn {
  background-color: #3498db;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #2980b9;
}

.error, .no-users {
  text-align: center;
  padding: 20px;
  color: #666;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.user-info h3 {
  cursor: pointer;
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c0392b;
}

@media (max-width: 600px) {
  .user-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .delete-btn {
    align-self: flex-end;
  }
}
</style>