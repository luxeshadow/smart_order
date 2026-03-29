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

      <div class="notification-wrapper">
        <i class="fi fi-rr-bell bell-icon"></i>
        <span class="notification-dot"></span>
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
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.5px;
}

.notification-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  transition: background-color 0.2s;
}

.notification-wrapper:hover {
  background-color: #f5f5f5;
}

.bell-icon {
  font-size: 22px;
  color: #333;
}

.notification-dot {
  position: absolute;
  top: 8px;
  right: 12px;
  width: 10px;
  height: 10px;
  background-color: v-bind('AppColor.primary.base');
  border: 2px solid v-bind('AppColor.surface.pure');
  border-radius: 50%;
}
</style>