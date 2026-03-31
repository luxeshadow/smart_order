<script setup lang="ts">
import Button from '@/core/constants/components/client/Button.vue'
import Input from '@/core/constants/components/client/Input.vue'
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

// Initialisation des couches Clean Architecture
const repository = new LoginRepositoryImpl()
const loginUseCase = new LoginUseCase(repository)

const form = ref({
  identifier: '', // Peut être email ou téléphone
  password: ''
})

const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true

  // Détection automatique du type d'identifiant pour les params
  const isEmail = form.value.identifier.includes('@')
  const loginParams = {
    email: isEmail ? form.value.identifier : undefined,
    phoneNumber: !isEmail ? form.value.identifier : undefined,
    password: form.value.password
  }

  try {
    const result = await loginUseCase.execute(loginParams)

    if (result instanceof Failure) {
      showToast(result.message, 'fi-rr-cross-circle', 'error', '#ff4757')
      isLoading.value = false
      return
    }

    // 1. Nourrir le store Pinia avec l'utilisateur (incluant le token et le rôle)
    authStore.setUser(result)

    showToast(`Bienvenue, ${result.username} !`, "fi-rr-check", "success", "#2ecc71")

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
    showToast("Une erreur de connexion est survenue", "fi-rr-shield-exclamation", "error", "#ff4757")
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
        <p class="subtitle">Connectez-vous pour continuer</p>
      </header>

      <div class="form-group">
        <AuthInput
          id="identifier"
          label="Email ou Téléphone*"
          v-model="form.identifier"
          icon="fi-rr-user"
          placeholder="exemple@mail.com ou +225..."
        />

        <AuthInput
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

      <AuthButton
        label="Se connecter"
        :loading="isLoading"
        @click="handleLogin"
      />

      <div class="footer-link">
        <span>Nouveau ici ?</span>
        <NuxtLink to="/auth/register" class="register-link" :style="{ color: AppColor.primary.base }">
          Créer un compte
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  text-align: center;
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
}

.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 25px;
}

.forgot-password {
  text-align: right;
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
  transition: opacity 0.2s ease;
}

.register-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.app-logo {
  height: 80px;
  width: auto;
  margin-bottom: 10px;
}
</style>