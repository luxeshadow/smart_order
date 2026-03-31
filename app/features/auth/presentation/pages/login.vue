<script setup lang="ts">
import Button from '@/core/components/client/Button.vue'
import Input from '@/core/components/client/Input.vue'
import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'
import { LoginUseCase } from '../../application/usecases/login_usecase'
import { LoginRepositoryImpl } from '../../data/repositories/login_repository_impl'
import { Failure } from '@/core/errors/failure'
import { useToast } from '../../../../core/utils/useToast'
import { useAuthStore } from '../stores/auth_store'

const { showToast } = useToast()
const router = useRouter()
const authStore = useAuthStore()

// Initialisation Clean Arch
const repository = new LoginRepositoryImpl()
const loginUseCase = new LoginUseCase(repository)

const form = ref({
  email: '',
  password: ''
})

const isLoading = ref(false)

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    showToast("Veuillez remplir tous les champs", "fi-rr-info", "error", "#ff4757")
    return
  }

  isLoading.value = true

  try {
    // Appel du UseCase avec uniquement l'email
    const result = await loginUseCase.execute({
      email: form.value.email,
      password: form.value.password
    })

    if (result instanceof Failure) {
      showToast(result.message, 'fi-rr-cross-circle', 'error', '#ff4757')
      isLoading.value = false
      return
    }

    // Mise à jour du store et redirection
    authStore.setUser(result)
    showToast(`Content de vous revoir, ${result.username} !`, "fi-rr-check", "success", "#2ecc71")

    setTimeout(() => {
      if (result.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/home')
      }
      isLoading.value = false
    }, 1500)

  } catch (error) {
    isLoading.value = false
    showToast("Erreur de connexion au serveur", "fi-rr-shield-exclamation", "error", "#ff4757")
  }
}
</script>

<template>
  <div class="login-page">
    <div class="auth-card">
      <div class="logo-container">
        <img :src="AppImage.Logo" alt="Logo" class="app-logo" />
      </div>

      <header class="header-content">
        <h2 class="title">Bon retour !</h2>
        <p class="subtitle">Connectez-vous à votre compte</p>
      </header>

      <div class="form-group">
        <Input
          id="email"
          label="Adresse Email*"
          type="email"
          v-model="form.email"
          icon="fi-rr-envelope"
          placeholder="votre@email.com"
        />

        <Input
          id="password"
          label="Mot de passe*"
          type="password"
          v-model="form.password"
          icon="fi-rr-lock"
          placeholder="••••••••"
        />
        
        <div class="forgot-password">
          <NuxtLink to="/auth/forgot-password" :style="{ color: AppColor.primary.base }">
            Mot de passe oublié ?
          </NuxtLink>
        </div>
      </div>

      <Button
        label="Se connecter"
        :loading="isLoading"
        @click="handleLogin"
      />

      <div class="footer-link">
        <span>Pas encore de compte ?</span>
        <NuxtLink to="/auth/register" class="register-link" :style="{ color: AppColor.primary.base }">
          S'inscrire
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Les styles restent identiques, j'ai juste ajusté les espacements */
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 15px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px 30px;
  border-radius: 28px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 24px;
  font-weight: 800;
  color: #2d3436;
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  font-size: 15px;
  margin-bottom: 25px;
  text-align: center;
}

.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.forgot-password {
  align-self: flex-end;
  font-size: 13px;
  margin-top: -5px;
}

.footer-link {
  margin-top: 25px;
  font-size: 14px;
  display: flex;
  gap: 8px;
}

.register-link {
  font-weight: 700;
  text-decoration: underline; 
  text-underline-offset: 4px;
}

.app-logo {
  height: 80px;
  width: auto;
  margin-bottom: 10px;
}
</style>