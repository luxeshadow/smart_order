<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from "pinia"
import { AppImage } from "@/core/constants/app_images"
import { useAuthStore } from "@/features/auth/presentation/stores/auth_store"
import { useTransactionStore } from "@/features/transaction/presentation/stores/transaction_store"
import Footer from '@/core/components/client/mobile/Footer.vue'
import { getMyLinkShared } from '@/core/utils/getMyLinkShared'

import { useToast } from '@/core/utils/useToast'
import { useConfetti } from '@/core/utils/useConfetti'

import { ShowMyPrincipalBalanceUseCase } from '~/features/transaction/application/usecases/show_my_principal_balance_usecase'
import { ShowMyPrincipalBalanceRepositoryImpl } from '~/features/transaction/data/repositories/show_my_principal_balance_repository_impl'
import { RefundToMainBalanceUseCase } from '@/features/transaction/application/usecases/refund_to_main_balance_usecase'
import { RefundToMainBalanceRepositoryImpl } from '@/features/transaction/data/repositories/refund_to_main_balance_repository_impl'
import { Failure } from '@/core/errors/failure'

const router = useRouter()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

const { showToast } = useToast()
const { triggerConfetti } = useConfetti()

const { user } = storeToRefs(authStore)
const { mainBalance, dailyEarnings, refundBalance } = storeToRefs(transactionStore)

const isTransferring = ref(false)
const myReferralLink = ref('')

const balanceRepo = new ShowMyPrincipalBalanceRepositoryImpl()
const getBalanceUseCase = new ShowMyPrincipalBalanceUseCase(balanceRepo)

const refundRepo = new RefundToMainBalanceRepositoryImpl()
const refundUseCase = new RefundToMainBalanceUseCase(refundRepo)

const formatBalance = (value: number | null): string => {
  if (value === null || value === undefined) return "00,000,000";
  const padded = Math.floor(value).toString().padStart(8, '0');
  return padded.replace(/(\d{2})(\d{3})(\d{3})/, "$1,$2,$3");
}

const fetchBalance = async () => {
  if (!user.value?.id) return
  const result = await getBalanceUseCase.execute({ userId: user.value.id })
  if (!(result instanceof Failure)) {
    transactionStore.updateAllBalances(result)
  }
}
const loadMyReferralLink = async () => {
  if (!user.value?.id) return

  const link = await getMyLinkShared(user.value.id)

  if (link) {
    myReferralLink.value = link
  }
}

const handleTransferRefund = async () => {
  vibrate()
  if (!user.value?.id || isTransferring.value) return

  if (refundBalance.value <= 0) {
    showToast("Votre solde de remboursement est vide !", "fi-rr-info", "error")
    return
  }

  isTransferring.value = true

  const result = await refundUseCase.execute({ userId: user.value.id })

  if (result instanceof Failure) {
    showToast(result.message, "fi-rr-info", "error")
  } else {
    triggerConfetti();

    showToast("Transfert effectué avec succès !", "fi-rr-check", "success")
    await fetchBalance()
  }

  isTransferring.value = false
}

onMounted(() => {
  fetchBalance()
  loadMyReferralLink()
})
const handleShareReferral = async () => {
  vibrate()

  if (!myReferralLink.value) {
    showToast(
      "Lien indisponible",
      "fi-rr-info",
      "error"
    )
    return
  }

  try {

    if (navigator.share) {

      await navigator.share({
        title: 'Invitation',
        text: 'Rejoins la plateforme avec mon lien de parrainage',
        url: myReferralLink.value
      })

    } else {

      await navigator.clipboard.writeText(
        myReferralLink.value
      )

      showToast(
        "Lien copié",
        "fi-rr-check",
        "success"
      )
    }

  } catch (error) {
    console.log(error)
  }
}

const handleLogout = () => {
  authStore.logout()
}
const vibrate = () => {
  if (navigator.vibrate) {
    navigator.vibrate(150) // vibration courte
  }
}
</script>

