<script setup lang="ts">
import { AppColor } from '@/core/constants/app_colors'

defineProps({
  today: { type: String, default: "29 Mars 2026" },
  pendingOrders: { type: Number, default: 12 },
  dailyProducts: { type: Number, default: 45 },
  mainBalance: { type: String, default: "2,450,000" },
  profitBalance: { type: String, default: "+125,000" },
  refundBalance: { type: String, default: "30,000" }, // Nouvelle prop
  activeLevels: { type: Array, default: () => [1, 2] } 
})

const levels = [
  { id: 1, label: 'Niv 1' },
  { id: 2, label: 'Niv 2' },
  { id: 3, label: 'Niv 3' },
  { id: 4, label: 'Niv 4' },
]
</script>

<template>
  <div class="metrics-card">
    <div class="levels-sidebar">
      <div v-for="level in levels" :key="level.id" class="level-item">
        <span class="level-name">{{ level.label }}</span>
        <span :class="['status-badge', activeLevels.includes(level.id) ? 'is-active' : 'is-locked']">
          {{ activeLevels.includes(level.id) ? 'ON' : 'OFF' }}
        </span>
      </div>
    </div>

    <div class="metrics-content">
      <div class="header-row">
        <span class="date-label">{{ today }}</span>
        <div class="pending-tag">
          <i class="fi fi-rr-time-past"></i>
          {{ pendingOrders }} en attente
        </div>
      </div>

      <div class="balance-section">
        <div class="balance-item">
          <p class="label">Solde Principal</p>
          <h2 class="value main">{{ mainBalance }} <small>XOF</small></h2>
        </div>
        
        <div class="balance-grid">
          <div class="balance-item">
            <p class="label">Gain Journalier</p>
            <h2 class="value profit">{{ profitBalance }} <small>XOF</small></h2>
          </div>

          <div class="balance-item">
            <p class="label">Remboursement</p>
            <h2 class="value refund">{{ refundBalance }} <small>XOF</small></h2>
          </div>
        </div>
      </div>

      <div class="footer-info">
        <i class="fi fi-rr-box"></i>
        <span><strong>{{ dailyProducts }}</strong> produits / commande</span>
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

/* --- SIDEBAR NIVEAUX --- */
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

/* --- CONTENU METRICS --- */
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