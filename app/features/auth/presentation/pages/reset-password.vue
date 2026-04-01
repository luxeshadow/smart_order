<script setup lang="ts">
import Button from '@/core/components/client/Button.vue'
import Input from '@/core/components/client/Input.vue'
import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'
import { useToast } from '@/core/utils/useToast'
import { Failure } from '@/core/errors/failure'

import { ResetPasswordUseCase } from '../../application/usecases/reset_password_usecase'
import { ResetPasswordRepositoryImpl } from '../../data/repositories/reset_password_repository_impl'

const { showToast } = useToast()
const router = useRouter()

const repository = new ResetPasswordRepositoryImpl()
const resetPasswordUseCase = new ResetPasswordUseCase(repository)

const form = ref({
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)

const handleReset = async () => {
  isLoading.value = true

  try {
    const result = await resetPasswordUseCase.execute({
      password: form.password,
      confirmPassword: form.confirmPassword
    })

    if (result instanceof Failure) {
      showToast(result.message, "fi-rr-cross-circle", "error", "#ff4757")
    } else {
      showToast("Mot de passe modifié avec succès !", "fi-rr-check", "success", "#2ecc71")
      
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)
    }
  } catch (error) {
    showToast("Erreur lors de la modification", "fi-rr-cross-circle", "error", "#ff4757")
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="reset-password-page">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
      <span class="app-bar-title">Sécurité</span>
      <div class="spacer"></div>
    </nav>

    <div class="auth-card">
      <div class="logo-container">
        <img :src="AppImage.Logo" alt="Logo" class="app-logo" />
      </div>

      <header class="header-content">
        <h2 class="title">Nouveau mot de passe</h2>
        <p class="subtitle">Choisissez un mot de passe sécurisé pour protéger votre compte.</p>
      </header>

      <div class="form-group">
        <Input
          id="password"
          label="Nouveau mot de passe*"
          type="password"
          v-model="form.password"
          icon="fi-rr-lock"
          placeholder="••••••••"
        />

        <Input
          id="confirm-password"
          label="Confirmer le mot de passe*"
          type="password"
          v-model="form.confirmPassword"
          icon="fi-rr-shield-check"
          placeholder="••••••••"
        />
      </div>

      <Button
        label="Réinitialiser le mot de passe"
        :loading="isLoading"
        @click="handleReset"
      />

      <div class="footer-link">
        <NuxtLink to="/auth/login" class="login-link" :style="{ color: AppColor.primary.base }">
          Annuler et retourner
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* App Bar Style */
.app-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 65px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 15px;
  z-index: 1000;
  border-bottom: 1px solid #f1f1f1;
}

.back-btn {
  width: 45px;
  height: 45px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-bar-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 17px;
  color: #2d3436;
}

.spacer { width: 45px; }

/* Page & Card Style */
.reset-password-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 85px 20px 40px 20px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 40px 30px;
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.logo-container {
  text-align: center;
  margin-bottom: 15px;
}

.app-logo {
  height: 70px;
  width: auto;
}

.header-content {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  font-size: 22px;
  font-weight: 800;
  color: #2d3436;
  margin-bottom: 8px;
}

.subtitle {
  color: #95a5a6;
  font-size: 14px;
  line-height: 1.5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 25px;
}

.footer-link {
  margin-top: 25px;
  font-size: 14px;
  text-align: center;
}

.login-link {
  font-weight: 700;
  text-decoration: none;
}

/* Responsive */
@media (max-width: 600px) {
  .reset-password-page {
    background-color: white;
    align-items: flex-start;
    padding: 85px 20px 20px 20px;
  }
  .auth-card {
    box-shadow: none;
    border-radius: 0;
    padding: 20px 0;
  }
}
</style>