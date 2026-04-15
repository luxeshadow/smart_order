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
    validatedWithdrawals: [10000, 15000],
    pendingWithdrawals: [
      { id: 101, amount: 25000, createdAt: '11 Avr 2026' },
      { id: 102, amount: 18000, createdAt: '12 Avr 2026' }
    ]
  }
])

const filteredWithdrawals = computed(() => {
  const keyword = search.value.toLowerCase()

  return withdrawals.value.filter(
    (item) =>
      item.username.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
  )
})

const totalPending = (items: PendingWithdrawal[]) =>
  items.reduce((sum, item) => sum + item.amount, 0)

const clearSearch = () => {
  search.value = ''
}

const approveWithdrawal = (userId: number, withdrawalId: number) => {
  console.log('validate', userId, withdrawalId)
}

const cancelWithdrawal = (userId: number, withdrawalId: number) => {
  console.log('cancel', userId, withdrawalId)
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
        <!-- user -->
        <div class="user-header">
          <div class="avatar">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>

          <div class="user-meta">
            <h3>{{ user.username }}</h3>
            <p>{{ user.email }}</p>
          </div>

          <div class="pending-badge">
            {{ user.pendingWithdrawals.length }}
          </div>
        </div>

        <!-- validated -->
        <div class="history-section">
          <span class="section-title">Retraits validés</span>
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

        <!-- pending individually -->
        <div class="pending-list">
          <div
            v-for="pending in user.pendingWithdrawals"
            :key="pending.id"
            class="pending-item"
          >
            <div class="pending-main">
              <div class="pending-data">
                <span class="label">Montant</span>
                <strong>{{ pending.amount.toLocaleString() }} XOF</strong>
              </div>

              <div class="pending-data">
                <span class="label">Date</span>
                <strong>{{ pending.createdAt }}</strong>
              </div>
            </div>

            <div class="pending-actions">
              <button
                class="action-btn cancel"
                @click="cancelWithdrawal(user.id, pending.id)"
              >
                <i class="fi fi-rr-cross-small"></i>
              </button>

              <button
                class="action-btn approve"
                @click="approveWithdrawal(user.id, pending.id)"
              >
                <i class="fi fi-rr-check"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="summary-box">
          <span>Total en attente</span>
          <strong>{{ totalPending(user.pendingWithdrawals).toLocaleString() }} XOF</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.withdrawal-grid {
  display: grid;
  gap: 16px;
}

.withdrawal-card {
  background: v-bind('AppColor.surface.pure');
  border: 1px solid v-bind('AppColor.surface.bone');
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
}

/* HEADER USER */
.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(
    135deg,
    v-bind('AppColor.primary.base'),
    v-bind('AppColor.primary.dark')
  );
  flex-shrink: 0;
}

.user-meta {
  flex: 1;
  min-width: 0;
}

.user-meta h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: v-bind('AppColor.tertiary.base');
}

.user-meta p {
  margin: 3px 0 0;
  font-size: 11px;
  color: v-bind('AppColor.tertiary.soft');
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pending-badge {
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

/* HISTORIQUE */
.history-section {
  margin-top: 16px;
}

.section-title {
  font-size: 11px;
  font-weight: 800;
  color: v-bind('AppColor.tertiary.soft');
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.history-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: v-bind('AppColor.secondary.light');
  color: v-bind('AppColor.secondary.dark');
  font-size: 10px;
  font-weight: 700;
}

/* LISTE PENDING */
.pending-list {
  margin-top: 16px;
  display: grid;
  gap: 12px;
}

.pending-item {
  border: 1px solid v-bind('AppColor.surface.bone');
  border-radius: 18px;
  padding: 14px;
  background: white;
}

.pending-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.pending-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pending-amount {
  font-size: 16px;
  font-weight: 800;
  color: v-bind('AppColor.tertiary.charcoal');
}

.pending-date {
  font-size: 11px;
  color: v-bind('AppColor.tertiary.soft');
}

/* ACTIONS */
.pending-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn i {
  font-size: 15px;
}

.cancel-btn {
  background: #fef2f2;
  color: #dc2626;
}

.cancel-btn:active {
  transform: scale(0.92);
}

.validate-btn {
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
}

.validate-btn:active {
  transform: scale(0.92);
}

/* FOOTER SUMMARY */
.summary-box {
  margin-top: 16px;
  border-radius: 18px;
  padding: 14px;
  background: v-bind('AppColor.surface.off');
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 12px;
  color: v-bind('AppColor.tertiary.soft');
  font-weight: 700;
}

.summary-value {
  font-size: 16px;
  font-weight: 800;
  color: v-bind('AppColor.primary.base');
}
</style>