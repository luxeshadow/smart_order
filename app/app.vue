<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AppImage } from '@/core/constants/app_images'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'

const authStore = useAuthStore()

await authStore.initUser()

const isDesktop = ref(false)

onMounted(() => {

  const checkDevice = () => {
    isDesktop.value = window.innerWidth > 768
  }

  checkDevice()

  window.addEventListener('resize', checkDevice)
})
</script>

<template>
  <div>

    <!-- 🔥 Blocage PC -->

    <div v-if="isDesktop" class="desktop-block">

      <div class="desktop-card">

        <img
          :src="AppImage.Error_Divice"
          alt="Device Error"
          class="desktop-image"
        />

        <h1>Application mobile uniquement</h1>

        <p>
          Cette plateforme est uniquement disponible sur smartphone.
        </p>

      </div>

    </div>

    <!-- ✅ Mobile -->

    <template v-else>
      <NuxtPwaManifest />

      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>

  </div>
</template>

<style scoped>
.desktop-block {
  position: fixed;
  inset: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 999999;
}

.desktop-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 30px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.08);
}

.desktop-image {
  width: 180px;
  max-width: 100%;
  object-fit: contain;
  margin-bottom: 20px;
}

.desktop-card h1 {
  font-size: 24px;
  font-weight: 800;
  color: #2d3436;
  margin-bottom: 10px;
}

.desktop-card p {
  font-size: 15px;
  color: #7f8c8d;
  line-height: 1.6;
}
</style>