<template>
  <div class="profile-page">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>

      <span class="app-bar-title">Mon Compte</span>

      <div class="spacer"></div>
    </nav>

    <div class="hero-wallet">
      <!-- Image de fond -->
      <img
        :src="AppImage.Logo_1"
        alt="background"
        class="hero-bg"
      />

      <!-- Fille avec téléphone -->
      <img
        :src="AppImage.Logo_2"
        alt="Smart girl"
        class="hero-girl"
      />

      <!-- Dégradé -->
      <div class="hero-overlay"></div>

      <!-- Contenu -->
      <div class="hero-content">
        <div class="user-profile-row">
          <div class="avatar-container">
            <img
              :src="AppImage.Profile"
              alt="Avatar"
              class="avatar-img"
            />
          </div>

          <div class="user-info">
            <span class="welcome-text">Bienvenue,</span>

            <h1 class="user-name">
              {{ user?.username || 'Utilisateur' }}
            </h1>
          </div>

          <button
            class="settings-btn"
            @click="handleTransferRefund"
            :disabled="isTransferring"
            :class="{ 'btn-loading': isTransferring }"
          >
            <i
              v-if="!isTransferring"
              class="fi fi-rr-money-transfer-coin-arrow"
            ></i>

            <div
              v-else
              class="mini-spinner"
            ></div>
          </button>
        </div>

        <div class="main-balance-display">
          <span class="balance-label">
            Solde Principal
          </span>

          <div class="amount-row">
            <h2 class="amount">
              {{ formatBalance(mainBalance) }}
            </h2>

            <span class="currency">
              XOF
            </span>
          </div>
        </div>

        <div class="glass-balances">
          <div class="glass-item">
            <span class="glass-label">
              Journalier
            </span>

            <span class="glass-amount">
              {{ formatBalance(dailyEarnings) }}
              <small>XOF</small>
            </span>
          </div>

          <div class="glass-divider"></div>

          <div class="glass-item">
            <span class="glass-label">
              Remboursement
            </span>

            <span class="glass-amount">
              {{ formatBalance(refundBalance) }}
              <small>XOF</small>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="menu-section">
      <div
        class="menu-item"
        @click="router.push('/auth/update-profile')"
      >
        <div class="menu-icon">
          <i class="fi fi-rr-user"></i>
        </div>

        <span>Modifier mes informations</span>

        <i class="fi fi-rr-angle-small-right arrow"></i>
      </div>

      <div
        class="menu-item"
        @click="router.push('/assistance/ai')"
      >
        <div class="menu-icon">
          <i class="fi fi-rr-user-headset"></i>
        </div>

        <span>Assistance</span>

        <i class="fi fi-rr-angle-small-right arrow"></i>
      </div>

      <div
        class="menu-item"
        @click="router.push('/transaction/history-transaction')"
      >
        <div class="menu-icon">
          <i class="fi fi-rr-time-past"></i>
        </div>

        <span>Historique des flux</span>

        <i class="fi fi-rr-angle-small-right arrow"></i>
      </div>

      <div
        class="menu-item"
        @click="router.push('/game/roulette-game')"
      >
        <div class="menu-icon">
          <i class="fi fi-rr-gamepad"></i>
        </div>

        <span>Egames Lucky Wheel</span>

        <i class="fi fi-rr-angle-small-right arrow"></i>
      </div>

      <div
        class="menu-item"
        @click="router.push('/game/pachinko-game')"
      >
        <div class="menu-icon">
          <i class="fi fi-rr-gamepad"></i>
        </div>

        <span>Egames Pachinko</span>

        <i class="fi fi-rr-angle-small-right arrow"></i>
      </div>

      <div
        class="menu-item"
        @click="router.push('/game/plane-game')"
      >
        <div class="menu-icon">
          <i class="fi fi-rr-gamepad"></i>
        </div>

        <span>Egames Plane Arena</span>

        <i class="fi fi-rr-angle-small-right arrow"></i>
      </div>

      <div
        class="menu-item"
        @click="handleShareReferral"
      >
        <div class="menu-icon">
          <i class="fi fi-rr-share"></i>
        </div>

        <span>Partager mon lien</span>

        <i class="fi fi-rr-angle-small-right arrow"></i>
      </div>

      <div
        class="menu-item logout"
        @click="handleLogout"
      >
        <div class="menu-icon">
          <i class="fi fi-rr-exit"></i>
        </div>

        <span>Se déconnecter</span>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

