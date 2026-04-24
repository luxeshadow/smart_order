<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'
import Button from '@/core/components/client/mobile/Button.vue'
import Input from '@/core/components/client/mobile/Input.vue'
import { useToast } from '@/core/utils/useToast'

import { WithdrawalUseCase } from '../../application/usecases/create_withdrawal_usecase'
import { WithdrawalRepositoryImpl } from '../../data/repositories/create_withdrawal_repository_impl'
import { Failure } from '@/core/errors/failure'
import { useAuthStore } from '../../../auth/presentation/stores/auth_store'

const { showToast } = useToast()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  amount: '',
  method: 'tmoney',
  firstName: '',
  lastName: '',
  password: ''
})

const isLoading = ref(false)
const isDropdownOpen = ref(false)

type PaymentMethod = {
  id: string
  label: string
  image: string
}

const paymentMethods: PaymentMethod[] = [
  { id: 'tmoney', label: 'T-Money', image: AppImage.Yas },
  { id: 'flooz', label: 'Moov Money (Flooz)', image: AppImage.Flooz },
  { id: 'ria', label: 'Ria Money Transfer', image: AppImage.Ria }
]

const defaultMethod: PaymentMethod = {
  id: 'tmoney',
  label: 'T-Money',
  image: AppImage.Yas
}

const selectedMethod = computed<PaymentMethod>(() => {
  return paymentMethods.find(m => m.id === form.value.method) ?? defaultMethod
})

const selectMethod = (id: string) => {
  form.value.method = id
  isDropdownOpen.value = false
}

const handleWithdraw = async () => {
  if (form.value.method === 'ria') {
    showToast("Ce service est actuellement indisponible", "fi-rr-info", "error")
    return
  }

  isLoading.value = true

  try {
    const repository = new WithdrawalRepositoryImpl()
    const withdrawalUseCase = new WithdrawalUseCase(repository)

    const result = await withdrawalUseCase.execute({
      userId: authStore.user?.id || '', 
      amount: Number(form.value.amount),
      method: form.value.method,
      password: form.value.password,
      firstName: form.value.firstName,
      lastName: form.value.lastName
    })

    if (result instanceof Failure) {
      showToast(result.message, "fi-rr-shield-exclamation", "error")
    } else {
      showToast("Demande de retrait envoyée avec succès !", "fi-rr-check", "success")
      
      setTimeout(() => {
        router.push('/home')
      }, 1500)
    }

  } catch (error: any) {
    showToast(
      error.message || "Une erreur inattendue est survenue", 
      "fi-rr-shield-exclamation", 
      "error"
    )
  } finally {
    isLoading.value = false
  }
}

// Fermeture du menu si clic extérieur
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.custom-select-group')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <div class="withdraw-page">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
      <span class="app-bar-title">Retrait</span>
      <div class="spacer"></div>
    </nav>

    <div class="withdraw-card">
      <div class="logo-container">
        <img :src="AppImage.Logo" alt="Smart Order Logo" class="app-logo" />
      </div>

      <header class="header-content">
        <h2 class="title">Retirer de l'argent</h2>
        <p class="subtitle">Choisissez votre mode de retrait préféré</p>
      </header>

      <Transition name="fade">
        <div v-if="form.method === 'ria'" class="alert-box">
          <i class="fi fi-rr-info"></i>
          <span>Les retraits via Ria sont suspendus pour le moment.</span>
        </div>
      </Transition>

      <div class="form-group">
        <div class="custom-select-group">
          <label class="select-label">Méthode de retrait*</label>
          <div class="custom-select" :class="{ 'is-open': isDropdownOpen }">
            <div class="selected-option" @click.stop="isDropdownOpen = !isDropdownOpen">
              <div class="method-info">
                <img :src="selectedMethod.image" class="method-img-mini" />
                <span>{{ selectedMethod.label }}</span>
              </div>
              <i class="fi fi-rr-angle-small-down arrow-icon"></i>
            </div>

            <Transition name="fade-slide">
              <div v-if="isDropdownOpen" class="options-menu">
                <div 
                  v-for="m in paymentMethods" 
                  :key="m.id" 
                  class="option-item"
                  @click="selectMethod(m.id)"
                >
                  <img :src="m.image" class="method-img-mini" />
                  <span>{{ m.label }}</span>
                  <i v-if="form.method === m.id" class="fi fi-rr-check check-icon"></i>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <template v-if="form.method === 'ria'">
          <Input
            id="lastname"
            label="Nom de famille*"
            v-model="form.lastName"
            icon="fi-rr-user"
            placeholder="Votre nom"
          />
          <Input
            id="firstname"
            label="Prénom*"
            v-model="form.firstName"
            icon="fi-rr-text"
            placeholder="Votre prénom"
          />
        </template>

        <Input
          id="amount"
          label="Montant à retirer (FCFA)*"
          v-model="form.amount"
          icon="fi-rr-stats"
          placeholder="Ex: 5000"
          type="number"
        />

        <Input
          id="password"
          label="Mots de passe du wallet*"
          v-model="form.password"
          icon="fi-rr-lock"
          placeholder="••••••••"
          type="password"
        />
      </div>

      <Button
        :label="form.method === 'ria' ? 'Indisponible' : 'Confirmer le retrait'"
        :loading="isLoading"
        :disabled="form.method === 'ria'"
        @click="handleWithdraw"
      />
    </div>
  </div>
</template>

<style scoped>
/* AppBar & Page Base */
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
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #2d3436; cursor: pointer;
}

.app-bar-title { flex: 1; text-align: center; font-weight: 700; font-size: 17px; }
.spacer { width: 45px; }

.withdraw-page {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; background-color: #f8f9fa;
  padding: 85px 20px 40px 20px;
}

.withdraw-card {
  width: 100%; max-width: 420px; background: white;
  padding: 40px 30px; border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
}

/* Alert Box */
.alert-box {
  background-color: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 12px 15px;
  border-radius: 12px;
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 20px; font-size: 13px; font-weight: 500;
}

/* Custom Select */
.custom-select-group { display: flex; flex-direction: column; gap: 8px; position: relative; }
.select-label { font-size: 14px; font-weight: 600; color: #333; }
.selected-option {
  height: 52px; border: 1.5px solid #e0e0e0; border-radius: 12px;
  padding: 0 16px; display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; background: white;
}
.is-open .selected-option { border-color: v-bind('AppColor.primary.base'); }
.method-info { display: flex; align-items: center; gap: 12px; }
.method-img-mini { width: 28px; height: 28px; object-fit: cover; border-radius: 6px; }

.options-menu {
  position: absolute; top: 83px; left: 0; right: 0;
  background: white; border-radius: 12px; border: 1px solid #eee;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 100; overflow: hidden;
}
.option-item { padding: 14px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
.option-item:hover { background: #f8f9fa; }
.check-icon { margin-left: auto; color: v-bind('AppColor.primary.base'); }
.arrow-icon { color: #a0a0a0; transition: transform 0.3s; }
.is-open .arrow-icon { transform: rotate(180deg); }

/* Form Layout */
.logo-container { text-align: center; margin-bottom: 15px; }
.app-logo { height: 70px; }
.header-content { text-align: center; margin-bottom: 25px; }
.title { font-size: 22px; font-weight: 800; color: #2d3436; }
.subtitle { color: #95a5a6; font-size: 14px; }
.form-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }

@media (max-width: 600px) {
  .withdraw-page { background-color: white; align-items: flex-start; padding: 85px 20px 20px 20px; }
  .withdraw-card { box-shadow: none; border-radius: 0; padding: 20px 0; }
}

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.2s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>