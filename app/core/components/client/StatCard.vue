<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { AppColor } from '@/core/constants/app_colors'
import { Failure } from '@/core/errors/failure'
import { useToast } from '@/core/utils/useToast'

// Stores
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'
import { useLevelStore } from '@/features/level/presentation/stores/level_store'
import { useTransactionStore } from '@/features/transaction/presentation/stores/transaction_store'

// UseCases & Repositories
import { ListLevelUseCase } from '@/features/level/application/usecases/list_level_usecase'
import { ListLevelRepositoryImpl } from '@/features/level/data/repositories/list_level_repository_impl'
import { AssignLevelUseCase } from '@/features/level/application/usecases/assign_level_usecase'
import { AssignLevelRepositoryImpl } from '@/features/level/data/repositories/assign_level_repository_impl'

// Props pour les stats
defineProps({
  stockValue: { type: String, default: "1,250,000" },
  currentAssets: { type: String, default: "3,945" }
})

// --- INITIALISATION ---
const authStore = useAuthStore()
const levelStore = useLevelStore()
const transactionStore = useTransactionStore()
const { showToast } = useToast()

const isLoading = ref(false)
const isAssigning = ref(false)

// Instances des UseCases
const listLevelUseCase = new ListLevelUseCase(new ListLevelRepositoryImpl())
const assignLevelUseCase = new AssignLevelUseCase(new AssignLevelRepositoryImpl())

// Données réactives depuis les stores
const levels = computed(() => levelStore.levels)

// --- MÉTHODES ---

const formatRawPrice = (price: number): string => {
  return price.toLocaleString('fr-FR')
}

// Charger la liste des niveaux
const fetchLevels = async () => {
  if (levelStore.levels.length === 0) isLoading.value = true
  
  const result = await listLevelUseCase.execute()
  
  if (!(result instanceof Failure)) {
    levelStore.updateLevels(result)
  }
  isLoading.value = false
}

// Activer un niveau au clic
const handleLevelClick = async (levelId: string) => {
  // Sécurité : ID utilisateur présent et pas de requête en cours
  if (!authStore.user?.id || isAssigning.value) return

  isAssigning.value = true
  
  const result = await assignLevelUseCase.execute({
    userId: authStore.user.id,
    levelId: levelId
  })

  if (!(result instanceof Failure)) {
    // 1. Mise à jour du solde dans le store global (reçu du RPC SQL)
    transactionStore.updateBalance(result as number)
    
    // 2. Feedback visuel
    showToast("Niveau activé avec succès !", "success")
  } else {
 
    showToast(result.message, "error")
  }
  
  isAssigning.value = false
}

onMounted(() => {
  fetchLevels()
})
</script>

<template>
  <div class="dashboard-section">
    <div class="levels-row" :class="{ 'is-processing': isAssigning }">
      <div v-if="isLoading" class="loader">Chargement...</div>
      
      <div 
        v-for="lvl in levels" 
        :key="lvl.id" 
        class="level-badge"
        @click="handleLevelClick(lvl.id)"
      >
        <span class="lvl-text">{{ lvl.name }}</span> 
        <span class="lvl-price">{{ formatRawPrice(lvl.price) }} <small>XOF</small></span>
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
.dashboard-section {
  padding: 0 15px;
}

.levels-row {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
  scrollbar-width: none;
}

.levels-row::-webkit-scrollbar { display: none; }

.level-badge {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #eee;
  padding: 10px 6px; /* Légèrement plus de padding pour les prix longs */
  border-radius: 14px;
  min-width: 70px; /* On élargit un peu pour "39 999" */
}

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


.dashboard-section {
  padding: 0 15px;
}

/* Nouveau style pour les niveaux */
.levels-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto; /* Scroll si trop de niveaux sur petit écran */
  padding-bottom: 5px;
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