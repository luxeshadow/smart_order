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

/* Nouveau style pour les niveaux */
.levels-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto; /* Scroll si trop de niveaux sur petit écran */
  padding-bottom: 5px;
}

.level-badge {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #eee;
  padding: 8px 4px;
  border-radius: 12px;
  min-width: 65px;
}

.lvl-text {
  font-size: 9px;
  font-weight: 800;
  color: #999;
  text-transform: uppercase;
}

.lvl-price {
  font-size: 11px;
  font-weight: 900;
  color: v-bind('AppColor.tertiary.base');
}

/* Tes styles existants */
.stat-container {
  display: flex;
  gap: 12px;
  width: 100%;
}

.stat-card {
  flex: 1;
  background: v-bind('AppColor.surface.pure');
  border-radius: 20px;
  padding: 16px 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  color: #888;
  margin: 0 0 8px 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: v-bind('AppColor.tertiary.base');
}

.stat-unit {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  background: rgba(255, 152, 0, 0.1);
  color: v-bind('AppColor.primary.base');
  border-radius: 6px;
  margin-top: 4px;
  display: inline-block;
}
</style>