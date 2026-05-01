<script setup lang="ts">
import { AppColor } from '@/core/constants/app_colors'

// Reçoit la valeur active du parent
defineProps({
  modelValue: {
    type: String,
    required: true
  }
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

        <span
          v-show="modelValue === 'dashboard'"
          class="nav-text"
        >
          Dashboard
        </span>

      </Transition>

    </div>

    <div
      @click="updateTab('manager')"
      :class="['nav-item', { active: modelValue === 'manager' }]"
    >

      <i class="fi fi-rr-briefcase"></i>

      <Transition name="expand">

        <span
          v-show="modelValue === 'manager'"
          class="nav-text"
        >
          Manager
        </span>

      </Transition>

    </div>

    <div
      @click="updateTab('withdrawal')"
      :class="['nav-item', { active: modelValue === 'withdrawal' }]"
    >

      <i class="fi fi-rr-money-transfer-coin-arrow"></i>

      <Transition name="expand">

        <span
          v-show="modelValue === 'withdrawal'"
          class="nav-text"
        >
          Withdrawal
        </span>

      </Transition>

    </div>

  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;

  left: 16px;

  right: 16px;

  bottom: calc(env(safe-area-inset-bottom) + 12px);

  height: 58px;

  background-color: v-bind('AppColor.surface.pure');

  display: flex;

  align-items: center;

  justify-content: space-around;

  padding: 0 10px;

  border-radius: 999px;

  border: 1px solid v-bind('AppColor.surface.bone');

  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.08);

  z-index: 100;

  transform: translateZ(0);

  backface-visibility: hidden;

  -webkit-backface-visibility: hidden;

  will-change: transform;
}

.nav-item {
  display: flex;

  align-items: center;

  justify-content: center;

  height: 42px;

  padding: 0 18px;

  border-radius: 999px;

  cursor: pointer;

  color: v-bind('AppColor.tertiary.soft');

  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    transform 0.2s ease;

  overflow: hidden;

  min-width: 46px;

  transform: translateZ(0);

  backface-visibility: hidden;

  -webkit-tap-highlight-color: transparent;
}

.nav-item i {
  font-size: 18px;

  transition:
    transform 0.25s ease;
}

/* ACTIVE */
.nav-item.active {
  background-color: v-bind('AppColor.primary.base');

  color: white;
}

.nav-item.active i {
  transform: translateX(-2px);
}

.nav-text {
  font-size: 12px;

  font-weight: 700;

  margin-left: 8px;

  white-space: nowrap;
}

/* ANIMATION */
.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.25s ease,
    max-width 0.25s ease,
    margin 0.25s ease;

  max-width: 100px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;

  max-width: 0;

  margin-left: 0;
}

/* CLICK */
.nav-item:active {
  transform: scale(0.94);
}

/* MOBILE */
@media (max-width: 600px) {

  .bottom-nav {

    left: 12px;

    right: 12px;

    height: 56px;

    bottom: calc(env(safe-area-inset-bottom) + 10px);
  }

  .nav-item {

    padding: 0 16px;
  }

  .nav-item i {

    font-size: 17px;
  }

  .nav-text {

    font-size: 11px;
  }
}
</style>