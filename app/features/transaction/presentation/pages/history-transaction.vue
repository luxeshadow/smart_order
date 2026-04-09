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

.history-page {
  padding: 15px;
  padding-top: 85px;
  background: #fff;
  min-height: 100vh;
}

.app-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 65px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 15px;
  z-index: 1000;
  border-bottom: 1px solid #f1f1f1;
}

.back-btn {
  width: 45px; height: 45px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}

.app-bar-title {
  flex: 1; text-align: center;
  font-weight: 800; font-size: 17px;
  color: #111;
}

.spacer { width: 45px; }

/* Filtres */
.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.filter-chip {
  padding: 8px 18px;
  background: #f5f5f5;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #888;
  white-space: nowrap;
}

.filter-chip.active {
  background: v-bind('AppColor.primary.base');
  color: white;
}

/* Liste de Transactions */
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #fbfbfb;
  border: 1px solid #f1f1f1;
  border-radius: 20px;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-icon {
  width: 45px;
  height: 45px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.details {
  display: flex;
  flex-direction: column;
}

.trans-type {
  font-weight: 800;
  font-size: 15px;
  color: #111;
}

.trans-date {
  font-size: 11px;
  color: #aaa;
  font-weight: 600;
}

.card-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trans-amount {
  font-weight: 900;
  font-size: 16px;
}

.trans-amount small {
  font-size: 10px;
  opacity: 0.6;
}

.meta-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
}

/* Badges Méthodes */
.method-badge {
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 6px;
    text-transform: uppercase;
}

.method-tmoney {
    background: #FFD70030;
    color: #b8860b;
}

.method-moov {
    background: #00a8ff20;
    color: #0097e6;
}

/* Statuts */
.status-dot-text {
  font-size: 10px;
  font-weight: 800;
}

.status-success { color: #27ae60; }
.status-pending { color: #e67e22; }
.status-error { color: #eb4d4b; }

</style>