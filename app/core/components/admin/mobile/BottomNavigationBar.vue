<template>
  <nav class="bottom-nav">
    <div 
      class="nav-item" 
      :class="{ 'active': activeTab === 'dashboard' }"
      @click="activeTab = 'dashboard'"
    >
      <i class="fi fi-rr-apps"></i>
      <span v-if="activeTab === 'dashboard'" class="nav-text">Dashboard</span>
    </div>

    <div 
      class="nav-item" 
      :class="{ 'active': activeTab === 'manager' }"
      @click="activeTab = 'manager'"
    >
      <i class="fi fi-rr-briefcase"></i>
      <span v-if="activeTab === 'manager'" class="nav-text">Manager</span>
    </div>

    <div 
      class="nav-item" 
      :class="{ 'active': activeTab === 'settings' }"
      @click="activeTab = 'settings'"
    >
      <i class="fi fi-rr-settings"></i>
      <span v-if="activeTab === 'settings'" class="nav-text">Settings</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AppColor } from '@/core/constants/app_colors'

const activeTab = ref('dashboard')
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background-color: v-bind('AppColor.surface.pure');
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20px;
  border-top: 1px solid v-bind('AppColor.surface.bone');
  z-index: 100;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: v-bind('AppColor.tertiary.soft');
}

.nav-item i {
  font-size: 20px;
}

.nav-item.active {
  background-color: v-bind('AppColor.primary.base');
  color: v-bind('AppColor.surface.pure');
  gap: 8px;
}

.nav-text {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

/* Animation au clic */
.nav-item:active {
  transform: scale(0.9);
}
</style>