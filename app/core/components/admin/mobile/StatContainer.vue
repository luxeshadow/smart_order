<template>
  <div class="stats-container">
    <div class="finance-card">
      <div class="stat-item">
        <span class="label">Total Deposit</span>
        <span class="value success">{{ totalDeposit.toLocaleString() }} XOF</span>
      </div>
      
      <div class="divider"></div>

      <div class="stat-item">
        <span class="label">Total Withdrawal</span>
        <span class="value error">{{ totalWithdrawal.toLocaleString() }} XOF</span>
      </div>

      <div class="balance-badge">
        <span class="label">Total Balance</span>
        <span class="balance-value">{{ totalBalance.toLocaleString() }} XOF</span>
      </div>
    </div>

    <h3 class="section-title">Mes Boutiques</h3>
    <div class="shops-grid">
      <div v-for="shop in shops" :key="shop.name" class="shop-card">
        <div class="shop-header">
          <span class="shop-name">{{ shop.name }}</span>
          <span class="shop-count">{{ shop.userCount }} commandés</span>
        </div>
        
        <div class="shop-details">
          <div class="detail">
            <i class="fi fi-rr-tag"></i>
            <span>{{ shop.price.toLocaleString() }} XOF</span>
          </div>
          <div class="detail">
            <i class="fi fi-rr-box"></i>
            <span>{{ shop.ordersPerDay }} cmd/jour</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AppColor } from '@/core/constants/app_colors'

// Données financières
const totalDeposit = ref(25000)
const totalWithdrawal = ref(10500)

// Calcul automatique de la balance (Deposit - Withdrawal)
const totalBalance = computed(() => totalDeposit.value - totalWithdrawal.value)

// Données des boutiques Smart Order
const shops = ref([
  { name: 'Amazon', userCount: 12, price: 5000, ordersPerDay: 10 },
  { name: 'Temu', userCount: 2, price: 1500, ordersPerDay: 5 },
  { name: 'Alibaba', userCount: 4, price: 10000, ordersPerDay: 20 },
  { name: 'Costco', userCount: 23, price: 50000, ordersPerDay: 50 },
])
</script>

<style scoped>
.stats-container {
  padding: 16px;
  background-color: v-bind('AppColor.surface.off');
}

/* Carte Finance */
.finance-card {
  background-color: v-bind('AppColor.surface.pure');
  border-radius: 20px;
  padding: 20px;
  border: 1px solid v-bind('AppColor.surface.bone');
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 13px;
  color: v-bind('AppColor.tertiary.soft');
  font-weight: 500;
}

.value {
  font-weight: 700;
  font-size: 16px;
}

.success { color: v-bind('AppColor.status.success'); }
.error { color: v-bind('AppColor.status.error'); }

.divider {
  height: 1px;
  background-color: v-bind('AppColor.surface.smoke');
}

.balance-badge {
  background-color: v-bind('AppColor.primary.light');
  padding: 12px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px dashed v-bind('AppColor.primary.accent');
}

.balance-value {
  font-size: 18px;
  font-weight: 800;
  color: v-bind('AppColor.primary.dark');
}

/* Grille des Boutiques */
.section-title {
  margin: 24px 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: v-bind('AppColor.tertiary.charcoal');
}

.shops-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.shop-card {
  background-color: v-bind('AppColor.surface.pure');
  padding: 14px;
  border-radius: 16px;
  border: 1px solid v-bind('AppColor.surface.bone');
}

.shop-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.shop-name {
  font-weight: 700;
  font-size: 14px;
  color: v-bind('AppColor.tertiary.base');
}

.shop-count {
  font-size: 10px;
  color: v-bind('AppColor.primary.base');
  font-weight: 600;
}

.shop-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: v-bind('AppColor.tertiary.soft');
}

.detail i {
  font-size: 12px;
  color: v-bind('AppColor.secondary.base');
}

.shop-card:active {
  transform: scale(0.97);
  background-color: v-bind('AppColor.surface.smoke');
}
</style>