<script setup lang="ts">
import { ref } from 'vue'
import { AppColor } from '@/core/constants/app_colors'
import { AppIcon } from '@/core/constants/app_icons'

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

// RÉDUIT À 3 ACTIONS
const actions = [
  { id: 'Commande',    name: 'Commande',    icon: AppIcon.order, route: '/sale/add' },
  { id: 'Categorie', name: 'Categorie',  icon: AppIcon.box,   route: '/product/add' },
  { id: 'user', name: 'Profile',  icon: AppIcon.user, route: '/user/add' },
]
</script>

<template>
  <div class="fab-container">
    <Transition name="fade">
      <div v-if="isOpen" class="fab-backdrop" @click="toggleMenu"></div>
    </Transition>

    <div class="fab-orbit-menu" :class="{ 'is-open': isOpen }">
      <div v-for="action in actions" :key="action.id" class="orbit-item">
        <NuxtLink :to="action.route" class="action-btn">
          <i :class="action.icon" class="action-icon"></i>
          <span class="action-label">{{ action.name }}</span>
        </NuxtLink>
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
.fab-container {
  position: fixed;
  bottom: 30px;
  right: 15px; /* Un peu plus d'espace du bord */
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-backdrop {
  position: fixed;
  top: 65px;
  left: 0;
  width: 100vw;
  height: calc(100vh - 65px);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
  backdrop-filter: blur(2px);
}

.fab-trigger {
  width: 70px;
  height: 70px;
  background-color: v-bind('AppColor.primary.base');
  color: v-bind('AppColor.surface.pure');
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

.trigger-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s;
}

.fab-trigger.is-active .trigger-icon {
  transform: rotate(-45deg); 
}

/* --- ORBITE RÉDUITE À 3 --- */
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

.action-btn {
  width: 60px; /* Légèrement plus grand pour 3 boutons */
  height: 60px;
  background-color: v-bind('AppColor.surface.pure');
  border-radius: 28px; /* Forme plus carrée pour matcher ton style */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.action-icon {
  font-size: 18px;
  color: v-bind('AppColor.primary.base');
  margin-bottom: 2px;
}

.action-label {
  font-size: 9px;
  font-weight: 800;
  color: #333;
  text-transform: uppercase;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>