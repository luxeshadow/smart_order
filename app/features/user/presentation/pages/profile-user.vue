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

/* =========================================================
   PAGE
========================================================= */

.profile-page {
  padding: 15px;
  padding-top: 85px;

  background: #ffffff;

  min-height: 100vh;
}

/* =========================================================
   APP BAR
========================================================= */

.app-bar {
  position: fixed;

  top: 0;
  left: 0;
  right: 0;

  height: 65px;

  background: #ffffff;

  display: flex;
  align-items: center;

  padding: 0 15px;

  z-index: 1000;

  border-bottom: 1px solid #f1f1f1;
}

.back-btn {
  width: 45px;
  height: 45px;

  border: 1px solid #eeeeee;

  border-radius: 14px;

  background: #f8f9fa;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  font-size: 20px;

  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.back-btn:active {
  transform: scale(0.92);
}

.app-bar-title {
  flex: 1;

  text-align: center;

  font-size: 17px;
  font-weight: 800;

  color: #111111;
}

.spacer {
  width: 45px;
}

/* =========================================================
   HERO WALLET
========================================================= */

.hero-wallet {
  position: relative;

  width: 100%;
  height: 290px;

  overflow: hidden;

  border-radius: 30px;

  margin-bottom: 25px;

  padding: 20px;

  background: #111111;

  isolation: isolate;
}

/* =========================================================
   IMAGE DE FOND : LOGO_1
========================================================= */

.hero-bg {
  position: absolute;

  inset: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center;

  z-index: 0;

  pointer-events: none;
  user-select: none;
}

/* =========================================================
   OVERLAY SUR LE FOND
========================================================= */

.hero-overlay {
  position: absolute;

  inset: 0;

  z-index: 1;

  pointer-events: none;

  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.68) 25%,
    rgba(0, 0, 0, 0.48) 48%,
    rgba(0, 0, 0, 0.18) 70%,
    rgba(0, 0, 0, 0.04) 100%
  );
}

/* =========================================================
   FILLE : LOGO_2
========================================================= */

.hero-girl {
  position: absolute;

  /*
    Grande taille volontaire.
    La fille prend pratiquement toute
    la partie droite de la carte.
  */
  width: 410px;
  max-width: none;
  height: auto;

  right: -70px;
  bottom: -70px;

  object-fit: contain;

  z-index: 2;

  pointer-events: none;
  user-select: none;

  -webkit-user-drag: none;
}

/* =========================================================
   CONTENU HERO
========================================================= */

