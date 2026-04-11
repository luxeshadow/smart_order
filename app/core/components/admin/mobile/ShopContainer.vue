<template>
  <div class="shop-section">
    <h3 class="section-title">Mes Boutiques</h3>
    <div class="shops-grid">
      <div v-for="shop in shops" :key="shop.name" class="shop-card">
        <div class="shop-header">
          <span class="shop-name">{{ shop.name }}</span>
          <span class="shop-count">{{ shop.userCount }} utilisateur</span>
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
import { ref } from 'vue'
import { AppColor } from '@/core/constants/app_colors'

const shops = ref([
  { name: 'Amazon', userCount: 12, price: 5000, ordersPerDay: 10 },
  { name: 'Temu', userCount: 2, price: 1500, ordersPerDay: 5 },
  { name: 'Alibaba', userCount: 4, price: 10000, ordersPerDay: 20 },
  { name: 'Costco', userCount: 23, price: 50000, ordersPerDay: 50 },
])
</script>

<style scoped>
.shop-section{
    margin: 5px;
}
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
  transition: transform 0.2s;
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