<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppColor } from "@/core/constants/app_colors"

// Stores
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'
import { useTransactionStore } from '../stores/transaction_store'

// Clean Arch
import { ListMyTransactionUseCase } from '../../application/usecases/list_my_transaction_usecase'
import { ListMyTransactionRepositoryImpl } from '../../data/repositories/list_my_transaction_repository_impl'

const router = useRouter()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

const loaderTrigger = ref<HTMLElement | null>(null)
const currentFilter = ref('all') // 'all' | 'deposit' | 'withdrawal'

// Initialisation Clean Arch
const repo = new ListMyTransactionRepositoryImpl()
const listUseCase = new ListMyTransactionUseCase(repo)

// --- LOGIQUE DE FILTRAGE ---
const setFilter = (filter: string) => {
  currentFilter.value = filter
}

const filteredTransactions = computed(() => {
  const list = transactionStore.transactions
  if (currentFilter.value === 'all') return list
  return list.filter(t => t.type === currentFilter.value)
})

// --- FORMATEURS ---
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
  })
}

const getStatusDetails = (status: string) => {
  switch (status) {
    case 'completed': return { label: 'Succès', class: 'status-success' }
    case 'pending': return { label: 'En attente', class: 'status-pending' }
    default: return { label: 'Échoué', class: 'status-error' }
  }
}

// --- SCROLL INFINI ---
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    const firstEntry = entries[0];
    if (firstEntry && firstEntry.isIntersecting && !transactionStore.isLoading) {
      const userId = authStore.user?.id
      if (userId) {
        transactionStore.fetchTransactions(listUseCase, userId)
      }
    }
  }, { threshold: 0.1 })

  if (loaderTrigger.value) {
    observer.observe(loaderTrigger.value)
  }
})
</script>

<template>
  <div class="history-page">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
      <span class="app-bar-title">Historique</span>
      <div class="spacer"></div>
    </nav>

    <div class="filter-row">
      <div 
        class="filter-chip" 
        :class="{ active: currentFilter === 'all' }" 
        @click="setFilter('all')"
      >Tout</div>
      <div 
        class="filter-chip" 
        :class="{ active: currentFilter === 'deposit' }" 
        @click="setFilter('deposit')"
      >Dépôts</div>
      <div 
        class="filter-chip" 
        :class="{ active: currentFilter === 'withdrawal' }" 
        @click="setFilter('withdrawal')"
      >Retraits</div>
    </div>

    <div class="transaction-list">
      <TransitionGroup name="unroll">
        <div 
          v-for="(item, index) in filteredTransactions" 
          :key="item.id" 
          class="transaction-card"
          :style="{ '--index': index }"
        >
          <div class="card-left">
            <div class="type-icon" :class="item.type">
              <i :class="['fi', item.type === 'deposit' ? 'fi-rr-arrow-trend-up' : 'fi-rr-arrow-trend-down']"></i>
            </div>
            <div class="details">
              <span class="trans-type">{{ item.type === 'deposit' ? 'Dépôt' : 'Retrait' }}</span>
              <span class="trans-date">{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>

          <div class="card-right">
            <span class="trans-amount" :class="item.type">
              {{ item.type === 'deposit' ? '+' : '-' }} {{ item.amount.toLocaleString() }}
            </span>
            <div class="meta-row">
               <span :class="['method-badge', item.method.toLowerCase()]">{{ item.method }}</span>
               <span :class="['status-dot-text', getStatusDetails(item.status).class]">
                 {{ getStatusDetails(item.status).label }}
               </span>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div ref="loaderTrigger" class="loader-area">
        <div v-if="transactionStore.isLoading" class="spinner"></div>
        <span v-else-if="!transactionStore.hasMore && filteredTransactions.length > 0" class="end-msg">
          Fin de l'historique
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

/* Variables locales basées sur tes constantes */
.history-page {
  padding: 15px;
  padding-top: 85px;
  background: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* App Bar */
.app-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 70px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  border-bottom: 1px solid #f0f0f0;
}

.back-btn {
  width: 42px; height: 42px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.back-btn:active { transform: scale(0.9); }
.back-btn i { font-size: 1.2rem; color: #111; }

.app-bar-title {
  flex: 1; text-align: center;
  font-weight: 800; font-size: 18px;
  color: #111;
  letter-spacing: -0.5px;
}

/* Filtres (Chips) */
.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  overflow-x: auto;
  padding: 5px 2px;
  scrollbar-width: none; /* Firefox */
}
.filter-row::-webkit-scrollbar { display: none; } /* Chrome/Safari */

.filter-chip {
  padding: 10px 22px;
  background: #f2f2f2;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #777;
  white-space: nowrap;
  transition: all 0.3s ease;
  cursor: pointer;
}

.filter-chip.active {
  background: v-bind('AppColor.primary.base');
  color: white;
  box-shadow: 0 4px 12px v-bind('AppColor.primary.base + "40"');
}

/* Liste de Transactions */
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.transaction-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #f1f1f1;
  border-radius: 22px;
  transition: transform 0.2s;
}

.transaction-card:active { background: #f9f9f9; }

/* Left Part: Icon & Basic Info */
.card-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.type-icon {
  width: 48px; height: 48px;
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
}

/* Couleurs dynamiques selon le type */
.type-icon.deposit {
  background: #e8f5e9;
  color: #27ae60;
}

.type-icon.withdrawal {
  background: #ffebee;
  color: #eb4d4b;
}

.details .trans-type {
  display: block;
  font-weight: 800;
  font-size: 15px;
  color: #1a1a1a;
}

.details .trans-date {
  font-size: 11px;
  color: #999;
  font-weight: 600;
  text-transform: capitalize;
}

/* Right Part: Amount & Meta */
.card-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.trans-amount {
  font-weight: 900;
  font-size: 17px;
  letter-spacing: -0.2px;
}

.trans-amount.deposit { color: #27ae60; }
.trans-amount.withdrawal { color: #1a1a1a; } /* Montant retrait souvent en noir pour lisibilité */

.meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* Méthodes de paiement */
.method-badge {
    font-size: 10px;
    font-weight: 800;
    padding: 3px;
    border-radius: 6px;
    text-transform: uppercase;
    /* Orange transparent par défaut */
    background-color: rgba(255, 165, 0, 0.15); 
    color: #e67e22; /* Un orange plus sombre pour le texte (lisibilité) */
  
}



/* Statuts */
.status-dot-text {
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot-text::before {
  content: "•";
  font-size: 18px;
}

.status-success { color: #27ae60; }
.status-pending { color: #f39c12; }
.status-error { color: #eb4d4b; }

/* Loader & Pagination */
.loader-area {
  padding: 30px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 24px; height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid v-bind('AppColor.primary.base');
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.end-msg {
  font-size: 12px;
  color: #ccc;
  font-weight: 600;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.unroll-enter-active {
  transition: all 0.4s ease-out;
}
.unroll-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>