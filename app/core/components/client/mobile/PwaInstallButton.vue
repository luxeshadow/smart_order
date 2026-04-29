<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AppColor } from '@/core/constants/app_colors'

const deferredPrompt = ref<any>(null)

const showInstallButton = ref(false)

onMounted(() => {

  console.log('PWA Install Component Mounted')

  console.log('Display mode standalone :', window.matchMedia('(display-mode: standalone)').matches)

  window.addEventListener('beforeinstallprompt', (e: any) => {

    console.log('beforeinstallprompt event triggered')

    e.preventDefault()

    deferredPrompt.value = e

    showInstallButton.value = true

    console.log('Install button visible :', showInstallButton.value)
  })

  window.addEventListener('appinstalled', () => {

    console.log('PWA installed successfully')

    showInstallButton.value = false

    deferredPrompt.value = null
  })

  if ('serviceWorker' in navigator) {

    navigator.serviceWorker.getRegistrations().then((registrations) => {

      console.log('Service Workers :', registrations)

    }).catch((err) => {

      console.error('Service Worker Error :', err)

    })
  } else {

    console.log('Service Worker not supported')
  }
})

const installPwa = async () => {

  console.log('Install button clicked')

  if (!deferredPrompt.value) {

    console.log('No deferredPrompt available')

    return
  }

  deferredPrompt.value.prompt()

  console.log('Prompt shown')

  const choiceResult = await deferredPrompt.value.userChoice

  console.log('User choice :', choiceResult)

  if (choiceResult.outcome === 'accepted') {

    console.log('User accepted install')

    showInstallButton.value = false
  } else {

    console.log('User dismissed install')
  }

  deferredPrompt.value = null
}
</script>

<template>
  <Transition name="fade-up">

    <div
      v-if="showInstallButton"
      class="pwa-install-wrapper"
    >
      <div class="pwa-install-card">

        <div class="left-content">
          <div class="icon-box">
            <i class="fi fi-rr-download"></i>
          </div>

          <div class="text-content">
            <h3>Installer Smart Orders</h3>

            <p>
              Accédez rapidement à l'application depuis votre écran d'accueil
            </p>
          </div>
        </div>

        <button
          class="install-btn"
          @click="installPwa"
        >
          Installer
        </button>

      </div>
    </div>

  </Transition>
</template>

<style scoped>
.pwa-install-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 90px;
  z-index: 999;
  display: flex;
  justify-content: center;
  padding: 0 14px;
}

.pwa-install-card {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 22px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow:
    0 10px 30px rgba(0,0,0,0.08),
    0 2px 10px rgba(0,0,0,0.04);
  border: 1px solid #f1f1f1;
}

.left-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-box {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-box i {
  font-size: 22px;
}

.text-content h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #2d3436;
}

.text-content p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.4;
}

.install-btn {
  border: none;
  height: 44px;
  padding: 0 18px;
  border-radius: 14px;
  background: v-bind('AppColor.primary.base');
  color: white;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 600px) {

  .pwa-install-wrapper {
    bottom: 80px;
  }

  .pwa-install-card {
    padding: 12px;
  }

  .install-btn {
    height: 40px;
    padding: 0 14px;
    font-size: 13px;
  }
}
</style>