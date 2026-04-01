<script setup lang="ts">
import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'
import Button from '@/core/components/client/Button.vue'
import Input from '@/core/components/client/Input.vue'
import { useToast } from '@/core/utils/useToast'

const { showToast } = useToast()
const router = useRouter()

const form = ref({
  phoneNumber: '',
  amount: '',
  method: 'tmoney' 
})

const isLoading = ref(false)

const paymentMethods = [
  { id: 'tmoney', label: 'T-Money', image: AppImage.Yas },
  { id: 'flooz', label: 'Moov Money (Flooz)', image: AppImage.Flooz }
]

const handleDeposit = async () => {
  if (!form.value.phoneNumber || !form.value.amount) {
    showToast("Veuillez remplir tous les champs", "fi-rr-info", "error", "#ff4757")
    return
  }
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    showToast("Demande de recharge envoyée !", "fi-rr-check", "success", "#2ecc71")
    setTimeout(() => { router.push('/home') }, 1500)
  } catch (error) {
    showToast("Erreur lors de la transaction", "fi-rr-shield-exclamation", "error", "#ff4757")
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="deposit-page">
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
          <div class="select-wrapper">
            <i class="fi fi-rr-wallet left-icon"></i>
            <select v-model="form.method" class="main-select">
              <option v-for="m in paymentMethods" :key="m.id" :value="m.id">
                {{ m.label }}
              </option>
            </select>
            <i class="fi fi-rr-angle-small-down arrow-icon"></i>
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
        label="Lancer la recharge"
        :loading="isLoading"
        @click="handleDeposit"
      />

      <div class="footer-link">
        <NuxtLink to="/home" class="back-link">
           Retour à l'accueil
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Conteneur principal */
.deposit-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa; /* Fond gris sur PC */
  padding: 20px;
}

/* Carte */
.deposit-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 40px 30px;
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
}

/* --- RESPONSIVE MOBILE --- */
@media (max-width: 600px) {
  .deposit-page {
    background-color: white;
    align-items: flex-start;
    padding: 0;
  }
  .deposit-card {
    box-shadow: none;
    border-radius: 0;
    padding: 40px 20px;
    max-width: 100%;
  }
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.app-logo {
  height: 80px;
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
}

.subtitle {
  color: #95a5a6;
  font-size: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

/* Style de la liste déroulante pour matcher tes Inputs */
.custom-select-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.select-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 52px;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  background-color: #fff;
  padding: 0 16px;
  transition: all 0.2s ease;
}

.left-icon {
  margin-right: 12px;
  font-size: 18px;
  color: #a0a0a0;
}

.main-select {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1a1a1a;
  appearance: none; /* Cache la flèche par défaut */
  cursor: pointer;
}

.arrow-icon {
  position: absolute;
  right: 16px;
  pointer-events: none;
  color: #a0a0a0;
}

.select-wrapper:focus-within {
  border-color: v-bind('AppColor.primary.base');
}

.footer-link {
  margin-top: 25px;
  text-align: center;
}

.back-link {
  font-size: 14px;
  font-weight: 600;
  color: #bdc3c7;
  text-decoration: none;
}

.back-link:hover {
  color: v-bind('AppColor.primary.base');
}
</style>