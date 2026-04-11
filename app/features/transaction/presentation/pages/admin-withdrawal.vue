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
    </div>

    <div class="withdrawal-grid">
      <div
        v-for="item in filteredWithdrawals"
        :key="item.id"
        class="withdrawal-card"
      >
        <div class="card-actions-top">
          <button 
            class="action-badge cancel" 
            title="Annuler la demande"
            @click="cancelWithdrawal(item.id)"
          >
            <i class="fi fi-rr-cross-small"></i>
          </button>
          <button 
            class="action-badge approve" 
            title="Valider le retrait"
            @click="approveWithdrawal(item.id)"
          >
            <i class="fi fi-rr-check"></i>
          </button>
        </div>

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
            <span>Montant demandé</span>
            <strong>{{ item.amount.toLocaleString() }} XOF</strong>
          </div>

          <div class="info-box date">
            <span>Date</span>
            <strong>{{ item.createdAt }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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

// Données fictives Smart Order
const withdrawals = ref<WithdrawalRequest[]>([
  {
    id: 1,
    username: 'natanael',
    email: 'nat@gmail.com',
    amount: 25000,
    createdAt: '11 Avr 2026',
    previousWithdrawals: [10000, 15000, 12000]
  },
  {
    id: 2,
    username: 'shadow',
    email: 'shadow@gmail.com',
    amount: 45000,
    createdAt: '10 Avr 2026',
    previousWithdrawals: [20000, 8000]
  },
  {
    id: 3,
    username: 'benoit',
    email: 'benoit@gmail.com',
    amount: 30000,
    createdAt: '11 Avr 2026',
    previousWithdrawals: [5000]
  }
])

// Logique de filtrage
const filteredWithdrawals = computed(() => {
  const keyword = search.value.toLowerCase()

  return withdrawals.value.filter((item) => {
    return (
      item.username.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    )
  })
})

const clearSearch = () => {
  search.value = ''
}

// Actions de gestion
const approveWithdrawal = (id: number) => {
  console.log('Validating withdrawal:', id)
  // Ajouter ici l'appel API pour valider
}

const cancelWithdrawal = (id: number) => {
  console.log('Cancelling withdrawal:', id)
  // Ajouter ici l'appel API pour annuler
}
</script>

<style scoped>
.withdrawal-page {
 
}

.filters {
  margin-bottom: 16px;
}

.search-box {
  position: relative;
}

.clear-btn {
  position: absolute;
  right: 14px;
  top: 50%; /* Centré dans l'input */
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: v-bind('AppColor.surface.smoke');
  color: v-bind('AppColor.tertiary.soft');
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* GRILLE DE DEMANDES */
.withdrawal-grid {
  display: grid;
  gap: 12px;
}

.withdrawal-card {
  position: relative; /* Crucial pour les badges absolus */
  background: v-bind('AppColor.surface.pure');
  border: 1px solid v-bind('AppColor.surface.bone');
  border-radius: 24px;
  padding: 16px;

}

/* CONTAINER DES BADGES (STYLÉ) */
.card-actions-top {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  gap: 8px;
  z-index: 5;
}

/* STYLE DES BADGES INDIVIDUELS */
.action-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-badge i {
  font-size: 16px;
}

/* Badge Annuler (Gris -> Rouge soft au clic) */
.cancel {
  background-color: v-bind('AppColor.surface.smoke');
  color: v-bind('AppColor.tertiary.soft');
}

.cancel:active {
  background-color: #FEE2E2; /* Rouge très clair */
  color: v-bind('AppColor.status.error');
  transform: scale(0.9);
}

/* Badge Valider (Orange clair -> Orange base au clic) */
.approve {
  background-color: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
}

.approve:active {
  background-color: v-bind('AppColor.primary.base');
  color: #FFFFFF;
  transform: scale(0.9);
}

/* CONTENU DE LA CARTE */
.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    v-bind('AppColor.primary.base'),
    v-bind('AppColor.primary.dark')
  );
  color: white;
  font-weight: 800;
  font-size: 18px;
  display: grid;
  place-items: center;
}

.user-meta {
  display: flex;
  flex-direction: column;
  /* Laisse de l'espace pour ne pas chevaucher les badges */
  padding-right: 75px; 
}

.user-meta h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: v-bind('AppColor.tertiary.base');
}

.user-meta p {
  margin: 2px 0 0;
  font-size: 11px;
  color: v-bind('AppColor.tertiary.soft');
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.history-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: v-bind('AppColor.secondary.light');
  color: v-bind('AppColor.secondary.dark');
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.withdrawal-info {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.info-box {
  flex: 1;
  border-radius: 16px;
  padding: 10px 12px;
  border: 1px solid v-bind('AppColor.surface.bone');
}

.amount {
  background-color: v-bind('AppColor.surface.off');
}

.date {
  background-color: #FFFFFF;
}

.info-box span {
  display: block;
  font-size: 10px;
  color: v-bind('AppColor.tertiary.soft');
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.info-box strong {
  font-size: 14px;
  font-weight: 800;
  color: v-bind('AppColor.tertiary.charcoal');
}
</style>