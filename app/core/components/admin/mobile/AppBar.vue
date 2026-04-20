<template>
  <nav class="app-bar">
    <div class="profile-pill">
      <div class="avatar-container">
        <img :src="AppImage.Profile" alt="Profile" class="avatar-img">
      </div>
      <span class="user-id">{{ formattedUserId }}</span>
      <button class="copy-btn" @click="copyId">
        <i class="fi fi-rr-copy"></i>
      </button>
    </div>

    <div class="actions-group">
      <button class="action-btn" @click="">
        <i class="fi fi-rr-document-signed"></i>
      </button>

      <button class="action-btn relative" @click="">
        <i class="fi fi-rr-bell"></i>
        <span v-if="hasNotifications" class="notification-dot"></span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'
import { useToast } from '@/core/utils/useToast'

const userId = ref("81449240")
const hasNotifications = ref(true)
const { showToast } = useToast()

const formattedUserId = computed(() => {
  return userId.value.length > 6 
    ? `${userId.value.slice(0, 6)}**${userId.value.slice(-2)}` 
    : userId.value
})

const copyId = async () => {
  await navigator.clipboard.writeText(userId.value)
  showToast("ID copié !", "fi-rr-check", "success")
}
</script>

<style scoped>
.app-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: v-bind('AppColor.surface.off + "CC"');
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.profile-pill {
  display: flex;
  align-items: center;
  background-color: v-bind('AppColor.surface.pure');
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  border: 1px solid v-bind('AppColor.surface.bone');
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.avatar-container {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background-color: v-bind('AppColor.surface.smoke');
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Fix pour l'affichage de l'image statique */
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Important pour ne pas écraser l'image */
  display: block;
}

.user-id {
  margin-left: 8px;
  font-size: 13px; /* Légèrement réduit pour le mobile */
  font-weight: 700;
  color: v-bind('AppColor.tertiary.base');
}

.copy-btn {
  background: none;
  border: none;
  margin-left: 6px;
  color: v-bind('AppColor.primary.base'); /* Mis en couleur primaire pour plus de visibilité */
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.actions-group {
  display: flex;
  gap: 12px;
}

.action-btn {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: v-bind('AppColor.surface.pure');
  border-radius: 14px; /* Carré arrondi plus moderne que le rond parfait */
  border: 1px solid v-bind('AppColor.surface.bone');
  color: v-bind('AppColor.tertiary.base');
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.9);
  background-color: v-bind('AppColor.surface.smoke');
}

.notification-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 10px;
  height: 10px;
  background-color: v-bind('AppColor.primary.base');
  border: 2px solid v-bind('AppColor.surface.pure');
  border-radius: 50%;
}

.relative {
  position: relative;
}
</style>