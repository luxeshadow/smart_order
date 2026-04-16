<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'
import { useTransactionStore } from '@/features/transaction/presentation/stores/transaction_store'
import { useLevelStore } from '@/features/level/presentation/stores/level_store'
import { useOrderStore } from '@/features/order/presentation/stores/my_order_item_store'
import { ShowMyPrincipalBalanceUseCase } from '~/features/transaction/application/usecases/show_my_principal_balance_usecase'
import { ShowMyPrincipalBalanceRepositoryImpl } from '~/features/transaction/data/repositories/show_my_principal_balance_repository_impl'
import { ListMyLevelUseCase } from '@/features/level/application/usecases/list_my_level_usecase'
import { ListMyLevelRepositoryImpl } from '@/features/level/data/repositories/list_my_level_repository_impl'
import { ListMyOrderItemUseCase } from '@/features/order/application/usecases/list_my_order_item_usecase'
import { ListMyOrderItemRepositoryImpl } from '@/features/order/data/repositories/list_my_order_item_repository_impl'

import { Failure } from '@/core/errors/failure'

const authStore = useAuthStore()
const transactionStore = useTransactionStore()
const levelStore = useLevelStore()
const orderStore = useOrderStore()

const balanceUseCase = new ShowMyPrincipalBalanceUseCase(new ShowMyPrincipalBalanceRepositoryImpl())
const myLevelsUseCase = new ListMyLevelUseCase(new ListMyLevelRepositoryImpl())
const listOrdersUseCase = new ListMyOrderItemUseCase(new ListMyOrderItemRepositoryImpl())



const mainBalanceRaw = computed(() => transactionStore.mainBalance)
const dailyEarningsRaw = computed(() => transactionStore.dailyEarnings)
const refundBalanceRaw = computed(() => transactionStore.refundBalance)
const allLevels = computed(() => levelStore.levels)
const myLevels = computed(() => levelStore.myLevels)

const itemsCount = computed(() => orderStore.items.length)

const isLevelActive = (levelId: string) => {
  return myLevels.value.some(l => l.id === levelId)
}

const formatCurrency = (value: number | null): string => {
  if (value === null || value === undefined) return "00,000,000";
  const formatted = value.toLocaleString('fr-FR').replace(/\s/g, ',');
  return value < 10000000 ? formatted.padStart(10, '0') : formatted;
}

const fetchData = async () => {
  if (!authStore.user?.id) return
  const userId = authStore.user.id

  const balanceResult = await balanceUseCase.execute({ userId })
  if (!(balanceResult instanceof Failure)) {
    transactionStore.updateAllBalances(balanceResult)
  }

  const myLevelsResult = await myLevelsUseCase.execute(userId)
  if (!(myLevelsResult instanceof Failure)) {
    levelStore.updateMyLevels(myLevelsResult)
  }

  const ordersResult = await listOrdersUseCase.execute({ userId })
  if (!(ordersResult instanceof Failure)) {
    orderStore.setItems(ordersResult)
  }
}

onMounted(() => {
  fetchData()
})

defineProps({
  today: { type: String, default: () => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()) },
  pendingOrders: { type: Number, default: 0 }
})
</script>

<template>
  <div class="metrics-card">
    <div class="levels-sidebar">
      <div v-for="level in allLevels" :key="level.id" class="level-item">
        <span class="level-name">{{ level.name }}</span>
        <span :class="['status-badge', isLevelActive(level.id) ? 'is-active' : 'is-locked']">
          {{ isLevelActive(level.id) ? 'ON' : 'OFF' }}
        </span>
      </div>
    </div>

    <div class="metrics-content">
      <div class="header-row">
        <span class="date-label">{{ today }}</span>
        <div class="pending-tag">
          <i class="fi fi-rr-time-past"></i>
          {{ itemsCount }} en attente
        </div>
      </div>

      <div class="balance-section">
        <div class="balance-item">
          <p class="label">Solde Principal</p>
          <h2 class="value main">
            {{ formatCurrency(mainBalanceRaw) }} <small>XOF</small>
          </h2>
        </div>
        
        <div class="balance-grid">
          <div class="balance-item">
            <p class="label">Gain Journalier</p>
            <h2 class="value profit">
              {{ formatCurrency(dailyEarningsRaw) }} <small>XOF</small>
            </h2>
          </div>

          <div class="balance-item">
            <p class="label">Remboursement</p>
            <h2 class="value refund">
              {{ formatCurrency(refundBalanceRaw) }} <small>XOF</small>
            </h2>
          </div>
        </div>
      </div>

      <div class="footer-info">
        <i class="fi fi-rr-box"></i>
        <span><strong></strong> produits / commande</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metrics-card {
  display: flex;
  background: v-bind('AppColor.surface.pure');
  border-radius: 24px;
  margin: 10px;
  overflow: hidden;
  border: 1px solid v-bind('AppColor.surface.bone');
}

.levels-sidebar {
  width: 90px;
  background: #fcfcfc;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 15px 5px;
}

.level-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.level-name {
  font-size: 11px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
}

.status-badge {
  font-size: 9px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.status-badge.is-active {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.status-badge.is-locked {
  background: #f0f0f0;
  color: #bbb;
}

.metrics-content {
  flex: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-label {
  font-size: 12px;
  font-weight: 600;
  color: #888;
}

.pending-tag {
  background: rgba(255, 152, 0, 0.1);
  color: v-bind('AppColor.primary.base');
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
}

.balance-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Grille pour les deux petits soldes */
.balance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.label {
  font-size: 11px;
  font-weight: 600;
  color: #aaa;
  margin: 0;
  margin-bottom: 2px;
}

.value {
  margin: 0;
  font-weight: 800;
  line-height: 1.1;
}

.value.main {
  font-size: 24px;
  color: v-bind('AppColor.tertiary.base');
}

.value.profit {
  font-size: 16px;
  color: #4CAF50;
}

.value.refund {
  font-size: 16px;
  color: #ff9800; /* Orange pour le remboursement */
}

.value small {
  font-size: 10px;
  opacity: 0.6;
}

.footer-info {
  margin-top: auto;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}
</style>