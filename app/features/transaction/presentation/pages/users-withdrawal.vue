<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ListUsersWithdrawalUseCase } from '../../application/usecases/list_users_withdrawal_usecase'
import { ListUsersWithdrawalRepositoryImpl } from '../../data/repositories/list_users_withdrawal_repository_impl'
import { Failure } from '@/core/errors/failure'
import type { UserWithdrawalGroupViewModel } from '../viewmodels/users_withdrawal_view_model'

const withdrawals = ref<UserWithdrawalGroupViewModel[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true

  const usecase = new ListUsersWithdrawalUseCase(
    new ListUsersWithdrawalRepositoryImpl()
  )

  const result = await usecase.execute()

  if (result instanceof Failure) {
    error.value = result.message
  } else {
    withdrawals.value = result
  }

  loading.value = false
})

// actions
const approveWithdrawal = (id: string) => {
  console.log('Validate:', id)
}

const cancelWithdrawal = (id: string) => {
  console.log('Cancel:', id)
}
</script>

<template>
  <div class="withdrawal-page">

    <div v-if="loading" class="state loading">
      Chargement des retraits...
    </div>

    <div v-else-if="error" class="state error">
      {{ error }}
    </div>
    <div v-else-if="withdrawals.length === 0" class="state empty">
      Aucun retrait trouvé
    </div>

    <!-- DATA -->
    <div v-else class="withdrawal-grid">
      <div
        v-for="user in withdrawals"
        :key="user.userId"
        class="withdrawal-card"
      >

        <!-- HEADER -->
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

              <span class="pending-count">
                {{ user.pendingCount }} en cours
              </span>
            </div>
          </div>
        </div>

        <!-- VALIDATED -->
        <div class="history-list">
          <div
            v-for="(amount, index) in user.validatedAmounts"
            :key="index"
            class="history-chip"
          >
            {{ amount.toLocaleString() }} XOF
          </div>
        </div>

        <!-- PENDING -->
        <div class="pending-section">
          <div
            v-for="pending in user.pendingWithdrawals"
            :key="pending.id"
            class="pending-row"
          >
            <div class="amount-group">
              <div class="amount-line">
                <span class="amount">
                  {{ pending.amount.toLocaleString() }} XOF
                </span>
                <span class="method-badge">
                  {{ pending.method }}
                </span>
              </div>
              <span class="date">{{ pending.createdAt }}</span>
            </div>

            <div class="actions">
              <button
                class="btn-mini cancel"
                @click="cancelWithdrawal(pending.id)"
              >
                <i class="fi fi-rr-cross-small"></i>
              </button>

              <button
                class="btn-mini approve"
                @click="approveWithdrawal(pending.id)"
              >
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

.amount-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-badge {
  font-size: 9px;
  background: #004a99;
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
  background: linear-gradient(
    135deg,
    v-bind('AppColor.primary.base'),
    v-bind('AppColor.primary.dark')
  );
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

/* STATES */
.state {
  text-align: center;
  padding: 20px;
  font-weight: 600;
}

.state.loading {
  color: v-bind('AppColor.tertiary.soft');
}

.state.error {
  color: #dc2626;
}

.state.empty {
  color: v-bind('AppColor.tertiary.soft');
}
</style>