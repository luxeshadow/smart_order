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
</script>

<template>
  <h1 class="page-title">Nos Produits</h1>

  <div class="gallery-wrapper">
    <div v-if="pending" class="status">Chargement...</div>
    <div v-else-if="errorMsg" class="status">{{ errorMsg }}</div>

    <div v-else class="carousel">
      <div class="carousel-track">
        <div
          v-for="product in products"
          :key="product.id"
          class="card-item"
        >
          <div class="card-content">
            <img :src="product.photoUrl" :alt="product.name" />
            
            <div class="card-overlay">
              <div class="info-container">
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
  margin-top: 24px;
  margin-bottom: 12px;
  color: #1e293b;
}

.carousel {
  width: 100%;
  overflow-x: auto;
  padding: 10px 16px 30px;
  scrollbar-width: none; /* Firefox */
  scroll-behavior: smooth;
}

.carousel::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.carousel-track {
  display: flex;
  gap: 16px;
  width: max-content;
}

.card-item {
  width: 180px;
  flex-shrink: 0;
  /* Effet de rebond léger au survol (optionnel) */
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-item:active {
  transform: scale(0.95);
}

.card-content {
  position: relative;
  height: 240px;
  background: #f1f5f9;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.card-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

/* Gradient sombre pour le texte */
.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  display: flex;
  align-items: flex-end;
  padding: 16px;
}

.info-container {
  color: white;
  width: 100%;
}

.name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  display: block;
  color: v-bind('AppColor.primary.base'); /* Ton orange/couleur de marque */
  font-size: 15px;
  font-weight: 800;
}

.status {
  padding: 40px;
  text-align: center;
  color: #64748b;
}
</style>