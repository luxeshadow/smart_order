<script setup lang="ts">
import { AppColor } from '@/core/constants/app_colors'

defineProps({
  title: {
    type: String,
    default: 'Smart Orders'
  }
})
</script>

<template>
  <nav class="app-bar">
    <div class="app-bar-content">
      <h1 class="app-title">{{ title }}</h1>

      <div class="notification-box">
        <div class="notification-wrapper">
          <i class="fi fi-rr-bell bell-icon"></i>
          <span class="notification-dot"></span>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-bar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 65px;
  background-color: v-bind('AppColor.surface.pure');
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
  padding: 0 20px;
  box-sizing: border-box;
}

.app-bar-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 800; /* Un peu plus gras pour le style */
  color: v-bind('AppColor.tertiary.base');
  margin: 0;
  letter-spacing: -0.8px;
}

/* LE BOX AUTOUR */
.notification-box {
  background-color: #f8f9fa; /* Fond très léger */
  border: 1px solid #eee;    /* Bordure fine */
  border-radius: 14px;       /* Arrondi moderne */
  padding: 4px;
  transition: all 0.2s ease;
}

.notification-box:hover {
  background-color: #f0f0f0;
  border-color: #e0e0e0;
}

.notification-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
}

.bell-icon {
  font-size: 20px;
  color: #333;
}

.notification-dot {
  position: absolute;
  top: 3px;
  right: 9px;
  width: 9px;
  height: 9px;
  background-color: v-bind('AppColor.primary.base');
  border: 2.5px solid #f8f9fa; /* Match avec le fond du box */
  border-radius: 50%;
}
</style>