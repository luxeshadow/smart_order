<template>
  <div class="stat-wrapper">
    <div class="balance-card">
      <div class="balance-content">
        <span class="label">Solde Total</span>
        <div class="amount-row">
          <span class="currency">XOF</span>
          <h1 class="amount">{{ totalBalance.toLocaleString() }}</h1>
        </div>
      </div>
      <div class="glow-effect"></div>
    </div>

    <div class="flows-grid">
      <div class="flow-item deposit">
        <div class="icon-circle">
          <i class="fi fi-rr-arrow-trend-up"></i>
        </div>
        <div class="flow-info">
          <span class="flow-label">Dépôts</span>
          <span class="flow-value">{{ totalDeposit.toLocaleString() }}</span>
        </div>
      </div>

      <div class="flow-item withdrawal">
        <div class="icon-circle">
          <i class="fi fi-rr-arrow-trend-down"></i>
        </div>
        <div class="flow-info">
          <span class="flow-label">Retraits</span>
          <span class="flow-value">{{ totalWithdrawal.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AppColor } from '@/core/constants/app_colors'

const totalDeposit = ref(25000)
const totalWithdrawal = ref(10500)

const totalBalance = computed(() => totalDeposit.value - totalWithdrawal.value)
</script>

<style scoped>
.stat-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* CARTE BALANCE : Style Dark & Pro */
.balance-card {
  background-color: v-bind('AppColor.tertiary.base'); /* Noir mat */
  border-radius: 24px;
  padding: 30px 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.balance-content {
  position: relative;
  z-index: 2;
}

.label {
  color: v-bind('AppColor.surface.bone');
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.amount-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 8px;
}

.currency {
  color: v-bind('AppColor.primary.base'); /* Ton orange */
  font-weight: 700;
  font-size: 14px;
}

.amount {
  color: #FFFFFF;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1px;
}

/* Effet de lumière orange en fond */
.glow-effect {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 150px;
  height: 150px;
  background: v-bind('AppColor.primary.base');
  filter: blur(80px);
  opacity: 0.3;
}

/* GRILLE DE FLUX : Style épuré */
.flows-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.flow-item {
  background-color: v-bind('AppColor.surface.pure');
  padding: 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid v-bind('AppColor.surface.bone');
}

.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.deposit .icon-circle {
  background-color: #E8F5E9;
  color: v-bind('AppColor.status.success');
}

.withdrawal .icon-circle {
  background-color: #FFEBEE;
  color: v-bind('AppColor.status.error');
}

.flow-info {
  display: flex;
  flex-direction: column;
}

.flow-label {
  font-size: 11px;
  color: v-bind('AppColor.tertiary.soft');
  font-weight: 500;
}

.flow-value {
  font-size: 14px;
  font-weight: 700;
  color: v-bind('AppColor.tertiary.charcoal');
}
</style>