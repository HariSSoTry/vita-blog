<template>
  <v-app>
    <AppBar />
    <Sidebar />
    
    <v-main class="main-content">
      <router-view v-slot="{ Component }">
        <v-fade-transition mode="out-in">
          <component :is="Component" />
        </v-fade-transition>
      </router-view>
    </v-main>
    
    <BottomMenu />
  </v-app>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { ref, onMounted } from 'vue'
import AppBar from '@/components/navigation/AppBar.vue'
import Sidebar from '@/components/navigation/Sidebar.vue'
import BottomMenu from '@/components/navigation/BottomMenu.vue'

const authStore = useAuthStore()
const sidebar = ref(null)

const showPostForm = ref(false)

const handlePostCreated = () => {
  showPostForm.value = false
}

onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<style scoped>
.main-content {
  padding-top: 0 !important;
  padding-left: 240px;
  min-height: calc(100vh - 56px); /* Учитываем высоту BottomMenu */
}

@media (max-width: 1279px) {
  .main-content {
    padding-left: 72px;
  }
}

@media (max-width: 767px) {
  .main-content {
    padding-left: 0 !important;
    padding-bottom: 56px; /* Для BottomMenu */
  }
}
</style>