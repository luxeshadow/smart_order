<script setup lang="ts">
import { computed, ref } from 'vue'
import Input from '@/core/components/client/mobile/Input.vue'
import { AppColor } from '@/core/constants/app_colors'

interface WithdrawalRequest {
  id: number
  username: string
  email: string
  amount: number
  createdAt: string
  previousWithdrawals: number[]
}

const search = ref('')
const filterDate = ref('')

const withdrawals = ref<WithdrawalRequest[]>([
  {
    id: 1,
    username: 'natanael',
    email: 'nat@gmail.com',
    amount: 25000,
    createdAt: '2026-04-11',
    previousWithdrawals: [10000, 15000, 12000]
  },
  {
    id: 2,
    username: 'shadow',
    email: 'shadow@gmail.com',
    amount: 45000,
    createdAt: '2026-04-10',
    previousWithdrawals: [20000, 8000]
  },
  {
    id: 3,
    username: 'benoit',
    email: 'benoit@gmail.com',
    amount: 30000,
    createdAt: '2026-04-11',
    previousWithdrawals: [5000]
  }
])

const filteredWithdrawals = computed(() => {
  const keyword = search.value.toLowerCase()

  return withdrawals.value.filter((item) => {
    const matchesSearch =
      item.username.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)

    const matchesDate =
      !filterDate.value || item.createdAt === filterDate.value

    return matchesSearch && matchesDate
  })
})

const clearSearch = () => {
  search.value = ''
}

const approveWithdrawal = (id: number) => {
  console.log('validate', id)
}

const cancelWithdrawal = (id: number) => {
  console.log('cancel', id)
}
</script>

<template>
  <div class="withdrawal-grid">
    <div v-for="item in filteredWithdrawals" :key="item.id" class="withdrawal-card">
      
      <div class="card-actions-top">
        <button class="action-badge cancel" @click="cancelWithdrawal(item.id)">
          <i class="fi fi-rr-cross-small"></i>
        </button>
        <button class="action-badge approve" @click="approveWithdrawal(item.id)">
          <i class="fi fi-rr-check"></i>
        </button>
      </div>

      <div class="user-header">
        <div class="avatar">
          {{ item.username.charAt(0).toUpperCase() }}
        </div>
        <div class="user-meta">
          <h3>{{ item.username }}</h3>
          <p>{{ item.email }}</p>
        </div>
      </div>

      <div class="history-list">
        <div v-for="(history, index) in item.previousWithdrawals" :key="index" class="history-chip">
          {{ history.toLocaleString() }} XOF
        </div>
      </div>

      <div class="withdrawal-info">
        <div class="info-box amount">
          <span>Montant</span>
          <strong>{{ item.amount.toLocaleString() }} XOF</strong>
        </div>
        <div class="info-box date">
          <span>Date</span>
          <strong>{{ item.createdAt }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.withdrawal-card {
  position: relative; /* Indispensable pour placer les badges */
  background: white;
  border: 1px solid v-bind('AppColor.surface.bone');
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: transform 0.2s;
}

/* CONTAINER DES BADGES */
.card-actions-top {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 5;
}

/* STYLE DES BADGES */
.action-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-badge i {
  font-size: 16px;
}

/* Badge Annuler (Gris/Rouge soft) */
.cancel {
  background-color: #F1F5F9;
  color: #64748B;
}

.cancel:active {
  background-color: #FEE2E2;
  color: #EF4444;
  transform: scale(0.9);
}

/* Badge Valider (Orange/Primary) */
.approve {
  background-color: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
}

.approve:active {
  background-color: v-bind('AppColor.primary.base');
  color: white;
  transform: scale(0.9);
}

/* Ajustements pour que le texte du header ne touche pas les badges */
.user-meta {
  padding-right: 70px; /* On laisse de la place pour les badges */
}

/* On supprime l'ancien bloc .actions qui était en bas */
</style>