/* =========================
   PAGE
========================= */

.profile-page {
  padding: 15px;
  padding-top: 85px;
  background: #fff;
  min-height: 100vh;
}

/* =========================
   APP BAR
========================= */

.app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  height: 65px;

  background: white;

  display: flex;
  align-items: center;

  padding: 0 15px;

  z-index: 1000;

  border-bottom: 1px solid #f1f1f1;
}

.back-btn {
  width: 45px;
  height: 45px;

  background-color: #f8f9fa;

  border: 1px solid #eee;
  border-radius: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.app-bar-title {
  flex: 1;

  text-align: center;

  font-weight: 800;
  font-size: 17px;

  color: #111;
}

.spacer {
  width: 45px;
}

/* =========================
   HERO WALLET
========================= */

.hero-wallet {
  position: relative;

  width: 100%;
  height: 280px;

  border-radius: 30px;

  overflow: hidden;

  margin-bottom: 25px;

  padding: 20px;

  isolation: isolate;

  background: #111;
}

/* Background Logo_1 */
.hero-bg {
  position: absolute;

  inset: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center;

  z-index: 0;

  pointer-events: none;
}

/* =========================
   FILLES LOGO_2
========================= */

.hero-girl {
  position: absolute;

  right: -18px;
  bottom: -8px;

  width: 315px;
  max-width: none;

  height: auto;

  object-fit: contain;

  z-index: 1;
  pointer-events: none;
  user-select: none;

  -webkit-user-drag: none;
}

/* =========================
   OVERLAY
========================= */

.hero-overlay {
  position: absolute;

  inset: 0;

  z-index: 2;

  pointer-events: none;

  /*
    Plus sombre à gauche pour garder
    le texte lisible.

    Plus transparent à droite
    pour voir Logo_2 correctement.
  */
  background:
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.72) 0%,
      rgba(0, 0, 0, 0.60) 28%,
      rgba(0, 0, 0, 0.40) 50%,
      rgba(0, 0, 0, 0.12) 72%,
      rgba(0, 0, 0, 0.05) 100%
    );
}

/* =========================
   HERO CONTENT
========================= */

