```vue
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
    name: 'Paramètre',
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

  if (timer) {

    clearTimeout(timer)
  }

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

    <AuthAlert
      :show="showAlert"
      @close="showAlert = false"
    />

    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fab-backdrop"
        @click="toggleMenu"
      />
    </Transition>

    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="fab-menu-line"
      >

        <div
          v-for="action in actions"
          :key="action.id"
          class="menu-item"
          @click="handleActionClick(action.route)"
        >
          <div class="menu-btn">
            <i :class="action.icon"></i>
          </div>

          <span class="menu-label">
            {{ action.name }}
          </span>
        </div>

      </div>
    </Transition>

    <button
      class="fab-trigger"
      :class="{ active: isOpen }"
      @click="toggleMenu"
    >
      <i
        :class="isOpen ? AppIcon.cross : AppIcon.add"
        class="trigger-icon"
      ></i>
    </button>

  </div>
</template>

<style scoped>
.fab-container {
  position: fixed;
  right: 16px;
  bottom: 24px;
  z-index: 3000;
}

.fab-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(3px);
  z-index: 10;
}

.fab-trigger {
  position: relative;
  z-index: 30;

  width: 68px;
  height: 68px;

  border: none;
  border-radius: 22px;

  background: v-bind('AppColor.primary.base');

  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow:
    0 12px 30px rgba(0,0,0,0.22),
    0 2px 10px rgba(0,0,0,0.12);

  transition: all 0.25s ease;

  cursor: pointer;
}

.fab-trigger.active {
  transform: rotate(45deg);
}

.trigger-icon {
  font-size: 24px;
}

.fab-menu-line {
  position: absolute;
  right: 0;
  bottom: 88px;

  display: flex;
  align-items: center;
  gap: 14px;

  z-index: 20;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  cursor: pointer;
}

.menu-btn {
  width: 62px;
  height: 62px;

  border-radius: 20px;

  background: white;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(0,0,0,0.05);

  box-shadow:
    0 10px 25px rgba(0,0,0,0.10),
    0 2px 10px rgba(0,0,0,0.05);

  transition: all 0.2s ease;
}

.menu-btn:active {
  transform: scale(0.92);
}

.menu-btn i {
  font-size: 22px;
  color: v-bind('AppColor.primary.base');
}

.menu-label {
  font-size: 11px;
  font-weight: 700;
  color: #2d3436;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

@media (max-width: 600px) {

  .fab-menu-line {
    gap: 10px;
  }

  .menu-btn {
    width: 56px;
    height: 56px;
    border-radius: 18px;
  }

  .menu-btn i {
    font-size: 20px;
  }

  .menu-label {
    font-size: 10px;
  }

  .fab-trigger {
    width: 64px;
    height: 64px;
  }
}
</style>
```
