<script setup lang="ts">
import { AppColor } from '@/core/constants/app_colors'

defineProps({
  stockValue: {
    type: String,
    default: "1,250,000"
  },
  currentAssets: {
    type: String,
    default: "3,945"
  }
})

const levels = [
  { id: 1, price: '10K' },
  { id: 2, price: '20K' },
  { id: 3, price: '30K' },
  { id: 4, price: '40K' },
]
</script>

<template>
  <div class="dashboard-section">
    <div class="levels-row">
      <div v-for="lvl in levels" :key="lvl.id" class="level-badge">
        <span class="lvl-text">NIV {{ lvl.id }}</span>
        <span class="lvl-price">{{ lvl.price }}</span>
      </div>
    </div>

    <div class="stat-container">
      <div class="stat-card">
        <p class="stat-title">Stock Value</p>
        <div class="stat-content">
          <h2 class="stat-value">{{ stockValue }}</h2>
          <span class="stat-unit">XOF</span>
        </div>
      </div>

      <div class="stat-card">
        <p class="stat-title">Current Assets</p>
        <div class="stat-content">
          <h2 class="stat-value">{{ currentAssets }}</h2>
          <span class="stat-unit">QTE</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-section {
  padding: 0 15px;
}

.levels-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 5px;
}

.level-badge {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Fond coloré léger basé sur ta couleur primaire */
  background: v-bind('AppColor.primary.light + "15"'); 
  /* Bordure plus visible */
  border: 1.5px solid v-bind('AppColor.primary.light');
  padding: 10px 4px;
  border-radius: 16px;
  min-width: 65px;
  transition: all 0.3s ease;
}

/* Effet au clic ou survol pour le côté "premium" */
.level-badge:hover {
  background: v-bind('AppColor.primary.base');
  border-color: v-bind('AppColor.primary.base');
}

.level-badge:hover .lvl-text, 
.level-badge:hover .lvl-price {
  color: white;
}

.lvl-text {
  font-size: 8px;
  font-weight: 900;
  /* Texte un peu plus foncé pour le contraste */
  color: v-bind('AppColor.primary.base');
  text-transform: uppercase;
  margin-bottom: 2px;
  opacity: 0.8;
}

.lvl-price {
  font-size: 12px;
  font-weight: 900;
  /* Utilisation de ta couleur tertiaire ou primaire pour le prix */
  color: v-bind('AppColor.tertiary.base');
}

/* Le reste des stats reste inchangé car il est déjà propre */
.stat-container {
  display: flex;
  gap: 12px;
  width: 100%;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 22px;
  padding: 16px 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  color: #a0a0a0;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 19px;
  font-weight: 900;
  color: v-bind('AppColor.tertiary.base');
}

.stat-unit {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  background: v-bind('AppColor.primary.light + "30"');
  color: v-bind('AppColor.primary.base');
  border-radius: 8px;
  margin-top: 6px;
  width: fit-content;
}
</style>