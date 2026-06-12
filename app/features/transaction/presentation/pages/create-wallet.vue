<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppImage } from '@/core/constants/app_images'
import Button from '@/core/components/client/mobile/Button.vue'
import Input from '@/core/components/client/mobile/Input.vue'
import { useToast } from '@/core/utils/useToast'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'
import { WalletRepositoryImpl } from '../../data/repositories/wallet_repository_impl'
import { CreateWalletUseCase } from '../../application/usecases/create_wallet_usecase'
import { Failure } from '@/core/errors/failure'
import { KingSmsService } from '../../../../services/sms/kingsms/kingsms_service'

const smsService = new KingSmsService()
const router = useRouter()
const { showToast } = useToast()

const authStore = useAuthStore()

const walletRepository = new WalletRepositoryImpl()
const walletUseCase = new CreateWalletUseCase(walletRepository)

const form = ref({
  phoneNumber: '',
  withdrawPassword: ''
})

const isLoading = ref(false)
const isCaptchaChecked = ref(false) // Gère le statut de validation du reCAPTCHA

const formatPhone = (phone: string) => {
  if (!phone) return ''
  return phone.startsWith('228') ? phone : `228${phone}`
}

const handleUpdateWallet = async () => {
  if (!authStore.user?.id) {
    showToast('Session expirée', 'fi-rr-lock', 'error', '#ff4757')
    return
  }

  // Vérification de la case à cocher reCAPTCHA
  if (!isCaptchaChecked.value) {
    showToast(
      'Veuillez valider le reCAPTCHA',
      'fi-rr-shield-exclamation',
      'error',
      '#ff4757'
    )
    return
  }

  isLoading.value = true

  try {
    const result = await walletUseCase.execute({
      userId: String(authStore.user.id),
      paymentAddress: form.value.phoneNumber,
      withdrawalPassword: form.value.withdrawPassword
    })

    if (result instanceof Failure) {
      throw new Error(result.message)
    }

    const phone = formatPhone(form.value.phoneNumber)

    const smsSent = await smsService.sendSms(
      phone,
      `SmartOrder : Ton portefeuille est bien configuré.
Les retraits se font depuis le solde principal.
Tu peux transférer tes gains vers ce solde depuis ton profil.`
    )

    if (!smsSent) {
      console.warn('SMS non envoyé')
    }

    showToast(
      'Portefeuille configuré avec succès !',
      'fi-rr-check',
      'success',
      '#2ecc71'
    )

    setTimeout(() => {
      router.back()
    }, 1500)

  } catch (error: any) {
    showToast(
      error.message || 'Impossible de mettre à jour le portefeuille',
      'fi-rr-shield-exclamation',
      'error',
      '#ff4757'
    )
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="wallet-page">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>

      <span class="app-bar-title">Mon Portefeuille</span>

      <div class="spacer"></div>
    </nav>

    <div class="wallet-card">
      <div class="video-wrapper">
        <div class="video-container">
          <div class="video-overlay"></div>

          <img
            :src="AppImage.Money"
            class="gif-player"
            alt="Wallet Animation"
          />
        </div>
      </div>

      <header class="header-content">
        <h2 class="title">Paramètres de retrait</h2>

        <p class="subtitle">
          Configurez votre portefeuille sécurisé
        </p>
      </header>

      <div class="form-group">
        <Input
          id="phone"
          label="Numéro de contact (Confirmation)*"
          v-model="form.phoneNumber"
          icon="fi-rr-phone-call"
          placeholder="Ex: 228xxxxxxxx"
          type="tel"
          :disabled="isLoading"
        />

        <Input
          id="withdraw-pass"
          label="Mot de passe de retrait*"
          v-model="form.withdrawPassword"
          icon="fi-rr-lock"
          placeholder="••••••••"
          type="password"
          :disabled="isLoading"
        />

        <div class="captcha-container">
          <div class="captcha">
            <div class="spinner">
              <label>
                <input 
                  type="checkbox" 
                  v-model="isCaptchaChecked" 
                  :disabled="isLoading || isCaptchaChecked"
                >
                <span class="checkmark"><span>&nbsp;</span></span>
              </label>
            </div>
            <div class="text">
              Je ne suis pas un robot
            </div>
            <div class="logo">
              <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA"/>
              <p>reCAPTCHA</p>
              <small>Confidentialité - Conditions</small>
            </div>
          </div>
        </div>
      </div>

      <Button
        label="Enregistrer les modifications"
        :loading="isLoading"
        @click="handleUpdateWallet"
      />
    </div>
  </div>
</template>

<style scoped>
.form-group {
  opacity: v-bind("isLoading ? 0.7 : 1");
  pointer-events: v-bind("isLoading ? 'none' : 'auto'");
  transition: all 0.3s ease;
}

/* AppBar & Base */
.app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
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
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #2d3436;
  cursor: pointer;
}

.app-bar-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 17px;
}

