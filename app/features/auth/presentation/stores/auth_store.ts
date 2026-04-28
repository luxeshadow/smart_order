import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserModel } from '../../data/models/user_model'
import type { User } from '../../domain/entities/user'
import { useApi } from '@/core/constants/supabase_client'

export const useAuthStore = defineStore('auth', () => {

  const user = ref<UserModel | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role)

  const initUser = () => {

    if (import.meta.server) return

    const savedUser = localStorage.getItem('smart_order_user')

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        user.value = new UserModel(parsed)
      } catch (e) {
        localStorage.removeItem('smart_order_user')
      }
    }
  }

  function setUser(userData: User | null) {

    if (import.meta.server) return

    if (userData) {

      user.value = new UserModel(userData)

      localStorage.setItem(
        'smart_order_user',
        JSON.stringify(userData)
      )

    } else {

      user.value = null

      localStorage.removeItem('smart_order_user')
    }
  }

  function updateUser(updatedData: Partial<User>) {

    if (!user.value || import.meta.server) return

    const updatedUser = {
      ...user.value,
      ...updatedData
    }

    user.value = new UserModel(updatedUser)

    localStorage.setItem(
      'smart_order_user',
      JSON.stringify(updatedUser)
    )
  }

  async function logout() {

    const supabase = useApi()

    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Erreur logout Supabase', e)
    }

    user.value = null

    if (import.meta.client) {
      localStorage.removeItem('smart_order_user')
    }

    navigateTo('/auth/login')
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    initUser,
    setUser,
    updateUser,
    logout
  }
})