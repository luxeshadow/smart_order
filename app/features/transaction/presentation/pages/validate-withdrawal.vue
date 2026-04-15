<script setup lang="ts">
import { computed, ref } from 'vue'
import Input from '@/core/components/client/mobile/Input.vue'

interface PendingWithdrawal {
  id: number
  amount: number
  createdAt: string
}

interface GroupedWithdrawal {
  id: number
  username: string
  email: string
  validatedWithdrawals: number[]
  pendingWithdrawals: PendingWithdrawal[]
}

const search = ref('')

const withdrawals = ref<GroupedWithdrawal[]>([
  {
    id: 1,
    username: 'natanael',
    email: 'nat@gmail.com',
    validatedWithdrawals: [10000, 15000, 12000],
    pendingWithdrawals: [
      { id: 11, amount: 25000, createdAt: '11 Avr 2026' },
      { id: 12, amount: 18000, createdAt: '12 Avr 2026' }
    ]
  },
  {
    id: 2,
    username: 'shadow',
    email: 'shadow@gmail.com',
    validatedWithdrawals: [20000, 8000],
    pendingWithdrawals: [
      { id: 21, amount: 45000, createdAt: '10 Avr 2026' }
    ]
  }
])

const filteredWithdrawals = computed(() => {
  const keyword = search.value.toLowerCase()

  return withdrawals.value.filter((item) => {
    return (
      item.username.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    )
  })
})

const totalPending = (items: PendingWithdrawal[]) => {
  return items.reduce((sum, item) => sum + item.amount, 0)
}

const clearSearch = () => {
  search.value = ''
}

const approveWithdrawal = (id: number) => {
  console.log('Validate:', id)
}

const cancelWithdrawal = (id: number) => {
  console.log('Cancel:', id)
}
</script>


<template>
  <div class="withdrawal-page">
    <div class="filters">
      <div class="search-box">
        <Input
          id="search-withdrawal"
          v-model="search"
          label="Recherche"
          icon="fi-rr-search"
        />

        <button v-if="search" class="clear-btn" @click="clearSearch">
          <i class="fi fi-rr-cross-small"></i>
        </button>
      </div>
    </div>

    <div class="withdrawal-grid">
      <div
        v-for="user in filteredWithdrawals"
        :key="user.id"
        class="withdrawal-card"
      >
        <!-- Header -->
        <div class="user-header">
          <div class="avatar">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>

          <div class="user-meta">
            <h3>{{ user.username }}</h3>
            <p>{{ user.email }}</p>
          </div>

          <div class="pending-badge">
            {{ user.pendingWithdrawals.length }} en cours
          </div>
        </div>

        <!-- Historique validé -->
        <div class="history-section">
          <span class="section-title">Déjà validés</span>
          <div class="history-list">
            <div
              v-for="(history, index) in user.validatedWithdrawals"
              :key="index"
              class="history-chip"
            >
              {{ history.toLocaleString() }} XOF
            </div>
          </div>
        </div>

        <!-- Pending withdrawals -->
        <div class="pending-list">
          <div
            v-for="pending in user.pendingWithdrawals"
            :key="pending.id"
            class="pending-item"
          >
            <div class="pending-info">
              <span>Montant</span>
              <strong>{{ pending.amount.toLocaleString() }} XOF</strong>
            </div>

            <div class="pending-info">
              <span>Date</span>
              <strong>{{ pending.createdAt }}</strong>
            </div>

            <div class="pending-actions">
              <button
                class="action-badge cancel"
                @click="cancelWithdrawal(pending.id)"
              >
                <i class="fi fi-rr-cross-small"></i>
              </button>

              <button
                class="action-badge approve"
                @click="approveWithdrawal(pending.id)"
              >
                <i class="fi fi-rr-check"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer stats -->
        <div class="summary-box">
          <span>Total en attente</span>
          <strong>
            {{ totalPending(user.pendingWithdrawals).toLocaleString() }} XOF
          </strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.withdrawal-grid {
  display: grid;
  gap: 14px;
}

.withdrawal-card {
  background: v-bind('AppColor.surface.pure');
  border: 1px solid v-bind('AppColor.surface.bone');
  border-radius: 24px;
  padding: 16px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: white;
  font-weight: 800;
  background: linear-gradient(
    135deg,
    v-bind('AppColor.primary.base'),
    v-bind('AppColor.primary.dark')
  );
}

.user-meta {
  flex: 1;
}

.pending-badge {
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.history-section {
  margin-top: 14px;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  color: v-bind('AppColor.tertiary.soft');
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.history-chip {
  padding: 5px 10px;
  border-radius: 999px;
  background: v-bind('AppColor.secondary.light');
  font-size: 10px;
  font-weight: 700;
}

.pending-list {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.pending-item {
  border: 1px solid v-bind('AppColor.surface.bone');
  border-radius: 18px;
  padding: 12px;
}

.pending-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.pending-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.summary-box {
  margin-top: 14px;
  border-radius: 18px;
  padding: 12px;
  background: v-bind('AppColor.surface.off');
  display: flex;
  justify-content: space-between;
  font-weight: 700;
}
</style>