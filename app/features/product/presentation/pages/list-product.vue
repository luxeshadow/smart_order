<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ListProductUseCase } from '../../application/usecases/list_product_usecase'
import { ListProductRepositoryImpl } from '../../data/repositories/list_product_repository_impl'
import { Failure } from '~/core/errors/failure'
import { AppColor } from '~/core/constants/app_colors'
import type { Product } from '../../domain/entities/product'

const products = ref<Product[]>([])
const pending = ref(true)
const errorMsg = ref<string | null>(null)

onMounted(async () => {
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

/**
 * 🔥 ARC VISUEL (NE TOUCHE PAS AU LAYOUT)
 */
const curveStrength = 60

const getArcStyle = (index: number) => {
  const total = products.value.length
  const center = (total - 1) / 2
  const distance = index - center
  const normalized = distance / (total || 1)
  const y = Math.pow(normalized, 2) * curveStrength

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

    <div v-else class="carousel">
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
  text-align: start;
  margin-left: 15px;
  font-size: 1rem;
  font-weight: 800;
  margin-top: 20px;
  margin-bottom: 1px;
  color: #1e293b;
}

.status {
  text-align: center;
  padding: 40px;
  font-weight: 600;
}

.carousel {
  overflow-x: auto;
  overflow-y: visible;
  padding: 10px 20px;
  scrollbar-width: none;
}

.carousel::-webkit-scrollbar {
  display: none;
}

.carousel-track {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  width: max-content;
}

.card-item {
  width: 170px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.card-item:hover {
  transform: scale(1.05);
}

.card-content {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
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
  font-weight: 700;
  margin-bottom: 6px;
  color: #1e293b;
}

.price {
  color: v-bind('AppColor.primary.base');
  font-weight: 800;
}
</style>