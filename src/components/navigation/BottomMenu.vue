<template>
  <v-bottom-navigation v-if="isMobile" grow class="mobile-menu">
    <v-btn value="home" to="/" class="menu-btn">
      <v-icon>mdi-home</v-icon>
      <span class="btn-text">Блоги</span>
    </v-btn>
    
    <v-btn value="create" class="menu-btn" @click="createPost">
      <v-icon>mdi-plus</v-icon>
      <span class="btn-text">Создать</span>
    </v-btn>
    
    <v-btn value="users" to="/users" class="menu-btn" v-if="isAuthenticated">
      <v-icon>mdi-account-group</v-icon>
      <span class="btn-text">Люди</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const { mobile, width } = useDisplay()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const isMobile = computed(() => mobile.value && width.value < 768)

const createPost = () => {
  router.push('/create-post')
}
</script>

<style scoped>
.mobile-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  z-index: 1000;
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.menu-btn {
  min-width: 60px;
  height: 100%;
}

.btn-text {
  font-size: 0.7rem;
  margin-top: 2px;
}

.v-btn--active {
  background-color: transparent !important;
}

.v-btn--active .v-icon {
  color: #1976d2 !important;
}
</style>