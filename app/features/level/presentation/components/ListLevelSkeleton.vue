<script setup lang="ts">
import { AppColor } from '@/core/constants/app_colors'
</script>

<template>
  <div class="skeleton-dashboard">
    <div class="skeleton-levels-row">
      <div v-for="i in 4" :key="i" class="skeleton-badge shimmer">
        <div class="skeleton-text-short"></div>
        <div class="skeleton-text-price"></div>
      </div>
    </div>

    
  </div>
</template>

<style scoped>
.skeleton-dashboard {
  padding: 0 15px;
  width: 100%;
}

/* Animation Shimmer */
.shimmer {
  position: relative;
  overflow: hidden;
  /* Utilisation de ta couleur smoke pour le fond */
  background: v-bind('AppColor.surface.smoke');
}

.shimmer::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.4) 20%,
    rgba(255, 255, 255, 0.7) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

/* Structure des badges */
.skeleton-levels-row {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.skeleton-badge {
  flex: 1;
  height: 50px;
  min-width: 65px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid v-bind('AppColor.surface.bone');
}

.skeleton-text-short {
  width: 30px;
  height: 8px;
  /* On utilise une variante de ta surface bone */
  background: v-bind('AppColor.surface.bone');
  border-radius: 4px;
}

.skeleton-text-price {
  width: 45px;
  height: 10px;
  background: v-bind('AppColor.surface.bone');
  opacity: 0.8;
  border-radius: 4px;
}

</style>