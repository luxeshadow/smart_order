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
</script>

<template>
  <div class="dashboard-section">
    <h1 class="section-title"></h1>
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

.section-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 15px;
  color: v-bind('AppColor.tertiary.base');
}

.stat-container {
  display: flex;
  gap: 12px; /* Espace entre les deux cartes */
  width: 100%;
}

.stat-card {
  flex: 1; /* Force les deux cartes à prendre 50% chacune */
  background: v-bind('AppColor.surface.pure');
  border-radius: 20px; /* Plus arrondi pour le look moderne */
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
  flex-direction: column; /* Valeur au dessus de l'unité pour gagner de la place en largeur */
  align-items: flex-start;
}

.stat-value {
  font-size: 18px; /* Un peu plus petit pour tenir sur une ligne sur mobile */
  font-weight: 800;
  margin: 0;
  color: v-bind('AppColor.tertiary.base');
  word-break: break-all;
}

.stat-unit {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  background: rgba(255, 152, 0, 0.1); /* Fond léger orange */
  color: v-bind('AppColor.primary.base');
  border-radius: 6px;
  margin-top: 4px;
  display: inline-block;
}

/* On vire le responsive qui mettait en colonne */
</style>