<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { AppColor } from '@/core/constants/app_colors'
import { Failure } from '@/core/errors/failure'
import { useToast } from '@/core/utils/useToast'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'
import { useLevelStore } from '@/features/level/presentation/stores/level_store'
import { useTransactionStore } from '@/features/transaction/presentation/stores/transaction_store'
import ListLevelSkeleton  from '@/features/level/presentation/components/ListLevelSkeleton.vue'

// Cas d'utilisation pour la liste globale
import { ListLevelUseCase } from '@/features/level/application/usecases/list_level_usecase'
import { ListLevelRepositoryImpl } from '@/features/level/data/repositories/list_level_repository_impl'

// Cas d'utilisation pour l'assignation (achat)
import { AssignLevelUseCase } from '@/features/level/application/usecases/assign_level_usecase'
import { AssignLevelRepositoryImpl } from '@/features/level/data/repositories/assign_level_repository_impl'

// AJOUT : Cas d'utilisation pour mettre à jour "Mes Niveaux" après achat
import { ListMyLevelUseCase } from '@/features/level/application/usecases/list_my_level_usecase'
import { ListMyLevelRepositoryImpl } from '@/features/level/data/repositories/list_my_level_repository_impl'

// Props
defineProps({
  stockValue: { type: String, default: "1,250,000" },
  currentAssets: { type: String, default: "3,945" }
})

const authStore = useAuthStore()
const levelStore = useLevelStore()
const transactionStore = useTransactionStore()
const { showToast } = useToast()

const isLoading = ref(false)
const processingId = ref<string | null>(null)

// Initialisation des UseCases
const listLevelUseCase = new ListLevelUseCase(new ListLevelRepositoryImpl())
const assignLevelUseCase = new AssignLevelUseCase(new AssignLevelRepositoryImpl())
const listMyLevelUseCase = new ListMyLevelUseCase(new ListMyLevelRepositoryImpl()) // <--- Initialisé ici

const levels = computed(() => levelStore.levels)

const formatRawPrice = (price: number): string => {
  return price.toLocaleString('fr-FR')
}

const fetchLevels = async () => {
  if (levelStore.levels.length === 0) isLoading.value = true
  const result = await listLevelUseCase.execute()
  if (!(result instanceof Failure)) {
    levelStore.updateLevels(result)
  }
  isLoading.value = false
}

const handleLevelClick = async (levelId: string) => {
  if (!authStore.user?.id || processingId.value) return

  processingId.value = levelId 
  
  const result = await assignLevelUseCase.execute({
    userId: authStore.user.id,
    levelId: levelId
  })

  if (!(result instanceof Failure)) {
    transactionStore.updateBalance(result as number)

    const myLevelsResult = await listMyLevelUseCase.execute(authStore.user.id)
    if (!(myLevelsResult instanceof Failure)) {
      levelStore.updateMyLevels(myLevelsResult)
    }

    showToast("Niveau activé avec succès !", 'fi-rr-check', 'success', '#2ecc71')
  } else {
    showToast(result.message, 'fi-rr-cross-circle', 'error', '#ff4757')
  }
  
  processingId.value = null
}

onMounted(() => {
  fetchLevels()
})
</script>

<template>
  <div class="dashboard-section">
    <div class="levels-row" :class="{ 'is-processing': processingId }">
      <ListLevelSkeleton v-if="isLoading" />
      
      <div 
        v-for="lvl in levels" 
        :key="lvl.id" 
        class="level-badge"
        :class="{ 'active-loading': processingId === lvl.id }"
        @click="handleLevelClick(lvl.id)"
      >
        <span class="lvl-text">{{ lvl.name }}</span> 
        
        <span class="lvl-price">
          <template v-if="processingId === lvl.id">
            En cours...
          </template>
          <template v-else>
            {{ formatRawPrice(lvl.price) }} <small>XOF</small>
          </template>
        </span>
      </div>
    </div>

    <div class="stat-container">
      <div class="stat-card">
        <p class="stat-title">Stock Value</p>
        <div class="stat-content">
          <h2 class="stat-value">{{ stockValue }}</h2>
          <span class="stat-unit">XOF</span>
        </div>
      </div>

      <div class="stat-card">
        <p class="stat-title">Current Assets</p>
        <div class="stat-content">
          <h2 class="stat-value">{{ currentAssets }}</h2>
          <span class="stat-unit">QTE</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tes styles existants */
.levels-row {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
  scrollbar-width: none;
}

.level-badge {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #eee;
  padding: 10px 6px;
  border-radius: 14px;
  min-width: 75px;
  transition: all 0.2s ease;
}

/* Style spécial quand ce badge précis charge */
.active-loading {
  border-color: v-bind('AppColor.tertiary.base');
  background: #fff;
}

.lvl-price {
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
  color: v-bind('AppColor.tertiary.base');
}

/* Désactive les clics sur les autres badges pendant le chargement */
.is-processing {
  pointer-events: none;
}

.dashboard-section {
  padding: 0 15px;
}


.levels-row::-webkit-scrollbar { display: none; }


.lvl-text {
  font-size: 8px; /* Un poil plus petit pour laisser de la place au prix */
  font-weight: 800;
  color: #999;
  margin-bottom: 2px;
}

.lvl-price {
  font-size: 10px; /* Taille ajustée pour que "19 999" tienne sur une ligne */
  font-weight: 900;
  white-space: nowrap;
  color: v-bind('AppColor.tertiary.base');
}


.level-badge {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #eee;
  padding: 8px 4px;
  border-radius: 12px;
  min-width: 65px;
}

.lvl-text {
  font-size: 9px;
  font-weight: 800;
  color: #999;
  text-transform: uppercase;
}

.lvl-price {
  font-size: 11px;
  font-weight: 900;
  color: v-bind('AppColor.tertiary.base');
}

/* Tes styles existants */
.stat-container {
  display: flex;
  gap: 12px;
  width: 100%;
}

.stat-card {
  flex: 1;
  background: v-bind('AppColor.surface.pure');
  border-radius: 20px;
  padding: 16px 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  color: #888;
  margin: 0 0 8px 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: v-bind('AppColor.tertiary.base');
}

.stat-unit {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  background: rgba(255, 152, 0, 0.1);
  color: v-bind('AppColor.primary.base');
  border-radius: 6px;
  margin-top: 4px;
  display: inline-block;
}
</style>