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

.profile-page {
  min-height: 100vh;
  padding: 82px 14px 110px;

  background: #ffffff;
}




/* =========================================================
   HERO
========================================================= */

.hero-wallet {
  position: relative;

  width: 100%;

  /*
   * Hero volontairement plus compact.
   */
  height: 255px;

  overflow: hidden;

  border-radius: 28px;

  padding: 18px;

  background: #111111;

  isolation: isolate;

  box-shadow:
    0 12px 30px
    rgba(0, 0, 0, 0.10);
}


/* =========================================================
   BACKGROUND LOGO 1
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

  transform: scale(1.02);
}


/* =========================================================
   OVERLAY
========================================================= */

.hero-overlay {
  position: absolute;

  inset: 0;

  z-index: 1;

  pointer-events: none;

  /*
   * Pas de violet ajouté.
   * Simple noir transparent pour garder
   * les vraies couleurs de Logo_1.
   */
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.60) 35%,
    rgba(0, 0, 0, 0.30) 60%,
    rgba(0, 0, 0, 0.05) 100%
  );
}


/* =========================================================
   PERSONNAGE LOGO 2
========================================================= */

.hero-girl {
  position: absolute;

  /*
   * Hero moins haut mais personnage
   * toujours très présent.
   */
  width: 365px;

  max-width: none;

  height: auto;

  right: -72px;
  bottom: -88px;

  z-index: 2;

  object-fit: contain;

  pointer-events: none;
  user-select: none;

  -webkit-user-drag: none;

  filter:
    drop-shadow(
      -8px
      7px
      14px
      rgba(0, 0, 0, 0.12)
    );
}


/* =========================================================
   HERO TOP
========================================================= */

.hero-top {
  position: relative;

  z-index: 5;

  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}


/* =========================================================
   PROFIL
========================================================= */

.profile-mini {
  display: flex;
  align-items: center;

  gap: 10px;
}


.avatar-img {
  width: 46px;
  height: 46px;

  flex-shrink: 0;

  border-radius: 15px;

  object-fit: cover;

  border: 2px solid rgba(255, 255, 255, 0.60);

  background: #ffffff;
}


.profile-text {
  min-width: 0;

  display: flex;
  flex-direction: column;
}


.welcome-text {
  margin-bottom: 3px;

  font-size: 9px;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.5px;

  color: rgba(255, 255, 255, 0.65);
}


.user-name {
  margin: 0;

  max-width: 145px;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;

  font-size: 17px;
  font-weight: 900;

  color: #ffffff;
}


/* =========================================================
   BOUTON TRANSFERT
========================================================= */

.transfer-btn {
  position: relative;

  z-index: 10;

  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(255, 255, 255, 0.20);

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.14);

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  color: #ffffff;

  font-size: 17px;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease;
}


.transfer-btn:active {
  transform: scale(0.90);
}


.transfer-btn:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}


/* =========================================================
   SOLDE PRINCIPAL
========================================================= */

.hero-balance {
  position: absolute;

  left: 18px;

  top: 110px;

  z-index: 4;

  max-width: 58%;
}


.balance-label {
  display: block;

  margin-bottom: 6px;

  font-size: 10px;
  font-weight: 700;

  color: rgba(255, 255, 255, 0.65);
}


.amount-row {
  display: flex;

  align-items: flex-end;

  gap: 6px;
}


.amount {
  font-size: clamp(
    29px,
    8vw,
    37px
  );

  line-height: 0.95;

  font-weight: 950;

  letter-spacing: -1px;

  color: #ffffff;
}


.currency {
  padding-bottom: 2px;

  font-size: 12px;
  font-weight: 900;

  /*
   * Couleur principale de ton application.
   */
  color: v-bind('AppColor.primary.base');
}


/* =========================================================
   STATUS
========================================================= */

.hero-status {
  position: absolute;

  left: 18px;
  bottom: 18px;

  z-index: 5;

  display: inline-flex;
  align-items: center;

  gap: 6px;

  padding: 6px 9px;

  border: 1px solid rgba(255, 255, 255, 0.12);

  border-radius: 50px;

  background: rgba(255, 255, 255, 0.10);

  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  font-size: 9px;
  font-weight: 700;

  color: rgba(255, 255, 255, 0.72);
}


.status-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  /*
   * Suppression du vert.
   * On utilise la couleur principale.
   */
  background: v-bind('AppColor.primary.base');
}


/* =========================================================
   CARTES BALANCES SECONDAIRES
========================================================= */

.balance-summary {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 10px;

  margin-top: 12px;
  margin-bottom: 25px;
}


.summary-card {
  min-width: 0;

  padding: 13px;

  display: flex;
  align-items: center;

  gap: 10px;

  border: 1px solid #eeeeee;

  border-radius: 18px;

  background: #ffffff;

  box-shadow:
    0 5px 18px
    rgba(0, 0, 0, 0.035);
}


.summary-icon {
  width: 37px;
  height: 37px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  /*
   * Plus de violet.
   */
  background:
    color-mix(
      in srgb,
      v-bind('AppColor.primary.base') 10%,
      white
    );

  color:
    v-bind('AppColor.primary.base');

  font-size: 16px;
}


