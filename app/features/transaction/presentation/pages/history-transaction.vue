<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AppColor } from "@/core/constants/app_colors"

const router = useRouter()

// Simulation des données (À remplacer par ton API plus tard)
const transactions = [
  {
    id: 1,
    type: 'Dépôt',
    method: 'T-Money',
    amount: '+ 10,000',
    date: '03 Avr 2024, 14:20',
    status: 'Succès',
    icon: 'fi-rr-arrow-trend-up',
    color: '#27ae60'
  },
  {
    id: 2,
    type: 'Retrait',
    method: 'Moov Money',
    amount: '- 5,000',
    date: '02 Avr 2024, 09:15',
    status: 'En attente',
    icon: 'fi-rr-arrow-trend-down',
    color: '#e67e22'
  },
  {
    id: 3,
    type: 'Dépôt',
    method: 'T-Money',
    amount: '+ 25,000',
    date: '01 Avr 2024, 18:45',
    status: 'Succès',
    icon: 'fi-rr-arrow-trend-up',
    color: '#27ae60'
  },
  {
    id: 4,
    type: 'Retrait',
    method: 'T-Money',
    amount: '- 2,000',
    date: '30 Mar 2024, 10:00',
    status: 'Échoué',
    icon: 'fi-rr-cross-circle',
    color: '#eb4d4b'
  }
]

const getStatusClass = (status: string) => {
  if (status === 'Succès') return 'status-success'
  if (status === 'En attente') return 'status-pending'
  return 'status-error'
}

const getMethodClass = (method: string) => {
  return method.toLowerCase().includes('tmoney') ? 'method-tmoney' : 'method-moov'
}
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
      <div class="filter-chip active">Tout</div>
      <div class="filter-chip">Dépôts</div>
      <div class="filter-chip">Retraits</div>
    </div>

    <div class="transaction-list">
      <div v-for="item in transactions" :key="item.id" class="transaction-card">
        <div class="card-left">
          <div class="type-icon" :style="{ color: item.color, backgroundColor: item.color + '15' }">
            <i :class="['fi', item.icon]"></i>
          </div>
          <div class="details">
            <span class="trans-type">{{ item.type }}</span>
            <span class="trans-date">{{ item.date }}</span>
          </div>
        </div>

        <div class="card-right">
          <span class="trans-amount" :style="{ color: item.amount.startsWith('+') ? '#27ae60' : '#111' }">
            {{ item.amount }} <small>XOF</small>
          </span>
          <div class="meta-row">
             <span :class="['method-badge', getMethodClass(item.method)]">{{ item.method }}</span>
             <span :class="['status-dot-text', getStatusClass(item.status)]">{{ item.status }}</span>
          </div>
        </div>
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