.hero-content {
  position: relative;

  z-index: 3;

  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* =========================================================
   LIGNE PROFIL
========================================================= */

.user-profile-row {
  position: relative;

  z-index: 4;

  display: flex;
  align-items: center;

  gap: 12px;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar-img {
  display: block;

  width: 50px;
  height: 50px;

  object-fit: cover;

  border-radius: 15px;

  border: 2px solid rgba(255, 255, 255, 0.4);
}

/* =========================================================
   INFOS UTILISATEUR
========================================================= */

.user-info {
  min-width: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.welcome-text {
  margin-bottom: 4px;

  font-size: 10px;
  font-weight: 700;

  line-height: 1;

  text-transform: uppercase;

  color: rgba(255, 255, 255, 0.65);
}

.user-name {
  margin: 0;

  max-width: 145px;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;

  font-size: 18px;
  font-weight: 900;

  line-height: 1.1;

  color: #ffffff;
}

/* =========================================================
   BOUTON TRANSFERT
========================================================= */

.settings-btn {
  position: relative;

  z-index: 5;

  margin-left: auto;

  width: 42px;
  height: 42px;

  flex-shrink: 0;

  border: 1px solid rgba(255, 255, 255, 0.18);

  border-radius: 13px;

  background: rgba(255, 255, 255, 0.16);

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  color: #ffffff;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    opacity 0.2s ease;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.24);
}

.settings-btn:active {
  transform: scale(0.9);
}

.settings-btn:disabled {
  opacity: 0.65;

  cursor: not-allowed;
}

/* =========================================================
   SPINNER
========================================================= */

.mini-spinner {
  width: 18px;
  height: 18px;

  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;

  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* =========================================================
   SOLDE PRINCIPAL
========================================================= */

.main-balance-display {
  position: relative;

  z-index: 4;

  max-width: 55%;
}

.balance-label {
  display: block;

  margin-bottom: 4px;

  font-size: 11px;
  font-weight: 700;

  text-transform: uppercase;

  color: rgba(255, 255, 255, 0.6);
}

.amount-row {
  display: flex;
  align-items: baseline;

  flex-wrap: nowrap;
}

.amount {
  margin: 0;

  font-size: 36px;
  font-weight: 900;

  line-height: 1;

  color: #ffffff;
}

.currency {
  margin-left: 5px;

  font-size: 14px;
  font-weight: 800;

  color: #ffffff;
}

/* =========================================================
   BLOCS JOURNALIER / REMBOURSEMENT
========================================================= */

.glass-balances {
  position: relative;

  z-index: 4;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 12px 18px;

  border: 1px solid rgba(255, 255, 255, 0.14);

  border-radius: 20px;

  background: rgba(255, 255, 255, 0.12);

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-item {
  min-width: 0;

  flex: 1;

  display: flex;
  flex-direction: column;
}

.glass-label {
  margin-bottom: 2px;

  font-size: 9px;
  font-weight: 800;

  text-transform: uppercase;

  color: rgba(255, 255, 255, 0.55);
}

.glass-amount {
  font-size: 14px;
  font-weight: 900;

  white-space: nowrap;

  color: #ffffff;
}

.glass-amount small {
  font-size: 9px;

  opacity: 0.7;
}

.glass-divider {
  width: 1px;
  height: 25px;

  margin: 0 15px;

  flex-shrink: 0;

  background: rgba(255, 255, 255, 0.15);
}

/* =========================================================
   MENU
========================================================= */

.menu-section {
  display: flex;
  flex-direction: column;

  gap: 10px;
}

.menu-item {
  display: flex;
  align-items: center;

  padding: 16px;

  border: 1px solid #f5f5f5;

  border-radius: 20px;

  background: #fbfbfb;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.menu-item:hover {
  background: #f8f8f8;
}

.menu-item:active {
  transform: scale(0.98);
}

/* =========================================================
   ICÔNE MENU
========================================================= */

.menu-icon {
  width: 40px;
  height: 40px;

  margin-right: 15px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #f0f0f0;

  border-radius: 12px;

  background: #ffffff;

  color: v-bind('AppColor.primary.base');

  font-size: 17px;
}

.menu-item span {
  flex: 1;

  font-size: 14px;
  font-weight: 700;

  color: #444444;
}

.arrow {
  flex-shrink: 0;

  margin-left: 10px;

  font-size: 18px;

  color: #aaaaaa;
}

/* =========================================================
   LOGOUT
========================================================= */

.menu-item.logout {
  margin-top: 5px;

  background: #fff5f5;

  border-color: #ffe0e0;
}

.menu-item.logout:hover {
  background: #ffeded;
}

.menu-item.logout .menu-icon {
  border: none;

  background: #ff4757;

  color: #ffffff;
}

.menu-item.logout span {
  color: #ff4757;
}

/* =========================================================
   RESPONSIVE : TABLETTES / GRANDS MOBILES
========================================================= */

@media (max-width: 600px) {
  .hero-wallet {
    height: 290px;
  }

  .hero-girl {
    width: 400px;

    right: -75px;
    bottom: -68px;
  }
}

/* =========================================================
   RESPONSIVE : MOBILE 430px
========================================================= */

@media (max-width: 430px) {
  .profile-page {
    padding-left: 12px;
    padding-right: 12px;
  }

  .hero-wallet {
    height: 285px;

    padding: 18px;

    border-radius: 27px;
  }

  .hero-girl {
    /*
      On conserve une grosse taille.
      Ne pas remettre 200px ou 250px ici.
    */
    width: 380px;

    right: -75px;
    bottom: -62px;
  }

  .main-balance-display {
    max-width: 54%;
  }

  .amount {
    font-size: 33px;
  }

  .glass-balances {
    padding: 11px 14px;
  }
}

/* =========================================================
   RESPONSIVE : MOBILE 390px
========================================================= */

@media (max-width: 390px) {
  .hero-wallet {
    height: 280px;

    padding: 17px;
  }

  .hero-girl {
    width: 365px;

    right: -78px;
    bottom: -57px;
  }

  .avatar-img {
    width: 47px;
    height: 47px;
  }

  .user-name {
    max-width: 125px;

    font-size: 17px;
  }

  .main-balance-display {
    max-width: 53%;
  }

  .amount {
    font-size: 30px;
  }

  .currency {
    font-size: 12px;
  }

  .glass-balances {
    padding: 11px 13px;
  }

  .glass-divider {
    margin: 0 10px;
  }

  .glass-amount {
    font-size: 12px;
  }
}

/* =========================================================
   RESPONSIVE : PETITS MOBILES 360px
========================================================= */

@media (max-width: 360px) {
  .hero-wallet {
    height: 275px;

    padding: 16px;
  }

  .hero-girl {
    width: 345px;

    right: -78px;
    bottom: -52px;
  }

  .avatar-img {
    width: 45px;
    height: 45px;
  }

  .welcome-text {
    font-size: 9px;
  }

  .user-name {
    max-width: 110px;

    font-size: 16px;
  }

  .settings-btn {
    width: 39px;
    height: 39px;
  }

  .amount {
    font-size: 28px;
  }

  .balance-label {
    font-size: 10px;
  }

  .glass-label {
    font-size: 8px;
  }

  .glass-amount {
    font-size: 11px;
  }

  .glass-divider {
    margin: 0 8px;
  }
}

/* =========================================================
   RESPONSIVE : TRÈS PETITS ÉCRANS
========================================================= */

@media (max-width: 330px) {
  .hero-wallet {
    height: 265px;

    padding: 15px;
  }

  .hero-girl {
    width: 320px;

    right: -75px;
    bottom: -45px;
  }

  .main-balance-display {
    max-width: 52%;
  }

  .amount {
    font-size: 25px;
  }

  .currency {
    font-size: 11px;
  }

  .glass-balances {
    padding: 10px 11px;
  }

  .glass-amount {
    font-size: 10px;
  }

  .glass-amount small {
    font-size: 8px;
  }

  .menu-item {
    padding: 14px;
  }

  .menu-icon {
    width: 37px;
    height: 37px;

    margin-right: 12px;
  }

  .menu-item span {
    font-size: 13px;
  }
}
</style>
