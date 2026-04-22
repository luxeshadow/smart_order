<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Button from '@/core/components/client/mobile/Button.vue'
import Input from '@/core/components/client/mobile/Input.vue'
import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'
import { useToast } from '@/core/utils/useToast'

import { UpdateProfileUseCase } from '../../application/usecases/update_user_usecase'
import { UpdateProfileRepositoryImpl } from '../../data/repositories/update_user_repository_impl'
import { Failure } from '@/core/errors/failure'

const { showToast } = useToast()
const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const repository = new UpdateProfileRepositoryImpl()
const updateProfileUseCase = new UpdateProfileUseCase(repository)

const isLoading = ref(false)

const originalEmail = computed(
  () => user.value?.email?.trim().toLowerCase() || ''
)

const form = ref({
  userName: '',
  email: '',
  phoneNumber: ''
})

watch(
  user,
  (newUser) => {
    if (!newUser) return

    form.value = {
      userName: newUser.username || '',
      email: newUser.email || '',
      phoneNumber: newUser.phoneNumber || ''
    }
  },
  { immediate: true }
)

const handleUpdateProfile = async () => {
  if (!user.value) return

  isLoading.value = true

  const normalizedFormEmail = form.value.email.trim().toLowerCase()
  const hasEmailChanged = normalizedFormEmail !== originalEmail.value

  const param = {
    userId: user.value.id,
    userName: form.value.userName,
    phoneNumber: form.value.phoneNumber,
    email: form.value.email,
    currentEmail: originalEmail.value
  }

  try {
    const result = await updateProfileUseCase.execute(param)

    if (result instanceof Failure) {
      showToast(result.message, 'fi-rr-cross-circle', 'error')
      isLoading.value = false
      return
    }

    if (hasEmailChanged) {
      showToast(
        'Veuillez valider votre nouvel email',
        'fi-rr-envelope-dot',
        'success'
      )

      setTimeout(() => {
        router.push({
          path: '/auth/verify-otp',
          query: {
            email: form.value.email,
            type: 'email_change'
          }
        })
        isLoading.value = false
      }, 1500)

      return
    }
    authStore.updateUser({
      username: form.value.userName,
      phoneNumber: form.value.phoneNumber,
      email: form.value.email
    })

    showToast('Profil mis à jour avec succès !', 'fi-rr-check', 'success')

    setTimeout(() => {
      router.back()
      isLoading.value = false
    }, 1500)

  } catch (error) {
    isLoading.value = false
    showToast(
      'Une erreur inattendue est survenue',
      'fi-rr-shield-exclamation',
      'error'
    )
  }
}
</script>

<template>
  <div class="Update-profile-page">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
      <span class="app-bar-title">Modifier Profil</span>
      <div class="spacer"></div>
    </nav>

    <div class="content-container">
      <div class="avatar-Update-section">
        <div class="avatar-wrapper">
          <img
            :src="
              AppImage.Profile ||
              'https://ui-avatars.com/api/?name=' + form.userName
            "
            alt="Profile"
            class="profile-img"
          />
          <div
            class="Update-badge"
            :style="{ backgroundColor: AppColor.primary.base }"
          >
            <i class="fi fi-rr-camera"></i>
          </div>
        </div>
        <p class="avatar-hint">Identité de votre compte</p>
      </div>

      <div class="form-group">
        <Input
          id="user"
          label="Nom d'utilisateur*"
          v-model="form.userName"
          icon="fi-rr-user"
          placeholder="Votre pseudo"
        />

        <Input
          id="email"
          label="Adresse Email*"
          v-model="form.email"
          icon="fi-rr-at"
          type="email"
          placeholder="votre@email.com"
        />

        <Input
          id="phone"
          label="Téléphone*"
          type="tel"
          v-model="form.phoneNumber"
          icon="fi-rr-phone-call"
          placeholder="+228..."
        />
      </div>

      <div
        class="info-box"
        v-if="form.email.trim().toLowerCase() !== originalEmail"
      >
        <i class="fi fi-rr-info"></i>
        <p>
          Le changement d'email nécessitera une nouvelle vérification par code
          OTP.
        </p>
      </div>

      <div class="action-footer">
        <Button
          :label="
            form.email.trim().toLowerCase() !== originalEmail
              ? 'Vérifier email'
              : 'Enregistrer'
          "
          :loading="isLoading"
          @click="handleUpdateProfile"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.Update-profile-page {
  min-height: 100vh;
  background-color: #fff;
  padding-top: 80px;
}

/* --- APP BAR --- */
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
  width: 45px; height: 45px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}

.app-bar-title {
  flex: 1; text-align: center;
  font-weight: 800; font-size: 17px;
  color: #111;
}

.spacer { width: 45px; }

/* --- CONTENU --- */
.content-container {
  padding: 20px;
  max-width: 450px;
  margin: 0 auto;
}

.avatar-Update-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 35px;
}

.avatar-wrapper {
  position: relative;
  width: 100px; height: 100px;
  margin-bottom: 10px;
}

.profile-img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 30px;
  border: 3px solid #f8f9fa;
}

.Update-badge {
  position: absolute;
  bottom: -2px; right: -2px;
  width: 32px; height: 32px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  border: 3px solid white;
}

.avatar-hint { font-size: 12px; color: #aaa; font-weight: 600; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.info-box {
  display: flex;
  gap: 10px;
  padding: 12px;
  background-color: #fff9eb;
  border-radius: 12px;
  border: 1px solid #ffeaa7;
  margin-bottom: 25px;
}

.info-box i { color: #f1c40f; margin-top: 2px; }
.info-box p { font-size: 12px; color: #8a6d3b; font-weight: 600; margin: 0; line-height: 1.4; }

.action-footer { margin-top: 10px; }

@media (max-width: 600px) {
  .content-container { padding: 15px; }
}
</style>