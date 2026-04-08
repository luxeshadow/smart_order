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
  padding: 8px 16px; /* Un peu plus d'espace sur les côtés */
}

.video-container {
  position: relative;
  width: 100%;
  /* Passage au 16/9 pour voir plus de hauteur et donc le bas de la vidéo */
  aspect-ratio: 16 / 9; 
  border-radius: 20px; 
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Dégradé légèrement plus sombre en bas pour le style */
  background: linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%);
  z-index: 1;
  pointer-events: none;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover; 
  /* Force l'alignement sur le BAS de la vidéo pour ne plus rien rater en bas */
  object-position: bottom; 
  display: block;
  transform: translateZ(0); 
}

/* Sur mobile, on augmente la hauteur pour que le contenu soit bien lisible */
@media (max-width: 600px) {
  .video-container {
    aspect-ratio: 4 / 3; 
  }
}
</style>