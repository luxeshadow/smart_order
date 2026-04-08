<script setup lang="ts">
import { ref } from 'vue'
import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'

defineProps({
  title: {
    type: String,
    default: 'Smart Orders'
  }
})

// État pour afficher ou masquer le modal de notification
const showNotificationModal = ref(false)

// Fonction pour ouvrir le modal
const openModal = () => {
  showNotificationModal.value = true
  // Empêche le scroll du body quand le modal est ouvert
  document.body.style.overflow = 'hidden'
}

// Fonction pour fermer le modal
const closeModal = () => {
  showNotificationModal.value = false
  // Rétablit le scroll du body
  document.body.style.overflow = ''
}
</script>

<template>
  <nav class="app-bar">
    <div class="app-bar-content">
      <div class="logo-wrapper">
        <img :src="AppImage.Logo" alt="Logo" class="app-logo" />
      </div>

      <div class="notification-box" @click="openModal">
        <div class="notification-wrapper">
          <i class="fi fi-rr-bell bell-icon"></i>
          <span class="notification-dot"></span>
        </div>
      </div>
    </div>
  </nav>

  <Transition name="fade-scale">
    <div v-if="showNotificationModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <button class="close-btn" @click="closeModal">
          <i class="fi fi-rr-cross-small"></i>
        </button>

        <div class="flyer-content">
          <img :src="AppImage.Fliyer_1" alt="Notification Flyer" class="flyer-image" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* --- APP BAR STYLES (Inchangés) --- */
.app-bar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 65px;
  background-color: v-bind('AppColor.surface.pure');
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100; /* Assure que l'app bar est sous le modal */
  padding: 0 20px;
  box-sizing: border-box;
}

.app-bar-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  height: 40px;
}

.app-logo {
  height: 100%;
  width: auto;
  object-fit: contain;
}

.notification-box {
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 4px;
  transition: all 0.2s ease;
  cursor: pointer; /* Ajouté pour indiquer que c'est cliquable */
}

.notification-box:hover {
  background-color: #f0f0f0;
  border-color: #e0e0e0;
}

.notification-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
}

.bell-icon {
  font-size: 20px;
  color: #333;
}

.notification-dot {
  position: absolute;
  top: 3px;
  right: 9px;
  width: 9px;
  height: 9px;
  background-color: v-bind('AppColor.primary.base');
  border: 2.5px solid #f8f9fa;
  border-radius: 50%;
}

/* --- MODAL / FLYER STYLES (Nouveau) --- */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* Fond sombre semi-transparent */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999; /* Au-dessus de tout */
  backdrop-filter: blur(3px); /* Léger flou du fond pour l'effet glacé */
}

.modal-container {
  position: relative;
  width: 90%;
  max-width: 400px; /* Ajuste selon la taille du flyer */
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: visible; 
  padding: 10px;
  margin: 25px;
}

/* Style du bouton X "Liquide Glacé" */
.close-btn {
  position: absolute;
  top: -15px; /* Dépasse en haut */
  right: -15px; /* Dépasse à droite */
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;

  /* Effet Liquide Glacé / Glassmorphism */
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  color: white; /* Couleur du X */
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1) rotate(90deg);
}

.close-btn i {
  font-size: 18px;
  font-weight: bold;
}

.flyer-content {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.flyer-image {
  width: 100%;
  height: auto;
  border-radius: 18px; /* Un peu moins que le container */
  object-fit: cover;
  display: block;
}

/* --- ANIMATION (Fade & Scale) --- */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease-out;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>