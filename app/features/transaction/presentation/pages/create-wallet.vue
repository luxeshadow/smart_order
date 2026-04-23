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
import { getSmsService } from '@/services/sms/sms'

// 🔥 init services
const smsService = getSmsService()
const router = useRouter()
const { showToast } = useToast()
const authStore = useAuthStore()

const walletRepository = new WalletRepositoryImpl()
const walletUseCase = new CreateWalletUseCase(walletRepository)

// 🔥 state
const form = ref({
  phoneNumber: '',
  withdrawPassword: ''
})

const isLoading = ref(false)

// 🔥 UI data
const availableMethods = [
  { id: 'tmoney', image: AppImage.Yas, label: 'T-Money' },
  { id: 'flooz', image: AppImage.Flooz, label: 'Moov' },
  { id: 'ria', image: AppImage.Ria, label: 'Ria' }
]

// 🚀 ACTION
const handleUpdateWallet = async () => {
  if (!authStore.user?.id) {
    showToast('Session expirée', 'fi-rr-lock', 'error', '#ff4757')
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

    try {
      const smsSent = await smsService.sendSms(
        form.value.phoneNumber,
        `SmartOrder : Votre portefeuille est configuré avec succès.
Pour retirer, transférez d'abord vos gains vers le solde principal depuis votre profil.`
      )

      if (!smsSent) {
        console.warn('SMS non envoyé')
      }
    } catch (smsError) {
      console.warn('Erreur SMS:', smsError)
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
          <img :src="AppImage.Money" class="gif-player" alt="Wallet Animation" />
        </div>
      </div>

      <header class="header-content">
        <h2 class="title">Paramètres de retrait</h2>
        <p class="subtitle">Gérez vos informations de paiement</p>
      </header>

      <div class="form-group">
        <Input
          id="phone"
          label="Numéro de téléphone*"
          v-model="form.phoneNumber"
          icon="fi-rr-phone-call"
          placeholder="Ex: 90 00 00 00"
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

        <div class="methods-section">
          <label class="section-label">Moyens de paiement acceptés</label>
          <div class="methods-display-grid">
            <div v-for="method in availableMethods" :key="method.id" class="static-method">
              <img :src="method.image" :alt="method.label" class="static-img" />
              <span>{{ method.label }}</span>
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
/* Tes styles restent identiques, ils sont déjà très propres */
.form-group {
  opacity: v-bind("isLoading ? 0.7 : 1");
  pointer-events: v-bind("isLoading ? 'none' : 'auto'");
  transition: all 0.3s ease;
}

/* AppBar & Base */
.app-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 65px; background: white;
  display: flex; align-items: center; padding: 0 15px;
  z-index: 1000; border-bottom: 1px solid #f1f1f1;
}

.back-btn {
  width: 45px; height: 45px;
  background-color: #f8f9fa; border: 1px solid #eee; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #2d3436; cursor: pointer;
}

.app-bar-title { flex: 1; text-align: center; font-weight: 700; font-size: 17px; }
.spacer { width: 45px; }

.wallet-page {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; background-color: #f8f9fa;
  padding: 70px 15px 40px 15px;
}

.wallet-card {
  width: 100%; max-width: 420px; background: white;
  padding: 5px 15px 27px 15px; border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
}

.video-wrapper {
  padding: 0 0 10px 0;
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
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(0deg, rgba(0,0,0,0.05) 0%, transparent 100%);
  z-index: 1;
  pointer-events: none;
}

.gif-player {
  width: 100%;
  height: 100%;
  object-fit: cover; 
  display: block;
}

.header-content { text-align: start; margin-bottom: 25px; }
.title { font-size: 22px; font-weight: 800; color: #2d3436; }
.subtitle { color: #95a5a6; font-size: 14px; }

.form-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px; }

/* Section Moyens de paiement statiques */
.methods-section { display: flex; flex-direction: column; gap: 12px; }
.section-label { font-size: 14px; font-weight: 600; color: #333; }
.methods-display-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
.static-method {
  background: #f8f9fa; border: 1.5px solid #f1f1f1; border-radius: 12px;
  padding: 10px 5px; display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.static-img { width: 30px; height: 30px; object-fit: cover; border-radius: 6px; }
.static-method span { font-size: 11px; font-weight: 700; color: #7f8c8d; }

@media (max-width: 600px) {
  .wallet-page { background-color: white; align-items: flex-start; padding-top: 75px; }
  .wallet-card { box-shadow: none; border-radius: 0; padding: 10px 0; }
  .video-container { aspect-ratio: 21 / 9; }
}
</style>