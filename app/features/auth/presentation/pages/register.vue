<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Button from '@/core/components/client/mobile/Button.vue'
import Input from '@/core/components/client/mobile/Input.vue'

import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'

import { RegisterUseCase } from '../../application/usecases/register_usecase'
import { RegisterRepositoryImpl } from '../../data/repositories/register_repository_impl'

import { Failure, UserUnconfirmedFailure } from '@/core/errors/failure'
import { useToast } from '../../../../core/utils/useToast'

const { showToast } = useToast()

const router = useRouter()
const route = useRoute()

const repository = new RegisterRepositoryImpl()
const registerUseCase = new RegisterUseCase(repository)

const form = ref({
  userName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const referredBy = ref<string | null>(null)

const loadReferral = async () => {
  const referralCode = route.query.ref as string | undefined

  console.log('REF CODE =>', referralCode)

  if (!referralCode) return

  referredBy.value = referralCode
}

onMounted(() => {
  loadReferral()
})

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    const msg = "Les mots de passe ne correspondent pas"

    errorMessage.value = msg

    showToast(
      msg,
      'fi-rr-triangle-warning',
      'error'
    )

    return
  }

  errorMessage.value = null
  isLoading.value = true

  try {
    const result = await registerUseCase.execute({
      userName: form.value.userName,
      email: form.value.email,
      phoneNumber: form.value.phoneNumber,
      password: form.value.password,
      referredBy: referredBy.value
    })

    if (result instanceof Failure) {
      if (result instanceof UserUnconfirmedFailure) {
        showToast(
          "Un compte existe déjà avec cet e-mail. Un nouveau code OTP vous a été envoyé.",
          "fi-rr-info",
          "normal"
        )

        setTimeout(() => {
          router.push({
            path: '/auth/verify-otp',
            query: {
              email: result.email
            }
          })

          isLoading.value = false
        }, 1500)

        return
      }

      errorMessage.value = result.message

      showToast(
        result.message,
        'fi-rr-cross-circle',
        'error'
      )

      isLoading.value = false
      return
    }

    showToast(
      "Inscription réussie ! Veuillez valider le code OTP envoyé par e-mail.",
      "fi-rr-check",
      "success"
    )

    setTimeout(() => {
      router.push({
        path: '/auth/verify-otp',
        query: {
          email: form.value.email
        }
      })

      isLoading.value = false
    }, 1500)

  } catch (error) {
    isLoading.value = false

    showToast(
      "Une erreur inattendue est survenue",
      "fi-rr-shield-exclamation",
      "error"
    )
  }
}
</script>

<template>
  <div class="register-page">
    <div class="auth-card">
      <div class="logo-container">
        <img :src="AppImage.Logo" alt="Logo" class="app-logo" />
      </div>

      <header class="header-content">
        <p class="subtitle">Créez votre compte en quelques secondes</p>
      </header>

      <div class="form-group">
        <Input id="user" label="Nom d'utilisateur*" v-model="form.userName" icon="fi-rr-user" />
        <Input id="email" label="Email*" v-model="form.email" icon="fi-rr-at" />

        <Input id="phone" label="Téléphone*" type="tel" v-model="form.phoneNumber" icon="fi-rr-phone-call" />

        <Input id="pass" label="Mot de passe*" type="password" v-model="form.password" icon="fi-rr-lock" />

        <Input id="confirm-pass" label="Confirmer le mot de passe*" type="password" v-model="form.confirmPassword"
          icon="fi-rr-lock" />
      </div>

      <Button label="S'inscrire" :loading="isLoading" @click="handleRegister" />

      <div class="footer-link">
        <span>Déjà membre ?</span>
        <NuxtLink to="/auth/login" class="login-link" :style="{ color: AppColor.primary.base }">
          Se connecter
        </NuxtLink>
      </div>
    </div>
  </div>
</template>



<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 10px;
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

.logo-container {
  margin-bottom: 10px;
}

.app-logo {
  height: 80px;
  width: auto;
  object-fit: contain;
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
  /* Ajout d'un petit gap pour l'harmonie */
  margin-bottom: 20px;
}

.footer-link {
  margin-top: 25px;
  font-size: 14px;
  display: flex;
  gap: 8px;
}

.login-link {
  font-weight: 700;
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

.login-link:hover {
  opacity: 0.8;
}

/* --- RESPONSIVE MOBILE --- */
@media (max-width: 600px) {
  .register-page {
    background-color: white;
    /* Fond blanc mobile */
    align-items: flex-start;
    padding: 0;
  }

  .auth-card {
    box-shadow: none;
    border-radius: 0;
    padding: 30px 20px;
    max-width: 100%;
  }
}
</style>