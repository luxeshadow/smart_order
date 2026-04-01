<script setup lang="ts">
import Button from '@/core/components/client/Button.vue'
import Input from '@/core/components/client/Input.vue'
import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'
import { useToast } from '@/core/utils/useToast'
import { Failure } from '@/core/errors/failure'

// Importations Clean Arch
import { ForgotPasswordUseCase } from '../../application/usecases/forgot_password_usecase'
import { ForgotPasswordRepositoryImpl } from '../../data/repositories/forgot_password_repository_impl'

const { showToast } = useToast()
const router = useRouter()

// Initialisation Clean Arch
const repository = new ForgotPasswordRepositoryImpl()
const forgotPasswordUseCase = new ForgotPasswordUseCase(repository)

const email = ref('')
const isLoading = ref(false)
const isEmailSent = ref(false)

const handleResetPassword = async () => {
  if (!email.value) {
    showToast("Veuillez entrer votre adresse email", "fi-rr-info", "error", "#ff4757")
    return
  }

  isLoading.value = true

  try {
    const result = await forgotPasswordUseCase.execute({
      email: email.value
    })

    if (result instanceof Failure) {
      showToast(result.message, "fi-rr-cross-circle", "error", "#ff4757")
      isLoading.value = false
    } else {
      isEmailSent.value = true
      showToast("Lien de récupération envoyé !", "fi-rr-paper-plane", "success", "#2ecc71")
      isLoading.value = false
    }
    
  } catch (error) {
    isLoading.value = false
    showToast("Une erreur est survenue lors de la connexion", "fi-rr-shield-exclamation", "error", "#ff4757")
  }
}
</script>

<template>
  <div class="forgot-password-page">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
      <span class="app-bar-title">Récupération</span>
      <div class="spacer"></div>
    </nav>

    <div class="auth-card">
      <div class="logo-container">
        <img :src="AppImage.Logo" alt="Logo" class="app-logo" />
      </div>

      <header class="header-content" v-if="!isEmailSent">
        <h2 class="title">Mot de passe oublié ?</h2>
        <p class="subtitle">Entrez votre email pour recevoir un lien de récupération.</p>
      </header>

      <header class="header-content" v-else>
        <h2 class="title">Vérifiez vos emails</h2>
        <p class="subtitle">
          Un lien a été envoyé à <br>
          <strong :style="{ color: AppColor.primary.base }">{{ email }}</strong>
        </p>
      </header>

      <div class="form-group" v-if="!isEmailSent">
        <Input
          id="email"
          label="Adresse Email*"
          type="email"
          v-model="email"
          icon="fi-rr-at"
          placeholder="votre@email.com"
        />
      </div>

      <div class="button-group">
        <Button
          v-if="!isEmailSent"
          label="Envoyer le lien"
          :loading="isLoading"
          @click="handleResetPassword"
        />

        <Button
          v-else
          label="Retour à la connexion"
          @click="router.push('/auth/login')"
        />
      </div>

      <div class="footer-link" v-if="!isEmailSent">
        <span>Vous vous en souvenez ?</span>
        <NuxtLink to="/auth/login" class="login-link" :style="{ color: AppColor.primary.base }">
          Se connecter
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
.forgot-password-page {
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
  display: flex;
  justify-content: center;
  gap: 8px;
}

.login-link {
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* Responsive */
@media (max-width: 600px) {
  .forgot-password-page {
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