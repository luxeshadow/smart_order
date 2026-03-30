import { defineStore } from 'pinia'
import { UserModel } from '../../data/models/user_model' 
import type { User } from '../../domain/entities/user'

export const useAuthStore = defineStore('auth', () => {

  const user = ref<UserModel | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role)

  function setUser(userData: User | null) {
    if (userData) {
      user.value = new UserModel(userData)
    } else {
      user.value = null
    }
  }

  function logout() {
    user.value = null
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