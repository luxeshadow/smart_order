<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { AppImage } from '@/core/constants/app_images'
import Button from '@/core/components/client/mobile/Button.vue'
import Input from '@/core/components/client/mobile/Input.vue'
import { useToast } from '@/core/utils/useToast'
import { useAuthStore } from '../../../auth/presentation/stores/auth_store'
import { DepositUseCase } from '../../application/usecases/create_deposit_usecase'
import { DepositRepositoryImpl } from '../../data/repositories/create_deposit_repository_impl'
import { Failure } from '@/core/errors/failure'
import type { PaymentServiceInterface } from '@/services/payment/payment_interface'
import { PaygateService } from '~/services/payment/paygate/paygate_service'
import { CinetpayService } from '~/services/payment/cinetpay/cinetpay_service'

const { showToast } = useToast()

const router = useRouter()
const authStore = useAuthStore()

let paymentService: PaymentServiceInterface

paymentService = new PaygateService()
// paymentService = new CinetpayService()

const depositRepository = new DepositRepositoryImpl()
const depositUseCase = new DepositUseCase(depositRepository)

const form = ref({
  phoneNumber: '',
  amount: '',
  method: 'tmoney'
})

const isLoading = ref(false)
const isDropdownOpen = ref(false)
const countdown = ref(0)

let countdownInterval: ReturnType<typeof setInterval> | null = null

type PaymentMethod = {
  id: string
  label: string
  image: string
}

const paymentMethods: PaymentMethod[] = [
  { id: 'tmoney', label: 'T-Money', image: AppImage.Yas },
  { id: 'flooz', label: 'Moov Money', image: AppImage.Flooz }
]

const defaultMethod: PaymentMethod = {
  id: 'tmoney',
  label: 'T-Money',
  image: AppImage.Yas
}

const selectedMethod = computed<PaymentMethod>(() => {
  return paymentMethods.find(m => m.id === form.value.method) ?? defaultMethod
})

const buttonLabel = computed(() => {
  if (isLoading.value && countdown.value > 0) {
    return `Confirmation (${countdown.value}s)`
  }
  if (isLoading.value) {
    return 'Traitement...'
  }
  return 'Lancer la recharge'
})

const selectMethod = (id: string) => {
  form.value.method = id
  isDropdownOpen.value = false
}

const startCountdown = (seconds: number) => {
  countdown.value = seconds

  if (countdownInterval) clearInterval(countdownInterval)

  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      stopCountdown()
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  countdown.value = 0
}

const resetForm = () => {
  form.value = {
    phoneNumber: '',
    amount: '',
    method: 'tmoney'
  }
}

