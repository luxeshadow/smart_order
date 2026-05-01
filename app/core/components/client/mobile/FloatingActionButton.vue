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


const isOpen = ref(false)
const showAlert = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const toggleMenu = () => {
  isOpen.value = !isOpen.value

  if (!isOpen.value) {
    showAlert.value = false
  }
}

const actions = [
  { id: 'Transact', name: 'Transact', icon: AppIcon.order, route: '/transaction/history-transaction' },
  { id: 'Vente', name: 'Vente', icon: AppIcon.box, route: '/order/my-order' },
  { id: 'Parametre', name: 'Parametre', icon: AppIcon.user, route: '/auth/profile' },
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

  timer = setTimeout(() => {
    showAlert.value = false
  }, 5000)
}

watch(() => route.fullPath, () => {
  isOpen.value = false
  showAlert.value = false

  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})

watch(isAuthenticated, () => {
  isOpen.value = false
  showAlert.value = false
})

onMounted(() => {
  isOpen.value = false
  showAlert.value = false
})

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

    <!-- Backdrop avec transition Fade et Blur -->
    <Transition name="fade">
      <div v-if="isOpen" class="fab-backdrop" @click="toggleMenu"></div>
    </Transition>

    <div class="fab-orbit-menu" :class="{ 'is-open': isOpen }">
      <div v-for="(action, index) in actions" :key="action.id" class="orbit-item">
        <!-- Bouton avec effet Glass -->
        <div @click="handleActionClick(action.route)" class="action-btn-glass">
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
/* --- EFFET GLASSMORPHISM SUR TES BOUTONS --- */
.action-btn-glass {
  cursor: pointer;
  width: 62px; 
  height: 62px;
  /* Fond semi-transparent + flou de vitre */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  /* Bordure fine pour l'effet reflet */
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}

.action-btn-glass:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.9);
}

.fab-container {
  position: fixed;
  bottom: 30px;
  right: 15px;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 10;
  backdrop-filter: blur(3px); /* Ajoute un léger flou au reste de l'app */
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
  background-color: #2d3436; /* Optionnel : changement de couleur quand ouvert */
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

/* Tes coordonnées d'orbite sont préservées ici */
.fab-orbit-menu.is-open .orbit-item:nth-child(1) { transform: translate(0px, -95px); }
.fab-orbit-menu.is-open .orbit-item:nth-child(2) { transform: translate(-70px, -70px); }
.fab-orbit-menu.is-open .orbit-item:nth-child(3) { transform: translate(-95px, 0px); }

.action-icon { font-size: 18px; color: v-bind('AppColor.primary.base'); margin-bottom: 2px; }
.action-label { font-size: 9px; font-weight: 800; color: #1e272e; }

/* Animation Fade pour le fond */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>