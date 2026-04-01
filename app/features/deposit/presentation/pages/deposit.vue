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

// Utilisation de tes constantes AppImage
const paymentMethods = [
  { 
    id: 'tmoney', 
    label: 'T-Money', 
    image: AppImage.Yas 
  },
  { 
    id: 'flooz', 
    label: 'Moov Money (Flooz)', 
    image: AppImage.Flooz 
  }
]

const handleDeposit = async () => {
  if (!form.value.phoneNumber || !form.value.amount) {
    showToast("Veuillez remplir tous les champs", "fi-rr-info", "error", "#ff4757")
    return
  }

  isLoading.value = true

  try {
    // Logique de recharge ici
    await new Promise(resolve => setTimeout(resolve, 2000))

    showToast("Demande de recharge envoyée !", "fi-rr-check", "success", "#2ecc71")
    
    setTimeout(() => {
      router.push('/home')
    }, 1500)

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
        <p class="subtitle">Sélectionnez votre moyen de paiement</p>
      </header>

      <div class="form-group">
        <div class="methods-grid">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id"
            class="method-item"
            :class="{ 'active': form.method === method.id }"
            @click="form.method = method.id"
          >
            <div class="img-wrapper">
               <img :src="method.image" :alt="method.label" class="method-img" />
            </div>
            <span class="method-label">{{ method.label }}</span>
            <div class="check-badge" v-if="form.method === method.id">
              <i class="fi fi-rr-check"></i>
            </div>
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
.deposit-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.deposit-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 40px 30px;
  border-radius: 30px;

}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.app-logo {
  height: 85px;
  width: auto;
}

.header-content {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 22px;
  font-weight: 800;
  color: #2d3436;
  margin-bottom: 6px;
}

.subtitle {
  color: #95a5a6;
  font-size: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 30px;
}

/* Grille des méthodes */
.methods-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 5px;
}

.method-item {
  position: relative;
  padding: 20px 10px;
  border: 2px solid #f1f2f6;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s ease;
}

.img-wrapper {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
    overflow: hidden;
    border-radius: 12px;
}

.method-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.method-label {
  font-size: 13px;
  font-weight: 700;
  color: #7f8c8d;
}

.method-item.active {
  border-color: v-bind('AppColor.primary.base');
  background-color: v-bind('AppColor.primary.base + "08"');
}

.method-item.active .method-label {
  color: v-bind('AppColor.primary.base');
}

.check-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: v-bind('AppColor.primary.base');
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  box-shadow: 0 4px 10px v-bind('AppColor.primary.base + "40"');
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
  transition: color 0.2s;
}

.back-link:hover {
  color: v-bind('AppColor.primary.base');
}
</style>