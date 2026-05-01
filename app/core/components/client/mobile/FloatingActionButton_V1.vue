<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
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

  if (!isOpen.value) {
    showAlert.value = false
  }
}

const actions = [
  {
    id: 'vente',
    name: 'Vente',
    icon: AppIcon.box,
    route: '/order/my-order'
  },
  {
    id: 'historique',
    name: 'Historique',
    icon: AppIcon.order,
    route: '/transaction/history-transaction'
  },
  {
    id: 'parametre',
    name: 'Parametre',
    icon: AppIcon.user,
    route: '/auth/profile'
  }
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

// RESET ROUTE
watch(() => route.fullPath, () => {

  isOpen.value = false
  showAlert.value = false
})

onUnmounted(() => {

  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="fab-wrapper">

    <AuthAlert
      :show="showAlert"
      @close="showAlert = false"
    />

    <!-- OVERLAY -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fab-overlay"
        @click="toggleMenu"
      />
    </Transition>

    <div class="fab-container">

      <!-- ACTIONS -->
      <TransitionGroup
        name="pop"
        tag="div"
        class="actions-stack"
      >

        <div
          v-for="(action, index) in isOpen ? actions : []"
          :key="action.id"
          class="action-item"
          :style="{ '--delay': index }"
          @click="handleActionClick(action.route)"
        >

          <span class="action-label">
            {{ action.name }}
          </span>

          <div class="action-icon-wrapper">

            <i :class="action.icon"></i>

          </div>

        </div>

      </TransitionGroup>

      <!-- MAIN BUTTON -->
      <button
        class="main-fab"
        :class="{ 'is-open': isOpen }"
        @click="toggleMenu"
        :aria-label="isOpen ? 'Fermer' : 'Ouvrir'"
      >

        <div class="icon-box">

          <i
            :class="AppIcon.add"
            class="icon-plus"
          ></i>

          <i
            :class="AppIcon.cross"
            class="icon-close"
          ></i>

        </div>

      </button>

    </div>

  </div>
</template>

<style scoped>
.fab-wrapper {
  position: fixed;

  right: 16px;

  bottom: calc(env(safe-area-inset-bottom) + 16px);

  z-index: 3000;

  pointer-events: none;
}

/* OVERLAY */
.fab-overlay {
  position: fixed;

  inset: 0;

  background: rgba(0, 0, 0, 0.28);

  backdrop-filter: blur(4px);

  pointer-events: auto;
}

/* CONTAINER */
.fab-container {
  position: relative;

  display: flex;

  flex-direction: column;

  align-items: flex-end;

  pointer-events: none;
}

/* MAIN FAB */
.main-fab {
  width: 82px;

  height: 82px;

  border-radius: 26px;

  background: linear-gradient(
    135deg,
    v-bind('AppColor.primary.base'),
    v-bind('AppColor.primary.dark')
  );

  border: none;

  color: white;

  display: flex;

  align-items: center;

  justify-content: center;

  cursor: pointer;

  pointer-events: auto;

  transition:
    background 0.25s ease,
    border-radius 0.25s ease;

  z-index: 100;

  -webkit-tap-highlight-color: transparent;

  backface-visibility: hidden;

  transform: translateZ(0);
}

.main-fab:active {
  transform: scale(0.96);
}

.icon-box {
  position: relative;

  width: 34px;

  height: 34px;
}

.icon-plus,
.icon-close {
  position: absolute;

  inset: 0;

  font-size: 34px;

  display: flex;

  align-items: center;

  justify-content: center;

  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.icon-close {
  opacity: 0;

  transform: rotate(-90deg) scale(0.5);
}

.main-fab.is-open .icon-plus {
  opacity: 0;

  transform: rotate(90deg) scale(0.5);
}

.main-fab.is-open .icon-close {
  opacity: 1;

  transform: rotate(0deg) scale(1);
}

.main-fab.is-open {
  background: linear-gradient(
    135deg,
    v-bind('AppColor.primary.dark'),
    #2d2d2d
  );
}

/* ACTIONS */
.actions-stack {
  display: flex;

  flex-direction: column;

  align-items: flex-end;

  gap: 16px;

  margin-bottom: 18px;

  pointer-events: none;
}

.action-item {
  display: flex;

  align-items: center;

  gap: 12px;

  cursor: pointer;

  pointer-events: auto;

  backface-visibility: hidden;

  transform: translateZ(0);
}

.action-item:active {
  transform: scale(0.96);
}

.action-label {
  background: white;

  padding: 8px 14px;

  border-radius: 12px;

  font-size: 13px;

  font-weight: 800;

  color: v-bind('AppColor.primary.dark');

  border: 1px solid v-bind('AppColor.primary.light');

  box-shadow:
    0 10px 25px rgba(0,0,0,0.08);
}

.action-icon-wrapper {
  width: 58px;

  height: 58px;

  border-radius: 18px;

  background: linear-gradient(
    135deg,
    v-bind('AppColor.primary.base'),
    v-bind('AppColor.primary.dark')
  );

  display: flex;

  align-items: center;

  justify-content: center;

  color: white;

  font-size: 22px;

  box-shadow:
    0 10px 24px rgba(255, 94, 0, 0.24);
}

/* POP */
.pop-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;

  transition-delay: calc(var(--delay) * 0.05s);
}

.pop-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;

  transform: translateY(12px) scale(0.92);
}

/* FADE */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* MOBILE */
@media (max-width: 600px) {

  .fab-wrapper {
    right: 16px;

    bottom: calc(env(safe-area-inset-bottom) + 16px);
  }

  .main-fab {
    width: 65px;

    height: 65px;

    border-radius: 18px;
  }

  .icon-box {
    width: 30px;

    height: 30px;
  }

  .icon-plus,
  .icon-close {
    font-size: 25px;
  }

  .action-icon-wrapper {
    width: 48px;

    height: 48px;

    border-radius: 16px;

    font-size: 18px;
  }
}
</style>