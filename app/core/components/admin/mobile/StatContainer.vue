<template>
  <div class="wallet-wrap">
    <div class="wallet-card">
      <div class="notch-slot">
        <div class="date-notch">
          <i class="fi fi-rr-calendar"></i>
          <span>{{ currentDate }}</span>
        </div>
      </div>

      <div class="hero-side">
        <p class="label">
          <i class="fi fi-rr-wallet"></i>
          <span>Solde Total</span>
        </p>

        <div class="balance-row">
          <span>XOF</span>
          <h1>{{ totalBalance.toLocaleString() }}</h1>
        </div>
      </div>

      <div class="stats-side">
        <div class="stat-box deposit">
          <div class="stat-head">
            <i class="fi fi-rr-arrow-down"></i>
            <small>Dépôt</small>
          </div>
          <strong>{{ totalDeposit.toLocaleString() }}</strong>
        </div>

        <div class="stat-box withdraw">
          <div class="stat-head">
            <i class="fi fi-rr-arrow-up"></i>
            <small>Retrait</small>
          </div>
          <strong>{{ totalWithdrawal.toLocaleString() }}</strong>
        </div>
      </div>

      <div class="soft-glow"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'

const totalDeposit = ref(25000)
const totalWithdrawal = ref(10500)

const totalBalance = computed(() => totalDeposit.value - totalWithdrawal.value)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
})
</script>


<style scoped>
.wallet-wrap {
  padding: 16px;
}

.wallet-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 26px 18px 18px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  box-shadow: 0 5px 10px rgba(0,0,0,0.18);
}

/* SLOT */
.notch-slot {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 26px;
  background: #f2f3f5;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* DATE */
.date-notch {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  color: rgb(245, 53, 5);
}

.date-notch i {
  font-size: 11px;
}

/* LEFT */
.hero-side {
  flex: 1;
  z-index: 2;
}

.label {
  margin: 0;
  color: rgba(255,255,255,0.55);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.balance-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-top: 6px;
}

.balance-row span {
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  margin-bottom: 6px;
}

.balance-row h1 {
  margin: 0;
  color: white;
  font-size: 34px;
  line-height: 1;
  font-weight: 900;
}

/* RIGHT */
.stats-side {
  width: 130px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2;
}

.stat-box {
  padding: 12px;
  border-radius: 18px;
  backdrop-filter: blur(10px);
}

.deposit {
  background: rgba(34,197,94,0.12);
}

.withdraw {
  background: rgba(239,68,68,0.12);
}

.stat-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.stat-head i {
  font-size: 12px;
  color: white;
}

.stat-box small {
  color: rgba(255,255,255,0.6);
  font-size: 10px;
}

.stat-box strong {
  color: white;
  font-size: 16px;
  font-weight: 800;
}

.soft-glow {
  position: absolute;
  width: 120px;
  height: 120px;
  background: rgba(255,255,255,0.06);
  border-radius: 50%;
  filter: blur(60px);
  right: -20px;
  top: -20px;
}

@media (max-width: 600px) {
  .balance-row h1 {
    font-size: 28px;
  }

  .stats-side {
    width: 110px;
  }
}
</style>