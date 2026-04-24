<script setup lang="ts">
import { ref, onUnmounted, onMounted, watch } from 'vue'
import { storeToRefs } from "pinia"
import { useRoute, useRouter } from 'vue-router'
import { AppIcon } from '@/core/constants/app_icons'
import { useAuthStore } from "@/features/auth/presentation/stores/auth_store"
import AuthAlert from "./AuthAlert.vue"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

// 🔥 state
const isOpen = ref(false)
const showAlert = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

// 🔥 toggle menu sécurisé
const toggleMenu = () => {
  isOpen.value = !isOpen.value

  // sécurité : si on ferme → on nettoie
  if (!isOpen.value) {
    showAlert.value = false
  }
}

// 🔥 actions
const actions = [
  { id: 'Transact', name: 'Transact', icon: AppIcon.order, route: '/transaction/history-transaction' },
  { id: 'Vente', name: 'Vente', icon: AppIcon.box, route: '/order/my-order' },
  { id: 'Parametre', name: 'Parametre', icon: AppIcon.user, route: '/auth/profile' },
]

// 🔥 protection navigation
const handleActionClick = (path: string) => {
  // 🔴 fermeture FORCÉE (important)
  isOpen.value = false
  showAlert.value = false

  if (!isAuthenticated.value) {
    triggerAlert()
    return
  }

  router.push(path)
}

// 🔥 alert contrôlée
const triggerAlert = () => {
  if (timer) clearTimeout(timer)

  showAlert.value = true

  timer = setTimeout(() => {
    showAlert.value = false
  }, 5000)
}

// 🔥 CRITIQUE : reset quand route change
watch(() => route.fullPath, () => {
  isOpen.value = false
  showAlert.value = false

  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})

// 🔥 CRITIQUE : reset quand auth change (login/logout)
watch(isAuthenticated, () => {
  isOpen.value = false
  showAlert.value = false
})

// 🔥 sécurité au montage
onMounted(() => {
  isOpen.value = false
  showAlert.value = false
})

// 🔥 nettoyage
onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})
</script>

<template>
  <div class="fab-container">
    <AuthAlert :show="showAlert" @close="showAlert = false" />

    <Transition name="fade">
      <div v-if="isOpen" class="fab-backdrop" @click="toggleMenu"></div>
    </Transition>

    <div class="fab-orbit-menu" :class="{ 'is-open': isOpen }">
      <div v-for="action in actions" :key="action.id" class="orbit-item">
        <div @click="handleActionClick(action.route)" class="action-btn">
          <i :class="action.icon" class="action-icon"></i>
          <span class="action-label">{{ action.name }}</span>
        </div>
      </div>
    </div>

    <button 
      class="fab-trigger" 
      :class="{ 'is-active': isOpen }" 
      @click="toggleMenu"
    >
      <i :class="isOpen ? AppIcon.cross : AppIcon.add" class="trigger-icon"></i>
    </button>
  </div>
</template>

<style scoped>
/* Garde ton CSS identique, assure-toi juste que .action-btn a un cursor: pointer */
.action-btn {
  cursor: pointer; /* Ajouté pour le feedback visuel */
  width: 60px; 
  height: 60px;
  background-color: v-bind('AppColor.surface.pure');
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.action-btn:active {
  transform: scale(0.9);
}

/* Le reste de ton CSS est parfait */
.fab-container {
  position: fixed;
  bottom: 30px;
  right: 15px;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-backdrop {
  position: fixed;
  top: 0; /* Changé à 0 pour couvrir toute l'alerte si besoin */
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
  backdrop-filter: blur(2px);
}

.fab-trigger {
  width: 70px;
  height: 70px;
  background-color: v-bind('AppColor.primary.base');
  color: white;
  border: none;
  border-radius: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  z-index: 30;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-trigger.is-active {
  transform: rotate(45deg);
  border-radius: 18px;
}

.fab-orbit-menu {
  position: absolute;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  opacity: 0;
  visibility: hidden;
  transition: all 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fab-orbit-menu.is-open {
  opacity: 1;
  visibility: visible;
}

.orbit-item {
  position: absolute;
  transition: all 0.4s ease-out;
}

.fab-orbit-menu.is-open .orbit-item:nth-child(1) { transform: translate(0px, -95px); }
.fab-orbit-menu.is-open .orbit-item:nth-child(2) { transform: translate(-70px, -70px); }
.fab-orbit-menu.is-open .orbit-item:nth-child(3) { transform: translate(-95px, 0px); }

.action-icon { font-size: 18px; color: v-bind('AppColor.primary.base'); margin-bottom: 2px; }
.action-label { font-size: 9px; font-weight: 800; color: #333; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>