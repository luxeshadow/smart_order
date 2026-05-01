<!-- error.vue -->
<script setup lang="ts">
import { AppImage } from '@/core/constants/app_images'

defineProps({
  error: Object
})

const handleError = () => clearError({
  redirect: '/'
})
</script>

<template>
  <div class="error-page">

    <img
      :src="AppImage.Error_404"
      alt="404"
      class="error-image"
    />

    <h1>{{ error?.statusCode }}</h1>

    <p v-if="error?.statusCode === 404">
      Page introuvable
    </p>

    <p v-else>
      Une erreur est survenue
    </p>

    <button @click="handleError">
      Retour accueil
    </button>

  </div>
</template>

<style scoped>
.error-page {
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background: white;
  text-align: center;
}

.error-image {
  width: 280px;
  max-width: 100%;
  object-fit: contain;
}

h1 {
  margin: 0;
  font-size: 52px;
  font-weight: 800;
  color: #111;
}

p {
  margin: 0;
  color: #666;
  font-size: 15px;
}

button {
  margin-top: 10px;
  border: none;
  height: 50px;
  padding: 0 24px;
  border-radius: 14px;
  background: black;
  color: white;
  font-weight: 700;
  cursor: pointer;
}
</style>