<script setup lang="ts">
import { AppColor } from '@/core/constants/app_colors'
import { computed } from 'vue' // Ajout de l'import manquant

const props = defineProps({
  label: { type: String, required: true },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String as () => 'button' | 'submit' | 'reset', default: 'button' },
  color: { type: String, default: () => AppColor.primary.base }, 
  icon: { type: String, default: '' } 
})

const emit = defineEmits(['click'])

const handleClick = (event: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}

const isInteractive = computed(() => !props.loading && !props.disabled)
</script>

<template>
  <button
    :type="type"
    class="auth-button"
    :class="{ 
      'is-loading': loading, 
      'is-disabled': disabled 
    }"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <Transition name="fade" mode="out-in">
      <div v-if="!loading" class="content-wrapper">
        <i v-if="icon" class="fi btn-icon" :class="icon"></i>
        <span class="btn-text">{{ label }}</span>
      </div>

      <div v-else class="loader-wrapper">
        <div class="spinner-border" role="status"></div>
      </div>
    </Transition>
    
    <div class="hover-overlay"></div>
  </button>
</template>

<style scoped>
.auth-button {
  position: relative;
  width: 100%;
  height: 56px;
  border: none;
  outline: none;
  border-radius: 12px;
  background-color: v-bind('color'); 
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.content-wrapper, .loader-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 100%;
}

/* --- LE SPINNER BOOTSTRAP --- */
.spinner-border {
  display: inline-block;
  width: 24px;
  height: 24px;
  vertical-align: text-bottom;
  border: 3px solid currentColor; /* Utilise la couleur du texte (blanc) */
  border-right-color: transparent; /* Crée l'effet de coupure du spinner */
  border-radius: 50%;
  animation: spinner-border .75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

.btn-icon {
  font-size: 18px;
}

/* Hover & Active */
.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.auth-button:active:not(:disabled) {
  transform: translateY(1px);
}

.hover-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(255, 255, 255, 0);
  transition: background-color 0.2s;
  pointer-events: none;
}

.auth-button:hover:not(:disabled) .hover-overlay {
  background-color: rgba(255, 255, 255, 0.15);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* Transition Fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>