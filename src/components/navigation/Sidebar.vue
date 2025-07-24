<template>
  <div class="sidebar-container">
        <v-navigation-drawer
        v-model="drawer"
        :permanent="!isMobile"
        :temporary="isMobile"
        :width="sidebarWidth"
        app
        class="sidebar"
        :floating="isCompact"
        >
        <div class="sidebar-header" :class="{ 'compact': isCompact }">
        <v-icon class="logo-icon">mdi-alpha-v-circle</v-icon>
        <div v-if="!isCompact" class="logo-text-container">
            <div class="logo-main-text">Вита-Блог</div>
            <div v-if="user" class="logo-sub-text">Привет, {{ user }}</div>
        </div>
        <v-btn
        v-if="!isMobile"
        icon
        small
        class="toggle-btn"
        @click.stop="toggleCompact"
        >
        <v-icon v-if="isCompact">mdi-menu-right</v-icon>
        <v-icon v-else>mdi-menu-left</v-icon>
        </v-btn>
        </div>
        
        <v-list density="compact" class="menu-list">
        <v-list-item
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="!isCompact ? item.title : ''"
            :active-class="isCompact ? 'compact-active' : ''"
            class="sidebar-item"
        >
            <template v-if="isCompact" #prepend>
            <v-tooltip location="right">
                <template v-slot:activator="{ props }">
                <v-icon 
                    v-bind="props" 
                    :icon="item.icon" 
                    size="large"
                    class="compact-icon"
                ></v-icon>
                </template>
                <span>{{ item.title }}</span>
            </v-tooltip>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const { mobile, width } = useDisplay()
const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)

const drawer = ref(true)
const forceCompact = ref(false) // Для ручного управления компактным режимом

const isMobile = computed(() => width.value < 768)
const isCompact = computed(() => forceCompact.value || (width.value < 1280 && !isMobile.value))
const sidebarWidth = computed(() => {
  if (isMobile.value) return 0
  if (isCompact.value) return 72
  return 240
})

const toggleCompact = () => {
  forceCompact.value = !forceCompact.value
}

watch([width], () => {
  if (isMobile.value) {
    drawer.value = false
  } else {
    drawer.value = true
  }
}, { immediate: true })

const menuItems = computed(() => [
  { to: '/', icon: 'mdi-home', title: 'Блоги' },
  ...(isAuthenticated.value ? [
    { to: '/create-post', icon: 'mdi-plus-box', title: 'Создать пост' },
    { to: '/users', icon: 'mdi-account-group', title: 'Пользователи' }
  ] : [])
])
</script>

<style scoped>
.sidebar {
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-container {
  position: relative;
  height: 100%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.sidebar-header.compact {
  justify-content: center;
  padding: 16px 0;
}

.logo-icon {
  color: #1976d2;
  font-size: 32px;
  margin-right: 12px;
}

.sidebar-header.compact .logo-icon {
  margin-right: 0;
}

.logo-text-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.logo-main-text {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  line-height: 1.2;
  color: #2c3e50;
}

.logo-sub-text {
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
}

.toggle-btn {
  position: fixed;
  left: 240px;
  top: 16px;
  z-index: 2;
  background-color: white;
  border: 1px solid #e0e0e0;
  width: 32px;
  height: 32px;
  transition: left 0.3s ease;
}

.v-navigation-drawer--is-mobile + .toggle-btn,
.v-navigation-drawer--is-mobile.temporary + .toggle-btn {
  left: 72px;
}

.toggle-btn:hover {
  background-color: #f5f5f5;
}

.sidebar-item {
  margin-bottom: 4px;
}

.sidebar-item :deep(.v-list-item__prepend) {
  margin-right: 0;
}

.compact-icon {
  margin: 0 auto;
}

.v-navigation-drawer--floating:not(.v-navigation-drawer--temporary) {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.compact-active {
  background-color: rgba(25, 118, 210, 0.1);
}

:deep(.v-navigation-drawer__content) {
  overflow-x: hidden;
}

:deep(.v-list-item__prepend) {
  margin-right: 0;
}

@media (max-width: 1279px) {
  .toggle-btn {
    left: 72px;
  }
  
  .v-navigation-drawer--expanded + .toggle-btn {
    left: 240px;
  }
}

@media (max-width: 767px) {
  .toggle-btn {
    display: none;
  }
}
</style>