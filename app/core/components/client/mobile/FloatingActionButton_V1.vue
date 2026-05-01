<script setup lang="ts">
import { ref, onUnmounted, onMounted, watch } from 'vue'
import { storeToRefs } from "pinia"
import { useRoute, useRouter } from 'vue-router'
import { AppIcon } from '@/core/constants/app_icons'
import { AppColor } from '@/core/constants/app_colors'
import { useAuthStore } from "@/features/auth/presentation/stores/auth_store"
import AuthAlert from "./AuthAlert.vue"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const isOpen = ref(false)
const showAlert = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  if (!isOpen.value) showAlert.value = false
}

const actions = [
  { id: 'vente', name: 'Vente', icon: AppIcon.box, route: '/order/my-order', color: '#6c5ce7' },
  { id: 'historique', name: 'Historique', icon: AppIcon.order, route: '/transaction/history-transaction', color: '#00b894' },
  { id: 'parametre', name: 'Profil', icon: AppIcon.user, route: '/auth/profile', color: '#0984e3' }
]

const handleActionClick = (path: string) => {
  isOpen.value = false
  showAlert.value = false
  if (!isAuthenticated.value) {
    triggerAlert()
    return
  }
  router.push(path)
}

const triggerAlert = () => {
  if (timer) clearTimeout(timer)
  showAlert.value = true
  timer = setTimeout(() => { showAlert.value = false }, 5000)
}

// Nettoyage automatique
watch(() => route.fullPath, () => { isOpen.value = false; showAlert.value = false })
onUnmounted(() => { if (timer) clearTimeout(timer) })
</script>

<template>
  <div class="fab-wrapper">
    <AuthAlert :show="showAlert" @close="showAlert = false" />

    <!-- Backdrop avec flou élégant -->
    <Transition name="fade">
      <div v-if="isOpen" class="fab-overlay" @click="toggleMenu" />
    </Transition>

    <div class="fab-container" :class="{ 'is-open': isOpen }">
      
      <!-- Menu des actions -->
      <div class="actions-stack">
        <TransitionGroup name="pop">
          <div
            v-if="isOpen"
            v-for="(action, index) in actions"
            :key="action.id"
            class="action-item"
            :style="{ '--delay': index }"
            @click="handleActionClick(action.route)"
          >
            <span class="action-label">{{ action.name }}</span>
            <div class="action-icon-wrapper" :style="{ backgroundColor: action.color }">
              <i :class="action.icon"></i>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Bouton Principal (Trigger) -->
      <button 
        class="main-fab" 
        @click="toggleMenu"
        :aria-label="isOpen ? 'Fermer' : 'Ouvrir'"
      >
        <div class="icon-box">
          <i :class="AppIcon.add" class="icon-plus"></i>
          <i :class="AppIcon.cross" class="icon-close"></i>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.fab-wrapper {
  position: fixed;
  inset: 0;
  pointer-events: none; /* Laisse passer les clics quand fermé */
  z-index: 3000;
}

.fab-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  pointer-events: auto;
}

.fab-container {
  position: absolute;
  right: 20px;
  bottom: 24px;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* --- LE BOUTON PRINCIPAL --- */
.main-fab {
  width: 65px;
  height: 65px;
  border-radius: 20px;
  background: v-bind('AppColor.primary.base');
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 25px -5px v-bind('AppColor.primary.base + "66"'), 
              0 8px 10px -6px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 100;
}

.main-fab:active {
  transform: scale(0.9);
}

.icon-box {
  position: relative;
  width: 24px;
  height: 24px;
}

.icon-plus, .icon-close {
  position: absolute;
  inset: 0;
  font-size: 24px;
  transition: all 0.4s ease;
}

.icon-close {
  transform: scale(0) rotate(-90deg);
  opacity: 0;
}

.is-open .icon-plus {
  transform: scale(0) rotate(90deg);
  opacity: 0;
}

.is-open .icon-close {
  transform: scale(1) rotate(0);
  opacity: 1;
}

.is-open .main-fab {
  background: #2d3436; /* Changement de couleur à l'ouverture */
  transform: translateY(-5px);
}

/* --- LES ACTIONS --- */
.actions-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.action-item:active {
  transform: scale(0.95);
}

.action-label {
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #2d3436;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  opacity: 0.95;
}

.action-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

/* --- ANIMATIONS POP --- */
.pop-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition-delay: calc(var(--delay) * 0.08s);
}

.pop-leave-active {
  transition: all 0.2s ease;
  transition-delay: calc((2 - var(--delay)) * 0.05s);
}

.pop-enter-from, .pop-leave-to {
  opacity: 0;
  transform: scale(0.4) translateY(40px);
}

/* --- FADE --- */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .fab-container { right: 16px; bottom: 16px; }
  .main-fab { width: 58px; height: 58px; border-radius: 18px; }
  .action-icon-wrapper { width: 48px; height: 48px; border-radius: 14px; }
}
</style>