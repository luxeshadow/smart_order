<script setup lang="ts">
import { AppImage } from '@/core/constants/app_images'
import { AppColor } from '@/core/constants/app_colors'

const shops = [
  { id: 1, img: AppImage.Amazon },
  { id: 2, img: AppImage.Alibaba },
  { id: 3, img: AppImage.Coscot },
  { id: 4, img: AppImage.Temu },
]
</script>

<template>
  <div class="gallery-wrapper">
    <h1 class="gallery-title">Nos Boutiques</h1>

    <div class="scroll-container">
      <div v-for="shop in shops" :key="shop.id" class="image-card">
        <img :src="shop.img" class="shop-img" draggable="false" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-wrapper {
  width: 100%;
  padding: 10px 0;
}

.gallery-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 15px 15px; /* Aligné avec le padding du scroll */
  color: v-bind('AppColor.tertiary.base');
  letter-spacing: -0.5px;
}

.scroll-container {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin:8px; 
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.image-card {
  flex: 0 0 160px;
  aspect-ratio: 16 / 10;
  border-radius: 10px; 
  overflow: hidden;
  background: #eee;
  scroll-snap-align: start;
  user-select: none;

}

.shop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.scroll-container::after {
  content: '';
  padding-right: 15px;
}
</style>