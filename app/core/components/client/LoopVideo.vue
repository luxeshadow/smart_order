<script setup lang="ts">
defineProps({
  src: {
    type: String,
    default: "assets/videos/mp4/video.mp4"
  }
})
</script>

<template>
  <div class="video-wrapper">
    <div class="video-container">
      <div class="video-overlay"></div>
      
      <video
        class="video-player"
        :src="src"
        autoplay
        muted
        loop
        playsinline
      ></video>
    </div>
  </div>
</template>

<style scoped>
.video-wrapper {
  padding: 8px 8px;
  
}

.video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 32 / 9; 
  border-radius: 20px; 
  overflow: hidden;

}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(0deg, rgba(0,0,0,0.1) 0%, transparent 100%);
  z-index: 1;
  pointer-events: none;
}

.video-player {
  width: 100%;
  height: 100%;
  /* C'est cette ligne qui empêche l'altération (pas d'écrasement) */
  object-fit: cover; 
  display: block;
  transform: translateZ(0); 
}

/* On garde un ratio un peu plus haut sur mobile pour que ça reste visible */
@media (max-width: 600px) {
  .video-container {
    aspect-ratio: 21 / 7; 
  }
}
</style>