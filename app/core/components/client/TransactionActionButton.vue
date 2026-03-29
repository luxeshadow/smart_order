<script setup lang="ts">
import { AppColor } from '@/core/constants/app_colors'
import { AppIcon } from '@/core/constants/app_icons'
</script>

<template>
  <div class="actions-section">
    <div class="actions-container">
      
      <NuxtLink to="/deposit" class="action-btn">
        <i :class="AppIcon.add" class="icon add"></i>
        <span>Dépôt</span>
      </NuxtLink>

      <NuxtLink to="/withdraw" class="action-btn">
        <i class="fi fi-rr-minus icon minus"></i>
        <span>Retrait</span>
      </NuxtLink>

    </div>
  </div>
</template>

<style scoped>
.actions-section {
  padding: 15px; 
}

.actions-container {
  display: flex;
  gap: 12px;
  width: 100%;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border-radius: 18px; /* Harmonisé avec tes stats et ton FAB */
  
  /* --- TRANSPARENCE TOTALE --- */
  background-color: transparent;
  background: transparent;
  
  /* Bordure et couleur orange */
  border: 1.5px solid v-bind('AppColor.primary.base');
  color: v-bind('AppColor.primary.base');
  
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon {
  font-size: 16px;
  display: flex;
  font-weight: 800; /* Icônes plus grasses */
}

/* INTERACTION (Feed-back tactile) */
.action-btn:active {
  transform: scale(0.97); /* Légère compression au clic */
  background-color: rgba(255, 152, 0, 0.05); /* Fond très léger juste au clic */
}

.action-btn:hover {
  background-color: rgba(255, 152, 0, 0.03); /* Un voile à peine visible au survol */
}
</style>