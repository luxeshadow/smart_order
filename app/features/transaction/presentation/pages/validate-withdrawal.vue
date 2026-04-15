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

    <div class="withdrawal-list">
      <div
        v-for="user in filteredWithdrawals"
        :key="user.id"
        class="user-row"
      >
        <div class="row-main">
          <div class="user-info">
            <div class="avatar-mini">
              {{ user.username.charAt(0).toUpperCase() }}
            </div>
            <div class="user-details">
              <h3>{{ user.username }}</h3>
              <p>{{ user.email }}</p>
            </div>
          </div>

          <div class="user-stats">
            <span class="total-amount">{{ totalPending(user.pendingWithdrawals).toLocaleString() }} XOF</span>
            <span class="count-badge">{{ user.pendingWithdrawals.length }} en attente</span>
          </div>
        </div>

        <div class="pending-container">
          <div
            v-for="pending in user.pendingWithdrawals"
            :key="pending.id"
            class="compact-item"
          >
            <div class="item-data">
              <span class="item-amount">{{ pending.amount.toLocaleString() }} XOF</span>
              <span class="item-date">{{ pending.createdAt }}</span>
            </div>

            <div class="item-actions">
              <button class="btn-icon cancel" @click="cancelWithdrawal(user.id, pending.id)">
                <i class="fi fi-rr-cross-small"></i>
              </button>
              <button class="btn-icon approve" @click="approveWithdrawal(user.id, pending.id)">
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
.withdrawal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
}

.user-row {
  background: v-bind('AppColor.surface.pure');
  border: 1px solid v-bind('AppColor.surface.bone');
  border-radius: 16px;
  overflow: hidden;
}

/* HEADER COMPACT */
.row-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: v-bind('AppColor.surface.off');
  border-bottom: 1px solid v-bind('AppColor.surface.bone');
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
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
  font-size: 14px;
}

.user-details h3 {
  font-size: 14px;
  margin: 0;
  color: v-bind('AppColor.tertiary.base');
}

.user-details p {
  font-size: 10px;
  margin: 0;
  color: v-bind('AppColor.tertiary.soft');
}

.user-stats {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.total-amount {
  font-size: 14px;
  font-weight: 800;
  color: v-bind('AppColor.primary.base');
}

.count-badge {
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 700;
  color: v-bind('AppColor.tertiary.soft');
}

/* LISTE DES ITEMS RÉDUITE */
.pending-container {
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed v-bind('AppColor.surface.bone');
}

.compact-item:last-child {
  border-bottom: none;
}

.item-data {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.item-amount {
  font-size: 13px;
  font-weight: 700;
}

.item-date {
  font-size: 11px;
  color: v-bind('AppColor.tertiary.soft');
}

/* ACTIONS MINI */
.item-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: 0.2s;
}

.btn-icon.cancel {
  background: #fef2f2;
  color: #dc2626;
}

.btn-icon.approve {
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
}

.btn-icon:active {
  transform: scale(0.9);
}
</style>