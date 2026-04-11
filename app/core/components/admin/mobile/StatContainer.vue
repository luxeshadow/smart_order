<template>
  <div class="stat-wrapper">
    <div class="balance-card">
      
      <div class="notch">
        <span class="date-text">{{ currentDate }}</span>
      </div>

      <div class="balance-content">
        <span class="label">Solde Total</span>
        <div class="amount-row">
          <span class="currency">XOF</span>
          <h1 class="amount">{{ totalBalance.toLocaleString() }}</h1>
        </div>
      </div>
      
      <div class="glow-effect"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AppColor } from '@/core/constants/app_colors'

const totalDeposit = ref(25000)
const totalWithdrawal = ref(10500)
const totalBalance = computed(() => totalDeposit.value - totalWithdrawal.value)

// Formatage de la date du jour (ex: 11 Avril 2026)
const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })
})
</script>

<style scoped>
.balance-card {
  background-color: v-bind('AppColor.tertiary.base');
  border-radius: 28px;
  padding: 40px 24px 30px 24px; /* Plus de padding top pour l'encoche */
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  margin-top: 20px; /* Espace pour laisser l'encoche respirer */
}

/* L'ENCOCHE STYLE SMARTPHONE */
.notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: v-bind('AppColor.tertiary.pure'); /* Noir profond */
  padding: 6px 20px;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  min-width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-top: none;
}

.date-text {
  color: v-bind('AppColor.primary.accent'); /* Orange clair pour la date */
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.balance-content {
  position: relative;
  z-index: 2;
  text-align: center; /* Centré pour aller avec l'encoche */
}

.label {
  color: v-bind('AppColor.surface.bone');
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  opacity: 0.6;
}

.amount-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.currency {
  color: v-bind('AppColor.primary.base');
  font-weight: 700;
  font-size: 16px;
}

.amount {
  color: #FFFFFF;
  font-size: 38px;
  font-weight: 900;
  letter-spacing: -1.5px;
}

.glow-effect {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 180px;
  height: 180px;
  background: v-bind('AppColor.primary.base');
  filter: blur(90px);
  opacity: 0.25;
  pointer-events: none;
}
</style>