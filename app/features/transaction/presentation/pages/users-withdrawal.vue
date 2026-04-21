<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ListUsersWithdrawalUseCase } from '../../application/usecases/list_users_withdrawal_usecase'
import { UpdateWithdrawalUseCase } from '../../application/usecases/update_withdrawal_usecase'
import { UpdateWithdrawalRepositoryImpl } from '../../data/repositories/update_withdrawal_repository_impl'
import { ListUsersWithdrawalRepositoryImpl } from '../../data/repositories/list_users_withdrawal_repository_impl'
import { Failure } from '@/core/errors/failure'
import type { UserWithdrawalGroupViewModel } from '../viewmodels/users_withdrawal_view_model'
import type { ListUsersWithdrawalParam } from '../../application/params/list_users_withdrawal_params'
import { AppColor } from '@/core/constants/app_colors'
import { useToast } from '@/core/utils/useToast'

const { showToast } = useToast()

const withdrawals = ref<UserWithdrawalGroupViewModel[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const page = ref(1)
const limit = 25
const hasMore = ref(true)

async function loadWithdrawals() {
  if (loading.value || !hasMore.value) return

  loading.value = true
  error.value = null

  const usecase = new ListUsersWithdrawalUseCase(
    new ListUsersWithdrawalRepositoryImpl()
  )

  const param: ListUsersWithdrawalParam = {
    page: page.value,
    limit
  }

  const result = await usecase.execute(param)

  if (result instanceof Failure) {
    error.value = result.message
  } else {
    const users = result.data || []
    const total = result.total || 0

    if (page.value === 1) {
      withdrawals.value = users
    } else {
      withdrawals.value = [...withdrawals.value, ...users]
    }

    hasMore.value = withdrawals.value.length < total
  }

  loading.value = false
}

onMounted(() => {
  loadWithdrawals()
})

const loadMore = async () => {
  if (!hasMore.value) return
  page.value++
  await loadWithdrawals()
}

const showModal = ref(false)
const actionType = ref<'approve' | 'cancel' | null>(null)
const selectedId = ref<string | null>(null)

const openConfirm = (type: 'approve' | 'cancel', id: string) => {
  actionType.value = type
  selectedId.value = id
  showModal.value = true
}

const confirmAction = async () => {
  if (!selectedId.value) return

  const status =
    actionType.value === 'approve' ? 'completed' : 'rejected'

  const repository = new UpdateWithdrawalRepositoryImpl()
  const updateWithdrawalUseCase = new UpdateWithdrawalUseCase(repository)

  const result = await updateWithdrawalUseCase.execute({
    id: selectedId.value,
    status
  })

  if (result instanceof Failure) {
    showToast(result.message, 'fi-rr-cross-circle', 'error')
  } else {
    showToast(
      actionType.value === 'approve'
        ? 'Retrait validé avec succès'
        : 'Retrait annulé et remboursé',
      'fi-rr-check',
      'success'
    )

    page.value = 1
    hasMore.value = true
    withdrawals.value = []

    await loadWithdrawals()
  }

  showModal.value = false
}
const closeModal = () => {
  showModal.value = false
}
</script>

<template>
  <div v-if="showModal" class="confirm-modal">
    <div class="modal-box">
      <p class="modal-text">
        {{ actionType === 'approve'
          ? 'Voulez-vous vraiment compléter ce retrait ?'
          : 'Voulez-vous vraiment annuler ce retrait ?' }}
      </p>

      <div class="modal-actions">
        <button class="btn cancel" @click="closeModal">Non</button>
        <button class="btn confirm" @click="confirmAction">Oui</button>
      </div>
    </div>
  </div>
  <div class="withdrawal-page">

    <!-- STATES -->
    <div v-if="loading && page === 1" class="state loading">
      Chargement des retraits...
    </div>

    <div v-else-if="error" class="state error">
      {{ error }}
    </div>

    <div v-else-if="withdrawals.length === 0" class="state empty">
      Aucun retrait trouvé
    </div>

    <!-- LIST -->
    <div v-else class="withdrawal-grid">

      <div v-for="user in withdrawals" :key="user.userId" class="withdrawal-card">
        <div class="user-header">
          <div class="avatar-mini">
            {{ user.role }}
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

        <div class="history-list">
          <div v-for="(amount, index) in user.validatedAmounts" :key="index" class="history-chip">
            {{ amount.toLocaleString() }} XOF
          </div>
        </div>

        <div class="pending-section">
          <div v-for="pending in user.pendingWithdrawals" :key="pending.id" class="pending-row">
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
              <button class="btn-mini cancel" @click="openConfirm('cancel', pending.id)">
                ✕
              </button>

              <button class="btn-mini approve" @click="openConfirm('approve', pending.id)">
                ✓
              </button>
            </div>
          </div>
        </div>
      </div>


      <!-- LOAD MORE -->
      <div v-if="hasMore" class="load-more-container">
        <button @click="loadMore" :disabled="loading" class="btn-load-more">
          <span v-if="loading">Chargement...</span>
          <span v-else>Voir plus de retraits</span>
        </button>
      </div>

    </div>
  </div>

</template>

<style scoped>
/*modal*/
/*modal*/
.confirm-modal {
  position: fixed;
  /* On remplace bottom par top */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* On ajoute un fond semi-transparent pour faire ressortir le modal */
  background: rgba(0, 0, 0, 0.229); 
  display: flex;
  align-items: center; /* Centrage vertical */
  justify-content: center; /* Centrage horizontal */
  z-index: 999;
}

.modal-box {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%; /* Pour mobile */
  max-width: 320px; /* Taille max sur écran large */
  /* On enlève le transform précédent */
}

/* ... le reste de ton CSS ne change pas ... */

.modal-text {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
}

.btn.cancel {
  background: #f3f4f6;
}

.btn.confirm {
  background: v-bind('AppColor.primary.base');
  color: white;
}

/*modal*/
.load-more-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.btn-load-more {
  background: v-bind('AppColor.surface.pure');
  border: 2px solid v-bind('AppColor.primary.base');
  color: v-bind('AppColor.primary.base');
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
}

.btn-load-more:hover:not(:disabled) {
  background: v-bind('AppColor.primary.base');
  color: white;
}

.withdrawal-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}


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
  width: 43px;
  height: 32px;
  border-radius: 7px;
  background: linear-gradient(135deg,
      v-bind('AppColor.primary.base'),
      v-bind('AppColor.primary.dark'));
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