<script setup lang="ts">
import { ResetPasswordUseCase } from '../../application/usecases/reset_password_usecase'
import { ResetPasswordRepositoryImpl } from '../../data/repositories/reset_password_repository_impl'
import { Failure } from '@/core/errors/failure'

const { showToast } = useToast()
const router = useRouter()

// Initialisation Clean Arch
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
  <div class="auth-page">
    <div class="auth-card">
      <div class="logo-container">
        <img :src="AppImage.Logo" alt="Logo" class="app-logo" />
      </div>

      <header class="header-content">
        <h2 class="title">Nouveau mot de passe</h2>
        <p class="subtitle">Choisissez un mot de passe sécurisé pour votre compte.</p>
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
          Annuler et revenir
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
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

.logo-container {
  text-align: center;
  margin-bottom: 10px;
}

.app-logo {
  height: 80px;
  width: auto;
}

.header-content {
  text-align: center;
  width: 100%;
}

.title {
  font-size: 22px;
  font-weight: 800;
  color: #2d3436;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin-bottom: 25px;
  line-height: 1.5;
}

.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.footer-link {
  margin-top: 25px;
  font-size: 14px;
}

.login-link {
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 600px) {
  .auth-page {
    background-color: white;
    align-items: flex-start;
    padding-top: 40px;
  }

  .auth-card {
    box-shadow: none;
    border-radius: 0;
    padding: 20px;
    max-width: 100%;
  }
}
</style>