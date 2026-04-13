<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { ListProductUseCase } from '../../application/usecases/list_product_usecase'
import { ListProductRepositoryImpl } from '../../data/repositories/list_product_repository_impl'
import { Failure } from '~/core/errors/failure'
import { AppColor } from '~/core/constants/app_colors'
import type { Product } from '../../domain/entities/product'

const products = ref<Product[]>([])
const pending = ref(true)
const errorMsg = ref<string | null>(null)
const scrollLeft = ref(0)
const carouselRef = ref<HTMLElement | null>(null)
const isMobile = ref(false)

// Détection du support
const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768 // Seuil standard mobile/tablette
}

onMounted(async () => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
  
  try {
    const repository = new ListProductRepositoryImpl()
    const useCase = new ListProductUseCase(repository)
    const result = await useCase.execute()

    if (result instanceof Failure) {
      errorMsg.value = result.message
    } else {
      products.value = result.filter((p) => p.photoUrl)
    }
  } catch {
    errorMsg.value = 'Erreur de chargement'
  } finally {
    pending.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkDevice)
})

const onScroll = () => {
  if (!carouselRef.value) return
  scrollLeft.value = carouselRef.value.scrollLeft
}

/**
 * 📱 CONFIGURATION DYNAMIQUE
 */
const curveStrength = computed(() => (isMobile.value ? 20 : 0))
const visibleWidth = 380

const getArcStyle = (index: number) => {
  const itemWidth = 160
  const gap = 16

  // Calcul de la position relative au centre du viewport défini
  const x = index * (itemWidth + gap) - scrollLeft.value
  const center = visibleWidth / 2
  const normalized = (x - center) / center

  const y = Math.pow(normalized, 2) * curveStrength.value

  return {
    transform: `translateY(${y}px)`
  }
}
</script>

<template>
  <h1 class="page-title">Liste des produits</h1>

  <div class="gallery-wrapper">
    <div v-if="pending" class="status">Chargement...</div>
    <div v-else-if="errorMsg" class="status">{{ errorMsg }}</div>

    <div
      v-else
      ref="carouselRef"
      class="carousel"
      @scroll="onScroll"
    >
      <div class="carousel-track">
        <div
          v-for="(product, index) in products"
          :key="product.id"
          class="card-item"
          :style="getArcStyle(index)"
        >
          <div class="card-content">
            <img :src="product.photoUrl" :alt="product.name" />
            <div class="card-info">
              <span class="name">{{ product.name }}</span>
              <span class="price">
                {{ product.price.toLocaleString() }} XOF
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-wrapper {
  width: 100%;
  overflow: hidden;
}

.page-title {
  margin-left: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  margin-top: 20px;
  margin-bottom: 8px;
  color: #1e293b;
}

.carousel {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 16px 20px;
  scrollbar-width: none;
}

.carousel::-webkit-scrollbar {
  display: none;
}

.carousel-track {
  display: flex;
  gap: 16px;
  width: max-content;
  min-height: 240px;
}

.card-item {
  width: 160px;
  flex-shrink: 0;
  /* Transition fluide pour le changement de translateY au scroll */
  transition: transform 0.1s ease-out;
}

.card-content {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
}

.card-content img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.card-info {
  padding: 12px;
}

.name {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 5px;
  color: #1e293b;
}

.price {
  color: v-bind('AppColor.primary.base');
  font-size: 13px;
  font-weight: 800;
}
</style>