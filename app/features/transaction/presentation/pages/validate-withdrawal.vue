<script setup lang="ts">
import { computed, ref } from 'vue'
import Input from '@/core/components/client/mobile/Input.vue'

interface PendingWithdrawal {
  id: number
  amount: number
  createdAt: string
  method: string 
}

interface GroupedWithdrawal {
  id: number
  username: string
  email: string
  phone: string
  validatedWithdrawals: number[]
  pendingWithdrawals: PendingWithdrawal[]
}

const search = ref('')

const withdrawals = ref<GroupedWithdrawal[]>([
  {
    id: 1,
    username: 'natanael',
    email: 'nat@gmail.com',
    phone: '+225 0707070707',
    validatedWithdrawals: [10000, 15000, 12000],
    pendingWithdrawals: [
      { id: 11, amount: 25000, createdAt: '11 Avr 2026', method: 'Tmoney' },
      { id: 12, amount: 18000, createdAt: '12 Avr 2026', method: 'Tmoney' }
    ]
  },
  {
    id: 2,
    username: 'shadow',
    email: 'shadow@gmail.com',
    phone: '+225 0505050505',
    validatedWithdrawals: [20000, 8000],
    pendingWithdrawals: [
      { id: 21, amount: 45000, createdAt: '10 Avr 2026', method: 'Tmoney' }
    ]
  }
])

const filteredWithdrawals = computed(() => {
  const keyword = search.value.toLowerCase()
  return withdrawals.value.filter((item) =>
    item.username.toLowerCase().includes(keyword) ||
    item.email.toLowerCase().includes(keyword) ||
    item.phone.includes(keyword)
  )
})

const clearSearch = () => { search.value = '' }
const approveWithdrawal = (id: number) => { console.log('Validate:', id) }
const cancelWithdrawal = (id: number) => { console.log('Cancel:', id) }
</script>

<template>
  <div class="withdrawal-page">
    <div class="filters">
      <div class="search-box">
        <Input id="search-withdrawal" v-model="search" label="Recherche" icon="fi-rr-search" />
        <button v-if="search" class="clear-btn" @click="clearSearch">
          <i class="fi fi-rr-cross-small"></i>
        </button>
      </div>
    </div>

    <div class="withdrawal-grid">
      <div v-for="user in filteredWithdrawals" :key="user.id" class="withdrawal-card">

        <div class="user-header">
          <div class="avatar-mini">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>

          <div class="user-meta">
            <div class="main-line">
              <div class="user-identity">
                <h3>{{ user.username }}</h3>
                <span class="phone-text">{{ user.phone }}</span>
              </div>
              <span class="pending-count">{{ user.pendingWithdrawals.length }} en cours</span>
            </div>
          </div>
        </div>

        <div class="history-list">
          <div v-for="(history, index) in user.validatedWithdrawals" :key="index" class="history-chip">
            {{ history.toLocaleString() }}
          </div>
        </div>

        <div class="pending-section">
          <div v-for="pending in user.pendingWithdrawals" :key="pending.id" class="pending-row">
            <div class="amount-group">
              <div class="amount-line">
                <span class="amount">{{ pending.amount.toLocaleString() }} XOF</span>
                <span class="method-badge">{{ pending.method }}</span>
              </div>
              <span class="date">{{ pending.createdAt }}</span>
            </div>

            <div class="actions">
              <button class="btn-mini cancel" @click="cancelWithdrawal(pending.id)">
                <i class="fi fi-rr-cross-small"></i>
              </button>
              <button class="btn-mini approve" @click="approveWithdrawal(pending.id)">
                <i class="fi fi-rr-check"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.withdrawal-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.withdrawal-card {
  background: v-bind('AppColor.surface.pure');
  border: 1px solid v-bind('AppColor.surface.bone');
  border-radius: 16px;
  padding: 12px;
}

.user-header {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

/* Nouveaux styles pour la ligne de montant et le badge */
.amount-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-badge {
  font-size: 9px;
  background: #004a99;
  /* Couleur Tmoney ou une couleur distinctive */
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
}

.avatar-mini {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, v-bind('AppColor.primary.base'), v-bind('AppColor.primary.dark'));
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
  flex-shrink: 0;
}

.user-meta {
  flex: 1;
}

.main-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-identity {
  display: flex;
  flex-direction: column;
}

.user-identity h3 {
  font-size: 14px;
  margin: 0;
  color: v-bind('AppColor.tertiary.base');
  font-weight: 800;
}

.phone-text {
  font-size: 10px;
  color: v-bind('AppColor.tertiary.soft');
  font-weight: 600;
}

.pending-count {
  font-size: 9px;
  font-weight: 800;
  color: v-bind('AppColor.tertiary.soft');
  text-transform: uppercase;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.history-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: v-bind('AppColor.secondary.light');
  color: v-bind('AppColor.secondary.dark');
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pending-section {
  margin-top: 10px;
  border-top: 1px solid v-bind('AppColor.surface.bone');
  padding-top: 6px;
}

.pending-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.pending-row:not(:last-child) {
  border-bottom: 1px dashed v-bind('AppColor.surface.bone');
}

.amount-group {
  display: flex;
  flex-direction: column;
}

.amount {
  font-size: 13px;
  font-weight: 800;
  color: v-bind('AppColor.tertiary.base');
}

.date {
  font-size: 10px;
  color: v-bind('AppColor.tertiary.soft');
}

.actions {
  display: flex;
  gap: 6px;
}

.btn-mini {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.btn-mini.cancel {
  background: #fef2f2;
  color: #dc2626;
}

.btn-mini.approve {
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
}
</style>