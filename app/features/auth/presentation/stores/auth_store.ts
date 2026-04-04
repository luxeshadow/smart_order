import { defineStore } from 'pinia'
import { UserModel } from '../../data/models/user_model' 
import type { User } from '../../domain/entities/user'

export const useAuthStore = defineStore('auth', () => {

  const user = ref<UserModel | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role)

  // 1. Charger les données au démarrage (Client Side uniquement)
  onMounted(() => {
    const savedUser = localStorage.getItem('smart_order_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        user.value = new UserModel(parsed)
      } catch (e) {
        localStorage.removeItem('smart_order_user')
      }
    }
  })

  // 2. Synchroniser les changements avec le localStorage
  function setUser(userData: User | null) {
    if (userData) {
      user.value = new UserModel(userData)
      localStorage.setItem('smart_order_user', JSON.stringify(userData))
    } else {
      user.value = null
      localStorage.removeItem('smart_order_user')
    }
  }

  function logout() {
    user.value = null
    localStorage.removeItem('smart_order_user')
    navigateTo('/auth/login')
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    setUser,
    logout
  }
})