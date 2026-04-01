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
const isDropdownOpen = ref(false)

const paymentMethods = [
  { id: 'tmoney', label: 'T-Money', image: AppImage.Yas },
  { id: 'flooz', label: 'Moov Money (Flooz)', image: AppImage.Flooz }
]

// Calculer la méthode sélectionnée pour l'affichage
const selectedMethod = computed(() => 
  paymentMethods.find(m => m.id === form.value.method) || paymentMethods[0]
)

const selectMethod = (id: string) => {
  form.value.method = id
  isDropdownOpen.value = false
}

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

// Fermer le menu si on clique ailleurs
onMounted(() => {
  window.addEventListener('click', (e: any) => {
    if (!e.target.closest('.custom-select-group')) isDropdownOpen.value = false
  })
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
        label="Lancer la recharge"
        :loading="isLoading"
        @click="handleDeposit"
      />
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
  background-color: #1276da;
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

.logo-container { text-align: center; margin-bottom: 15px; }
.app-logo { height: 70px; }
.header-content { text-align: center; margin-bottom: 25px; }
.title { font-size: 22px; font-weight: 800; }
.subtitle { color: #95a5a6; font-size: 14px; }
.form-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 30px; }

/* Animation */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.2s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>