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
  <div class="withdrawal-page">
    <div class="filters">
      <div class="search-box">
        <Input
          id="search-withdrawal"
          v-model="search"
          label="Recherche"
          icon="fi-rr-search"
        />

        <button
          v-if="search"
          class="clear-btn"
          @click="clearSearch"
        >
          <i class="fi fi-rr-cross-small"></i>
        </button>
      </div>

      <input
        v-model="filterDate"
        type="date"
        class="date-filter"
      />
    </div>

    <div class="withdrawal-grid">
      <div
        v-for="item in filteredWithdrawals"
        :key="item.id"
        class="withdrawal-card"
      >
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
          <div
            v-for="(history, index) in item.previousWithdrawals"
            :key="index"
            class="history-chip"
          >
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

        <div class="actions">
          <button
            class="cancel-btn"
            @click="cancelWithdrawal(item.id)"
          >
            Annuler
          </button>

          <button
            class="approve-btn"
            @click="approveWithdrawal(item.id)"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.withdrawal-page {

}

.filters {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

.search-box {
  position: relative;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 52px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-filter {
  height: 46px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 0 14px;
  outline: none;
}

/* LIST */
.withdrawal-grid {
  display: grid;
  gap: 10px;
}

.withdrawal-card {
  background: white;
  border: 1px solid v-bind('AppColor.primary.light');
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(255, 94, 0, 0.05);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    v-bind('AppColor.primary.base'),
    v-bind('AppColor.primary.dark')
  );
  color: white;
  font-weight: 800;
  font-size: 16px;
  display: grid;
  place-items: center;
}

.user-meta h3 {
  margin: 0;
  font-size: 14px;
}

.user-meta p {
  margin: 2px 0 0;
  font-size: 11px;
  color: #64748b;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.history-chip {
  padding: 4px 8px;
  border-radius: 999px;
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.dark');
  font-size: 10px;
  font-weight: 700;
}

.withdrawal-info {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.info-box {
  flex: 1;
  border-radius: 12px;
  padding: 8px 10px;
}

.amount {
  background: rgba(255, 94, 0, 0.06);
}

.date {
  background: rgba(255, 183, 77, 0.12);
}

.info-box span {
  display: block;
  font-size: 10px;
  color: #64748b;
}

.info-box strong {
  font-size: 13px;
  font-weight: 800;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.actions button {
  flex: 1;
  height: 42px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-btn {
  background: #f1f5f9;
  color: #334155;
}

.approve-btn {
  background: v-bind('AppColor.primary.base');
  color: white;
}
</style>