<template>
  <v-card class="post-form-card" :class="{ 'mobile-view': isMobile }">
    <v-card-title class="d-flex justify-space-between">
      <span>{{ isEditing ? 'Редактировать пост' : 'Новый пост' }}</span>
      <v-btn icon @click="$emit('cancel')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <v-select
        v-if="showUserSelect"
        v-model="localForm.userId"
        :items="users"
        item-title="fullName"
        item-value="id"
        label="Автор поста*"
        :rules="[v => !!v || 'Необходимо выбрать автора']"
        required
      ></v-select>

      <v-form ref="formRef" @submit.prevent="submit">
        <v-text-field
          v-model="localForm.title"
          label="Заголовок*"
          :rules="titleRules"
          counter="50"
          required
        ></v-text-field>
        
        <v-textarea
          v-model="localForm.briefDescription"
          label="Краткое описание*"
          :rules="briefDescRules"
          counter="100"
          rows="2"
          required
        ></v-textarea>
        
        <v-textarea
          v-model="localForm.fullDescription"
          label="Полное описание"
          :rules="fullDescRules"
          counter="255"
          rows="4"
        ></v-textarea>
        
        <v-card-actions class="justify-end px-0">
          <v-btn variant="text" @click="$emit('cancel')">Отмена</v-btn>
          <v-btn color="primary" type="submit" :loading="loading">
            {{ isEditing ? 'Сохранить' : 'Опубликовать' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useUsersStore } from '@/stores/usersStore'

const usersStore = useUsersStore()
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const users = ref([])
const localForm = ref({
  userId: null,
  title: '',
  briefDescription: '',
  fullDescription: ''
})

const formRef = ref(null)

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      userId: null,
      title: '',
      briefDescription: '',
      fullDescription: ''
    })
  },
  isEditing: Boolean,
  loading: Boolean,
  showUserSelect: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

// Используем computed для синхронизации значений
const form = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

watch(() => props.modelValue, (newVal) => {
  // Обновляем localForm только если значения действительно изменились
  if (JSON.stringify(newVal) !== JSON.stringify(localForm.value)) {
    localForm.value = { ...newVal }
  }
}, { immediate: true })

const titleRules = [
  v => !!v || 'Обязательное поле',
  v => (v && v.length <= 50) || 'Не более 50 символов'
]

const briefDescRules = [
  v => !!v || 'Обязательное поле',
  v => (v && v.length <= 100) || 'Не более 100 символов'
]

const fullDescRules = [
  v => !v || v.length <= 255 || 'Не более 255 символов'
]

const submit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid) {
    emit('submit', {
      userId: localForm.value.userId,
      title: localForm.value.title,
      briefDescription: localForm.value.briefDescription,
      fullDescription: localForm.value.fullDescription || ''
    })
  }
}

onMounted(async () => {
  await usersStore.fetchUserInfos()
  users.value = usersStore.users.map(user => ({
    id: user.id,
    fullName: user.fullName || `Пользователь ${user.id}`
  }))
})
</script>

<style scoped>
.post-form-card {
  max-width: 800px;
  margin: 0 auto 20px;
}

.mobile-view {
  border-radius: 0;
  box-shadow: none;
  height: 100vh;
}

@media (max-width: 767px) {
  .post-form-card {
    margin-top: 68px; /* Учитываем высоту AppBar */
    border-radius: 0;
    height: calc(100vh - 68px); /* Занимаем всю доступную высоту */
    overflow-y: auto;
  }
}
</style>