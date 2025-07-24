<template>
  <v-app-bar v-if="isMobile" app color="white" elevation="1" height="48" class="app-bar">
    <div class="app-bar-content">
      <v-icon class="app-icon">mdi-alpha-v-circle</v-icon>
      <span class="app-title">Вита-Блог</span>
    </div>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const { mobile, width } = useDisplay()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const isMobile = computed(() => width.value < 768)
</script>

<style scoped>
.app-bar {
  padding: 0 4px !important;
  position: fixed;
  top: 0;
  z-index: 1000;
}

.app-bar-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 8px;
  padding: 0 4px;
}

.app-title {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #2c3e50;
}

.app-icon {
  color: #1976d2;
  font-size: 24px;
}

.greeting {
  font-size: 0.8rem;
  color: #666;
}

@media (max-width: 767px) {
  .main-content {
    padding-top: 48px !important; /* Высота AppBar */
  }
}

@media (max-width: 400px) {
  .greeting {
    display: none;
  }
}
</style>