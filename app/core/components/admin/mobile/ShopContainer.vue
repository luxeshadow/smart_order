<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AppColor } from '@/core/constants/app_colors'
import { Failure } from '@/core/errors/failure'
import type { LevelSubscriber } from '../../../../features/level/domain/entities/level_subscibers'
import { GetLevelSubscribersUseCase } from '../../../../features/level/application/usecases/get_level_subscribers_usecase'
import { LevelSubscriberRepositoryImpl } from '../../../../features/level/data/repositories/level_subscriber_repository_impl'

const shops = ref<LevelSubscriber[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const repository = new LevelSubscriberRepositoryImpl()
const useCase = new GetLevelSubscribersUseCase(repository)

const loadShops = async () => {
  loading.value = true
  const result = await useCase.execute()

  if (result instanceof Failure) {
    error.value = result.message
  } else {
    shops.value = result
  }
  loading.value = false
}

onMounted(() => {
  loadShops()
})
</script>

<template>
  <div class="shop-section">
    <h3 class="section-title">Mes Boutiques</h3>

    <div class="shops-grid">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="shop-card skeleton">
          <div class="skeleton-header">
            <div class="sk-line name"></div>
            <div class="sk-line count"></div>
          </div>
          <div class="skeleton-details">
            <div class="sk-line detail"></div>
            <div class="sk-line detail"></div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="shop in shops" :key="shop.name" class="shop-card">
          <div class="shop-header">
            <span class="shop-name">{{ shop.name }}</span>
            <span class="shop-count">{{ shop.activeClientsCount }} utilisateur(s)</span>
          </div>
          
          <div class="shop-details">
            <div class="detail">
              <i class="fi fi-rr-tag"></i>
              <span>{{ shop.price.toLocaleString() }} XOF</span>
            </div>
            <div class="detail">
              <i class="fi fi-rr-box"></i>
              <span>{{ shop.maxOrderItem }} cmd/jour</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-if="error" class="error-msg">
      {{ error }}
    </div>
  </div>
</template>



<style scoped>
.shop-section {
  margin: 15px;
}

.section-title {
  margin: 15px 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: v-bind('AppColor.tertiary.charcoal');
}

.shops-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.shop-card {
  background-color: v-bind('AppColor.surface.pure');
  padding: 14px;
  border-radius: 16px;
  border: 1px solid v-bind('AppColor.surface.bone');
  transition: transform 0.2s;
}

.shop-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.shop-name {
  font-weight: 700;
  font-size: 14px;
  color: v-bind('AppColor.tertiary.base');
}

.shop-count {
  font-size: 10px;
  color: v-bind('AppColor.primary.base');
  font-weight: 600;
}

.shop-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: v-bind('AppColor.tertiary.soft');
}

.detail i {
  font-size: 12px;
  color: v-bind('AppColor.secondary.base');
}

/* --- SKELETON ANIMATION --- */
.skeleton {
  pointer-events: none;
}

.sk-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.sk-line.name { width: 70%; height: 14px; margin-bottom: 6px; }
.sk-line.count { width: 40%; height: 10px; }
.sk-line.detail { width: 80%; height: 10px; margin-top: 6px; }

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.error-msg {
  color: red;
  font-size: 12px;
  text-align: center;
  margin-top: 10px;
}

.shop-card:active:not(.skeleton) {
  transform: scale(0.97);
  background-color: v-bind('AppColor.surface.smoke');
}
</style>