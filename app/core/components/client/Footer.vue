<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { AppColor } from '@/core/constants/app_colors'

const texts = ['Simple', 'Sécurisé', 'Rapide', 'Cool!']
const currentIndex = ref(0)
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % texts.length
  }, 2500)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <footer class="smart-footer">
    <div class="footer-content">
      
      <div class="brand-row">
        <div class="logo-wrapper">
           <h2 class="brand-name">Smart Orders</h2>
           <div class="brand-dot"></div>
        </div>

        <div class="rotating-inline">
          <Transition name="slide" mode="out-in">
            <span :key="currentIndex" class="rotating-badge">
              {{ texts[currentIndex] }}
            </span>
          </Transition>
        </div>
      </div>

      <p class="tagline">L'excellence de la commande internationale à votre portée.</p>

      <div class="footer-info">
        <div class="links-row">
          <a href="#">Aide</a>
          <a href="#">Conditions</a>
          <a href="#">Contact</a>
        </div>
        <p class="copyright">&copy; 2026 Smart Orders. Designed for Excellence.</p>
      </div>

    </div>
  </footer>
</template>

<style scoped>
.smart-footer {
  background-color: v-bind('AppColor.surface.pure');
  padding: 40px 16px 110px 16px;
  border-top: 1px solid #f2f2f2;
  margin-top: 40px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  max-width: 600px;
  margin: 0 auto;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 15px; /* Augmenté l'espace entre logo et badge */
  flex-wrap: wrap;
}

.logo-wrapper {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.brand-name {
  font-size: 22px; /* Un peu plus grand */
  font-weight: 900;
  color: v-bind('AppColor.tertiary.base');
  text-transform: uppercase;
  letter-spacing: -0.8px;
  margin: 0;
}

.brand-dot {
  width: 6px;
  height: 6px;
  background-color: v-bind('AppColor.primary.base');
  border-radius: 50%;
}

/* CONTENANT DU BADGE */
.rotating-inline {
  display: flex;
  overflow: hidden;
  height: 32px; /* Augmenté pour laisser de la place au texte */
}

/* LE RECTANGLE (BADGE) */
.rotating-badge {
  display: flex;
  align-items: center;    /* CENTRAGE VERTICAL */
  justify-content: center; /* CENTRAGE HORIZONTAL */
  padding: 0 16px;        /* DIMENSIONS AUGMENTÉES */
  min-width: 100px;       /* Largeur minimum pour éviter les sauts */
  background-color: v-bind('AppColor.primary.base');
  color: white;
  border-radius: 8px;
  font-size: 13px;        /* TEXTE PLUS GRAND */
  font-weight: 800;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tagline {
  font-size: 14px;
  color: #888;
  margin: 15px 0 35px 0;
  font-weight: 500;
  text-align: left;
}

.footer-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
  border-top: 1px solid #f8f8f8;
  padding-top: 10px;
}

.links-row {
  display: flex;
  gap: 20px;
}

.links-row a {
  font-size: 12px;
  font-weight: 700;
  color: #666;
  text-decoration: none;
  text-transform: uppercase;
}

.copyright {
  font-size: 10px;
  color: #bbb;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ANIMATION SLIDE AJUSTÉE */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  transform: translateY(32px); /* Match la hauteur du container */
  opacity: 0;
}

.slide-leave-to {
  transform: translateY(-32px);
  opacity: 0;
}
</style>