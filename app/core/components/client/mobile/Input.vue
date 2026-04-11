<script setup lang="ts">
import { AppColor } from '@/core/constants/app_colors'
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  id: { type: String, required: true },
  icon: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const isFocused = ref(false)
const isPasswordVisible = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') {
    return isPasswordVisible.value ? 'text' : 'password'
  }
  return props.type
})

const togglePassword = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
  <div class="auth-input-group">
    <label :for="id" class="input-label">{{ label }}</label>

    <div 
      class="input-wrapper" 
      :class="{ 'is-focused': isFocused, 'has-error': error }"
    >
      <i v-if="icon" class="fi left-icon" :class="icon"></i>

      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        class="main-input"
        :placeholder="'Entrez votre ' + label.toLowerCase()"
        @input="(e) => emit('update:modelValue', (e.target as HTMLInputElement).value)"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <button 
        v-if="type === 'password'" 
        type="button" 
        class="password-toggle" 
        @click="togglePassword"
      >
        <i :class="isPasswordVisible ? 'fi-rr-eye-crossed' : 'fi-rr-eye'"></i>
      </button>
    </div>

    <Transition name="fade-slide">
      <span v-if="error" class="error-message">
        <i class="fi fi-rr-exclamation"></i> {{ error }}
      </span>
    </Transition>
  </div>
</template>

<style scoped>
.auth-input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;
  text-align: left; 
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  height: 52px;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  background-color: #fff;
  padding: 0 16px;
  transition: all 0.2s ease;
}

/* L'ESPACEMENT EST ICI : margin-right de 12px */
.left-icon {
  margin-right: 12px; 
  font-size: 18px;
  color: #a0a0a0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.is-focused {
  border-color: v-bind('AppColor.primary.base') !important;
}

.is-focused .left-icon {
  color: v-bind('AppColor.primary.base');
}

.has-error {
  border-color: #ff4757 !important;
}

.main-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1a1a1a;
}

.main-input::placeholder {
  color: #ccc;
}

.password-toggle {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  padding: 5px;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.error-message {
  color: #ff4757;
  font-size: 12px;
  margin-top: 5px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>