.hero-content {
  position: relative;

  z-index: 3;

  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* =========================
   USER
========================= */

.user-profile-row {
  position: relative;

  display: flex;
  align-items: center;

  gap: 12px;

  z-index: 4;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar-img {
  width: 50px;
  height: 50px;

  border-radius: 15px;

  border: 2px solid rgba(255, 255, 255, 0.4);

  display: block;

  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;

  min-width: 0;
}

.welcome-text {
  font-size: 10px;

  color: rgba(255, 255, 255, 0.65);

  font-weight: 700;

  text-transform: uppercase;

  line-height: 1;

  margin-bottom: 4px;
}

.user-name {
  font-size: 18px;

  color: #fff;

  font-weight: 900;

  margin: 0;

  line-height: 1.1;

  max-width: 150px;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* =========================
   SETTINGS BUTTON
========================= */

.settings-btn {
  margin-left: auto;

  width: 42px;
  height: 42px;

  flex-shrink: 0;

  background: rgba(255, 255, 255, 0.15);

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  border: 1px solid rgba(255, 255, 255, 0.15);

  border-radius: 13px;

  color: #fff;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    background 0.2s ease;

  z-index: 5;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}

.settings-btn:active {
  transform: scale(0.9);
}

.settings-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* =========================
   SPINNER
========================= */

.mini-spinner {
  width: 18px;
  height: 18px;

  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;

  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* =========================
   BALANCE
========================= */

.main-balance-display {
  position: relative;

  z-index: 4;

  max-width: 58%;
}

.balance-label {
  display: block;

  font-size: 11px;

  font-weight: 700;

  color: rgba(255, 255, 255, 0.6);

  text-transform: uppercase;

  margin-bottom: 3px;
}

.amount-row {
  display: flex;
  align-items: baseline;

  flex-wrap: nowrap;
}

.amount {
  font-size: 36px;

  font-weight: 900;

  color: #fff;

  margin: 0;

  line-height: 1;
}

.currency {
  font-size: 14px;

  color: #fff;

  font-weight: 800;

  margin-left: 5px;
}

/* =========================
   GLASS BALANCE
========================= */

.glass-balances {
  position: relative;

  z-index: 4;

  background: rgba(255, 255, 255, 0.11);

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border: 1px solid rgba(255, 255, 255, 0.12);

  border-radius: 20px;

  padding: 12px 18px;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.glass-item {
  display: flex;
  flex-direction: column;

  flex: 1;

  min-width: 0;
}

.glass-label {
  font-size: 9px;

  font-weight: 800;

  color: rgba(255, 255, 255, 0.55);

  text-transform: uppercase;

  margin-bottom: 2px;
}

.glass-amount {
  font-size: 14px;

  font-weight: 900;

  color: #fff;

  white-space: nowrap;
}

.glass-amount small {
  font-size: 9px;

  opacity: 0.7;
}

.glass-divider {
  width: 1px;
  height: 25px;

  flex-shrink: 0;

  background: rgba(255, 255, 255, 0.15);

  margin: 0 15px;
}

/* =========================
   MENU
========================= */

.menu-section {
  display: flex;
  flex-direction: column;

  gap: 10px;
}

.menu-item {
  display: flex;
  align-items: center;

  padding: 16px;

  background: #fbfbfb;

  border-radius: 20px;

  border: 1px solid #f5f5f5;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.menu-item:active {
  transform: scale(0.98);
}

.menu-icon {
  width: 40px;
  height: 40px;

  flex-shrink: 0;

  background: white;

  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-right: 15px;

  color: v-bind('AppColor.primary.base');

  border: 1px solid #f0f0f0;
}

.menu-item span {
  flex: 1;

  font-weight: 700;

  font-size: 14px;

  color: #444;
}

.arrow {
  color: #aaa;

  font-size: 18px;
}

/* =========================
   LOGOUT
========================= */

.menu-item.logout {
  margin-top: 5px;

  background: #fff5f5;

  border-color: #ffe0e0;
}

.menu-item.logout .menu-icon {
  background: #ff4757;

  color: white;

  border: none;
}

.menu-item.logout span {
  color: #ff4757;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 430px) {
  .hero-girl {
    width: 205px;

    right: -25px;
    bottom: -5px;
  }

  .main-balance-display {
    max-width: 57%;
  }

  .amount {
    font-size: 33px;
  }
}

@media (max-width: 390px) {
  .hero-wallet {
    height: 270px;

    padding: 18px;
  }

  .hero-girl {
    width: 185px;

    right: -27px;
    bottom: -3px;
  }

  .amount {
    font-size: 30px;
  }

  .main-balance-display {
    max-width: 55%;
  }

  .glass-balances {
    padding: 11px 14px;
  }

  .glass-divider {
    margin: 0 10px;
  }

  .glass-amount {
    font-size: 12px;
  }
}

@media (max-width: 350px) {
  .hero-girl {
    width: 165px;

    right: -30px;
  }

  .amount {
    font-size: 27px;
  }

  .user-name {
    font-size: 16px;
    max-width: 110px;
  }

  .glass-label {
    font-size: 8px;
  }

  .glass-amount {
    font-size: 11px;
  }
}
</style>