.summary-content {
  min-width: 0;

  display: flex;
  flex-direction: column;
}


.summary-label {
  margin-bottom: 3px;

  font-size: 9px;
  font-weight: 800;

  text-transform: uppercase;

  color: #999999;
}


.summary-amount {
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 13px;
  font-weight: 900;

  color: #202020;
}


.summary-amount small {
  margin-left: 2px;

  font-size: 8px;

  color: #999999;
}


/* =========================================================
   TITRES SECTIONS
========================================================= */

.section-header {
  padding: 0 4px 9px;

  font-size: 13px;
  font-weight: 900;

  color: #181818;
}


.games-title {
  margin-top: 12px;

  padding-top: 5px;
}


/* =========================================================
   MENU
========================================================= */

.menu-section {
  display: flex;
  flex-direction: column;

  gap: 9px;
}


.menu-item {
  position: relative;

  min-height: 66px;

  padding: 11px 13px;

  display: flex;
  align-items: center;

  border: 1px solid #eeeeee;

  border-radius: 18px;

  background: #ffffff;

  cursor: pointer;

  box-shadow:
    0 4px 14px
    rgba(0, 0, 0, 0.025);

  transition:
    transform 0.18s ease,
    background 0.18s ease;
}


.menu-item:active {
  transform: scale(0.98);
}


/* =========================================================
   MENU ICON
========================================================= */

.menu-icon {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  margin-right: 13px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;

  /*
   * Toutes les icônes utilisent
   * désormais la couleur principale.
   */
  background:
    color-mix(
      in srgb,
      v-bind('AppColor.primary.base') 9%,
      white
    );

  color:
    v-bind('AppColor.primary.base');

  font-size: 17px;
}


.menu-content {
  min-width: 0;

  flex: 1;

  display: flex;
  flex-direction: column;
}


.menu-title {
  margin-bottom: 2px;

  font-size: 14px;
  font-weight: 800;

  color: #292929;
}


.menu-description {
  font-size: 10px;
  font-weight: 600;

  color: #a2a2a2;
}


.arrow {
  margin-left: 8px;

  flex-shrink: 0;

  color: #b6b6b6;

  font-size: 17px;
}


/* =========================================================
   JEUX
   Même couleur que l'application
========================================================= */

.game-icon {
  background:
    color-mix(
      in srgb,
      v-bind('AppColor.primary.base') 9%,
      white
    );

  color:
    v-bind('AppColor.primary.base');
}


/* =========================================================
   PARTAGE
   Suppression du vert
========================================================= */

.share-icon {
  background:
    color-mix(
      in srgb,
      v-bind('AppColor.primary.base') 9%,
      white
    );

  color:
    v-bind('AppColor.primary.base');
}


/* =========================================================
   LOGOUT
========================================================= */

.menu-item.logout {
  margin-top: 7px;

  border-color: rgba(255, 71, 87, 0.12);

  background: rgba(255, 71, 87, 0.055);
}


.menu-item.logout .menu-icon {
  background: rgba(255, 71, 87, 0.10);

  color: #ff4757;
}


.menu-item.logout .menu-title {
  color: #ff4757;
}


/* =========================================================
   SPINNER
========================================================= */

.mini-spinner {
  width: 18px;
  height: 18px;

  border:
    2px solid
    rgba(255, 255, 255, 0.30);

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
   MOBILE <= 430PX
========================================================= */

@media (max-width: 430px) {

  .hero-wallet {
    height: 250px;

    border-radius: 26px;
  }


  .hero-girl {
    width: 355px;

    right: -78px;

    bottom: -84px;
  }


  .hero-balance {
    top: 106px;
  }


  .amount {
    font-size: 33px;
  }
}


/* =========================================================
   MOBILE <= 390PX
========================================================= */

@media (max-width: 390px) {

  .profile-page {
    padding-left: 12px;
    padding-right: 12px;
  }


  .hero-wallet {
    height: 245px;

    padding: 16px;
  }


  .hero-girl {
    width: 340px;

    right: -82px;

    bottom: -78px;
  }


  .hero-balance {
    left: 16px;

    top: 103px;
  }


  .hero-status {
    left: 16px;

    bottom: 16px;
  }


  .amount {
    font-size: 30px;
  }


  .currency {
    font-size: 11px;
  }


  .summary-card {
    padding: 11px;
  }


  .summary-icon {
    width: 34px;
    height: 34px;
  }


  .summary-amount {
    font-size: 12px;
  }
}


/* =========================================================
   MOBILE <= 350PX
========================================================= */

@media (max-width: 350px) {

  .hero-wallet {
    height: 235px;
  }


  .hero-girl {
    width: 320px;

    right: -86px;

    bottom: -72px;
  }


  .avatar-img {
    width: 42px;
    height: 42px;
  }


  .user-name {
    max-width: 105px;

    font-size: 15px;
  }


  .hero-balance {
    top: 98px;
  }


  .amount {
    font-size: 27px;
  }


  .balance-summary {
    gap: 7px;
  }


  .summary-card {
    gap: 7px;

    padding: 10px;
  }


  .summary-icon {
    width: 31px;
    height: 31px;

    border-radius: 10px;
  }


  .summary-amount {
    font-size: 11px;
  }
}

</style>