const handleDeposit = async () => {
  if (!authStore.user?.id) {
    showToast(
      'Utilisateur non connecté',
      'fi-rr-cross-circle',
      'error',
      '#ff4757'
    )
    return
  }

  const identifier = `TX-${Date.now()}`
  isLoading.value = true

  try {
    /**
     * ✅ 1) création dépôt local
     */
    const depositResult = await depositUseCase.execute({
      userId: String(authStore.user.id),
      depositPhoneNumber: form.value.phoneNumber,
      amount: Number(form.value.amount),
      method: form.value.method,
      referenceId: identifier
    })

    if (depositResult instanceof Failure) {
      throw new Error(depositResult.message)
    }

    /**
     * ✅ 2) création paiement dynamique
     */
    const paymentRes = await paymentService.createPayment({
      phone_number: form.value.phoneNumber,
      amount: Number(form.value.amount),
      network: form.value.method === 'flooz' ? 'FLOOZ' : 'TMONEY',
      description: 'Recharge de compte',
      identifier,
      email: authStore.user.email,
      name: authStore.user.username
    })

    showToast(
      'Validez le paiement sur votre téléphone',
      'fi-rr-mobile-button',
      'success',
      '#2ecc71'
    )

    /**
     * ✅ 3) attente confirmation
     */
    startCountdown(25)
    await new Promise(resolve => setTimeout(resolve, 15000))

    /**
     * ✅ 4) check status dynamique
     */
    const statusRes = await paymentService.checkPaymentStatus(
      String(paymentRes.tx_reference),
      identifier
    )

    if (
      statusRes.status !== 0 ||
      statusRes.transaction_status === 'rejected'
    ) {
      throw new Error(statusRes.message || 'Paiement échoué ou rejeté')
    }

    showToast(
      'Recharge réussie !',
      'fi-rr-check',
      'success',
      '#2ecc71'
    )

    resetForm()

    setTimeout(() => {
      router.push('/home')
    }, 1000)

  } catch (error: any) {
    resetForm()

    showToast(
      error.message || 'Erreur lors de la transaction',
      'fi-rr-shield-exclamation',
      'error',
      '#ff4757'
    )
  } finally {
    stopCountdown()
    isLoading.value = false
  }
}

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
  stopCountdown()
})
</script>
<template>
  <div class="deposit-page">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
      <span class="app-bar-title">Recharger</span>
      <div class="spacer"></div>
    </nav>

    <div class="deposit-card">
      <div class="logo-container">
        <img :src="AppImage.Logo" alt="Smart Order Logo" class="app-logo" />
      </div>

      <header class="header-content">
        <h2 class="title">Recharger mon compte</h2>
        <p class="subtitle">Complétez les informations ci-dessous</p>
      </header>

      <div class="form-group">
        <div class="custom-select-group">
          <label class="select-label">Méthode de paiement*</label>
          
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

        <Input
          id="phone"
          label="Numéro de téléphone*"
          v-model="form.phoneNumber"
          icon="fi-rr-phone-call"
          placeholder="Ex: 90 00 00 00"
          type="tel"
        />

        <Input
          id="amount"
          label="Montant (FCFA)*"
          v-model="form.amount"
          icon="fi-rr-stats"
          placeholder="Ex: 5000"
          type="number"
        />
      </div>

     <Button
  :label="buttonLabel"
  :loading="isLoading"
  :disabled="isLoading || countdown > 0"
  :class="{ 'pulse-btn': countdown > 0 }"
  @click="handleDeposit"/>

<p v-if="countdown > 0" class="timer-hint">
  Ne quittez pas cette page, confirmation en cours...
</p>
    </div>
  </div>
</template>

<style scoped>
/* AppBar */
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
  padding: 4px;
  transition: all 0.2s ease;
}

.app-bar-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 17px;
  color: #2d3436;
}

.spacer { width: 40px; }

/* Page & Card */
.deposit-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 85px 20px 40px 20px;
}

.deposit-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 40px 30px;
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
}

/* Custom Select CSS */
.custom-select-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.select-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.custom-select {
  position: relative;
  width: 100%;
}

.selected-option {
  height: 52px;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.is-open .selected-option {
  border-color: v-bind('AppColor.primary.base');
}

.method-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-img-mini {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 6px;
}

.options-menu {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  border: 1.px solid #eee;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 100;
  overflow: hidden;
}

.option-item {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.option-item:hover {
  background: #f8f9fa;
}

.check-icon {
  margin-left: auto;
  color: v-bind('AppColor.primary.base');
  font-size: 14px;
}

.arrow-icon {
  color: #a0a0a0;
  transition: transform 0.3s;
}

.is-open .arrow-icon {
  transform: rotate(180deg);
}

/* Responsive */
@media (max-width: 600px) {
  .deposit-page {
    background-color: white;
    align-items: flex-start;
    padding: 85px 20px 20px 20px;
  }
  .deposit-card {
    box-shadow: none;
    border-radius: 0;
    padding: 20px 0;
  }
}
.timer-hint {
  margin-top: 14px;
  text-align: center;
  font-size: 13px;
  color: #95a5a6;
  animation: fadePulse 1s infinite;
}

.pulse-btn {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.015);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadePulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
.logo-container { text-align: center; margin-bottom: 15px; }
.app-logo { height: 70px; }
.header-content { text-align: center; margin-bottom: 25px; }
.title { font-size: 22px; font-weight: 800; }
.subtitle { color: #95a5a6; font-size: 14px; }
.form-group { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }

/* Animation */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.2s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>