.spacer {
  width: 45px;
}

.wallet-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 70px 15px 40px 15px;
}

.wallet-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 5px 15px 27px 15px;
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
}

.video-wrapper {
  padding: 0 0 5px 0;
}

.video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 32 / 12;
  border-radius: 20px;
  overflow: hidden;
  background: #f8f9fa;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, transparent 100%);
  z-index: 1;
  pointer-events: none;
}

.gif-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.header-content {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  font-size: 22px;
  font-weight: 800;
  color: #2d3436;
}

.subtitle {
  color: #95a5a6;
  font-size: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 25px;
}

@media (max-width: 600px) {
  .wallet-page {
    background-color: white;
    align-items: flex-start;
    padding-top: 75px;
  }

  .wallet-card {
    box-shadow: none;
    border-radius: 0;
    padding: 10px 0;
  }

  .video-container {
    aspect-ratio: 21 / 9;
  }
}

/* ==========================================
   STYLE DU NOUVEAU GOOGLE reCAPTCHA DESIGN 
============================================= */
.captcha-container {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.captcha {
  background-color: #f9f9f9;
  border: 1px solid #d3d3d3;
  border-radius: 3px;
  color: #4c4a4b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 304px; /* Taille exacte du widget officiel Google */
  height: 74px;
  padding: 0 10px 0 14px;
  box-sizing: border-box;
  box-shadow: 0 0 4px rgba(0,0,0,0.05);
}

.text {
  font-size: 14px;
  font-weight: 400;
  font-family: 'Roboto', sans-serif;
  color: #2c2c2c;
  flex-grow: 1;
  margin-left: 14px;
}

.spinner {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

input[type="checkbox"] { 
  position: absolute; 
  opacity: 0; 
  z-index: -1; 
}

input[type="checkbox"]+.checkmark {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: #fff;
  border: 2px solid #c1c1c1;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

input[type="checkbox"]+.checkmark:hover {
  border-color: #b2b2b2;
}

input[type="checkbox"]+.checkmark span {
  position: relative;
  margin-top: -4px;
  transform: rotate(45deg);
  width: 5px;
  height: 10px;
  opacity: 0;
}

input[type="checkbox"]+.checkmark>span:after {
  content: '';
  position: absolute;
  display: block;
  height: 3px;
  bottom: 0; left: 0;
  background-color: #009b56;
}

input[type="checkbox"]+.checkmark>span:before {
  content: '';
  position: absolute;
  display: block;
  width: 3px;
  bottom: 0; right: 0;
  background-color: #009b56;
}

input[type="checkbox"]:checked+.checkmark { 
  animation: 2s spin forwards;
}

input[type="checkbox"]:checked+.checkmark>span { 
  animation: 1s fadein 1.9s forwards;
}

input[type="checkbox"]:checked+.checkmark>span:after { 
  animation: .3s bottomslide 2s forwards; 
}

input[type="checkbox"]:checked+.checkmark>span:before { 
  animation: .5s rightslide 2.2s forwards; 
}

@keyframes fadein {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes bottomslide {
  0% { width: 0; }
  100% { width: 100%; }
}

@keyframes rightslide {
  0% { height: 0; }
  100% { height: 100%; }
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.logo img {
  height: 32px;
  width: 32px;
}

.logo p {
  color: #555;
  margin: 0;
  font-size: 10px;
  font-weight: 500;
  margin: 2px 0 0px 0;
  font-family: 'Roboto', sans-serif;
}

.logo small {
  color: #9b9b9b;
  margin: 0;
  font-size: 8px;
  font-family: 'Roboto', sans-serif;
}

@keyframes spin {
  10% {
    width: 0; height: 0;
    border-width: 3px;
  }
  30% {
    width: 0; height: 0;
    border-radius: 50%;
    border-width: 12px;
    transform: rotate(0deg);
    border-color: #c7daf5;
  }
  50% {
    width: 24px; height: 24px;
    border-radius: 50%;
    border-width: 3px;
    border-color: #c7daf5;
    border-right-color: #4a90e2;
  }
  70% {
    border-width: 3px;
    border-color: #c7daf5;
    border-right-color: #4a90e2;
  }
  90% {
    border-width: 3px;
  }
  100% {
    width: 24px; height: 24px;
    border-radius: 50%;
    transform: rotate(720deg);
    border-color: transparent;
  }
}
</style>