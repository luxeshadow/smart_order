<script setup lang="ts">
import { AppColor } from '@/core/constants/app_colors'

// Reçoit la valeur active du parent
const props = defineProps({
  modelValue: { type: String, required: true }
})

const emit = defineEmits(['update:modelValue'])

const updateTab = (tabName: string) => {
  emit('update:modelValue', tabName)
}
</script>

<template>
  <nav class="bottom-nav">
    <div 
      @click="updateTab('dashboard')" 
      :class="['nav-item', { active: modelValue === 'dashboard' }]"
    >
      <i class="fi fi-rr-apps"></i>
      <Transition name="expand">
        <span v-show="modelValue === 'dashboard'" class="nav-text">Dashboard</span>
      </Transition>
    </div>

    <div 
      @click="updateTab('manager')" 
      :class="['nav-item', { active: modelValue === 'manager' }]"
    >
      <i class="fi fi-rr-briefcase"></i>
      <Transition name="expand">
        <span v-show="modelValue === 'manager'" class="nav-text">Manager</span>
      </Transition>
    </div>

    <div 
      @click="updateTab('withdrawal')" 
      :class="['nav-item', { active: modelValue === 'withdrawal' }]"
    >
     <i class="fi fi-rr-money-transfer-coin-arrow"></i>
      <Transition name="expand">
        <span v-show="modelValue === 'withdrawal'" class="nav-text">withdrawal</span>
      </Transition>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 15px; /* Décollé du bas pour l'effet flottant PWA */
  left: 30px;
  right: 30px;
  height: 50px;
  background-color: v-bind('AppColor.surface.pure');
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
  border-radius: 50px; /* Arrondi total */
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid v-bind('AppColor.surface.bone');
  z-index: 100;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  padding: 0 22px;
  border-radius: 50px;
  cursor: pointer;
  color: v-bind('AppColor.tertiary.soft');
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); /* Transition plus smooth */
  overflow: hidden; /* Crucial pour l'animation de largeur */
  min-width: 45px;
}

.nav-item i {
  font-size: 18px;
  transition: transform 0.3s ease;
}

/* État Actif */
.nav-item.active {
  background-color: v-bind('AppColor.primary.base');
  color: #FFFFFF;
  flex-grow: 0; /* Empêche de prendre trop de place */
}

.nav-item.active i {
  transform: translateX(-2px); /* Décale l'icône vers la gauche quand le texte arrive */
}

.nav-text {
  font-size: 12px;
  font-weight: 700;
  margin-left: 8px;
  white-space: nowrap;
}

/* --- ANIMATION DE TRANSITION (Le secret) --- */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  max-width: 100px; /* Valeur max arbitraire */
}

.expand-enter-from,
.expand-leave-to {
  max-width: 0;
  opacity: 0;
  margin-left: 0;
  transform: translateX(-10px);
}

/* Petit feedback haptique au clic */
.nav-item:active {
  transform: scale(0.92);
}
</style>