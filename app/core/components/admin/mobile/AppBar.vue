<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'
import { useToast } from '@/core/utils/useToast'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'
import { countPendingWithdrawals } from '@/core/utils/countPendingWithdrawals'

const authStore = useAuthStore()
const userId = ref("81449240")
const pendingCount = ref(0)

const { showToast } = useToast()

// Formatage de l'ID (ex: 814492**40)
const formattedUserId = computed(() => {
  return userId.value.length > 6
    ? `${userId.value.slice(0, 6)}**${userId.value.slice(-2)}`
    : userId.value
})

const copyId = async () => {
  await navigator.clipboard.writeText(userId.value)
  showToast("ID copié !", "fi-rr-check", "success")
}

const handleLogout = () => {
  authStore.logout()
}

// 🔥 Récupération du nombre de retraits en attente
const fetchPending = async () => {
  pendingCount.value = await countPendingWithdrawals()
}

onMounted(fetchPending)

// Optionnel : rafraîchir toutes les 30 secondes si besoin
</script>

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
      <button class="action-btn" @click="handleLogout">
        <i class="fi fi-rr-exit"></i>
      </button>

      <button class="action-btn relative">
        <i class="fi fi-rr-bell"></i>
        <span
          v-if="pendingCount > 0"
          class="notification-badge"
        >
          {{ pendingCount > 99 ? '99+' : pendingCount }}
        </span>
      </button>
    </div>
  </nav>
</template>

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

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.user-id {
  margin-left: 8px;
  font-size: 13px;
  font-weight: 700;
  color: v-bind('AppColor.tertiary.base');
}

.copy-btn {
  background: none;
  border: none;
  margin-left: 6px;
  color: v-bind('AppColor.primary.base');
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
  border-radius: 14px; /* Carré arrondi moderne */
  border: 1px solid v-bind('AppColor.surface.bone');
  color: v-bind('AppColor.tertiary.base');
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative; /* Pour le positionnement du badge */
}

.action-btn:active {
  transform: scale(0.9);
  background-color: v-bind('AppColor.surface.smoke');
}

/* 🔥 Style du badge de notification corrigé */
.notification-badge {
  position: absolute;
  top: -4px;      /* Légèrement au-dessus du bouton */
  right: -2px;    /* Légèrement à l'extérieur */
  width: 12px;
  height: 18px;
  padding: 0 4px;
  background-color: v-bind('AppColor.primary.base');
  color: white;

  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;

  animation: pulse-alert 2s infinite;
}

@keyframes pulse-alert {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.relative {
  position: relative;
}
</style>