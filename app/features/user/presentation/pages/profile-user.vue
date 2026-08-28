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
      <button
        class="back-btn"
        @click="router.back()"
      >
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>

      <span class="app-bar-title">
        Mon Compte
      </span>

      <div class="spacer"></div>
    </nav>


    <section class="hero-wallet">

      <img
        :src="AppImage.Logo_1"
        alt=""
        class="hero-bg"
      />

      <div class="hero-overlay"></div>

      <!-- <img
        :src="AppImage.Logo_2"
        alt=""
        class="hero-girl"
      /> -->

      <div class="hero-top">

        <div class="profile-mini">
          <img
            :src="AppImage.Profile"
            alt="Avatar"
            class="avatar-img"
          />

          <div class="profile-text">
            <span class="welcome-text">
              Bienvenue,
            </span>

            <h1 class="user-name">
              {{ user?.username || 'Utilisateur' }}
            </h1>
          </div>
        </div>


        <button
          class="transfer-btn"
          @click="handleTransferRefund"
          :disabled="isTransferring"
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

      <div class="hero-balance">

        <span class="balance-label">
          Solde disponible
        </span>

        <div class="amount-row">
          <span class="amount">
            {{ formatBalance(mainBalance) }}
          </span>

          <span class="currency">
            XOF
          </span>
        </div>

      </div>

      <div class="hero-status">
        <span class="status-dot"></span>
        <span>Compte actif</span>
      </div>

    </section>

    <section class="balance-summary">

      <div class="summary-card">

        <div class="summary-icon">
          <i class="fi fi-rr-chart-histogram"></i>
        </div>

        <div class="summary-content">
          <span class="summary-label">
            Journalier
          </span>

          <div class="summary-amount">
            {{ formatBalance(dailyEarnings) }}
            <small>XOF</small>
          </div>
        </div>

      </div>

      <div class="summary-card">

        <div class="summary-icon">
          <i class="fi fi-rr-refund-alt"></i>
        </div>

        <div class="summary-content">
          <span class="summary-label">
            Remboursement
          </span>

          <div class="summary-amount">
            {{ formatBalance(refundBalance) }}
            <small>XOF</small>
          </div>
        </div>

      </div>

    </section>

    <div class="section-header">
      <span>Mon espace</span>
    </div>

    <div class="menu-section">

      <div
        class="menu-item"
        @click="router.push('/auth/update-profile')"
      >

        <div class="menu-icon">
          <i class="fi fi-rr-user"></i>
        </div>

        <div class="menu-content">
          <span class="menu-title">
            Modifier mes informations
          </span>

          <span class="menu-description">
            Profil et informations personnelles
          </span>
        </div>

        <i class="fi fi-rr-angle-small-right arrow"></i>

      </div>



      <div
        class="menu-item"
        @click="router.push('/assistance/ai')"
      >

        <div class="menu-icon">
          <i class="fi fi-rr-user-headset"></i>
        </div>

        <div class="menu-content">
          <span class="menu-title">
            Assistance
          </span>

          <span class="menu-description">
            Besoin d'aide ?
          </span>
        </div>

        <i class="fi fi-rr-angle-small-right arrow"></i>

      </div>



      <div
        class="menu-item"
        @click="router.push('/transaction/history-transaction')"
      >

        <div class="menu-icon">
          <i class="fi fi-rr-time-past"></i>
        </div>

        <div class="menu-content">
          <span class="menu-title">
            Historique des flux
          </span>

          <span class="menu-description">
            Toutes vos transactions
          </span>
        </div>

        <i class="fi fi-rr-angle-small-right arrow"></i>

      </div>
       <div
        class="menu-item share-item"
        @click="handleShareReferral"
      >

        <div class="menu-icon">
          <i class="fi fi-rr-share"></i>
        </div>

        <div class="menu-content">
          <span class="menu-title">
            Partager mon lien
          </span>

          <span class="menu-description">
            Invitez vos proches
          </span>
        </div>

        <i class="fi fi-rr-angle-small-right arrow"></i>

      </div>


      <div class="section-header games-title">
        <span>Egames</span>
      </div>


      <div
        class="menu-item game-item"
        @click="router.push('/game/roulette-game')"
      >

        <div class="menu-icon">
          <i class="fi fi-rr-gamepad"></i>
        </div>

        <div class="menu-content">
          <span class="menu-title">
            Lucky Wheel
          </span>

          <span class="menu-description">
            Tentez votre chance
          </span>
        </div>

        <i class="fi fi-rr-angle-small-right arrow"></i>

      </div>



      <div
        class="menu-item game-item"
        @click="router.push('/game/pachinko-game')"
      >

        <div class="menu-icon">
          <i class="fi fi-rr-gamepad"></i>
        </div>

        <div class="menu-content">
          <span class="menu-title">
            Pachinko
          </span>

          <span class="menu-description">
            Jouez et gagnez
          </span>
        </div>

        <i class="fi fi-rr-angle-small-right arrow"></i>

      </div>



      <div
        class="menu-item game-item"
        @click="router.push('/game/plane-game')"
      >

        <div class="menu-icon">
          <i class="fi fi-rr-gamepad"></i>
        </div>

        <div class="menu-content">
          <span class="menu-title">
            Plane Arena
          </span>

          <span class="menu-description">
            Jusqu'où irez-vous ?
          </span>
        </div>

        <i class="fi fi-rr-angle-small-right arrow"></i>

      </div>


     


      <div
        class="menu-item logout"
        @click="handleLogout"
      >

        <div class="menu-icon">
          <i class="fi fi-rr-exit"></i>
        </div>

        <div class="menu-content">
          <span class="menu-title">
            Se déconnecter
          </span>

          <span class="menu-description">
            Quitter votre session
          </span>
        </div>

      </div>

    </div>


    <Footer />

  </div>
</template>



<style scoped>

* {
  box-sizing: border-box;
}

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


/* =========================================================
   HERO
========================================================= */

.hero-wallet {
  position: relative;

  height: 200px;

  width: 100%;

  overflow: hidden;

  border-radius: 32px;

  padding: 20px;

  background: #161019;

  isolation: isolate;

}


.hero-bg {
  position: absolute;

  inset: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center;

  z-index: 0;

  pointer-events: none;

  transform: scale(1.03);
}



.hero-overlay {
  position: absolute;

  inset: 0;

  z-index: 1;

  pointer-events: none;

  background:
    linear-gradient(
      90deg,

      rgba(9, 5, 16, 0.589) 0%,

      rgba(12, 6, 19, 0.384) 28%,

      rgba(12, 6, 19, 0.50) 53%,

      rgba(12, 6, 19, 0.08) 82%,

      rgba(12, 6, 19, 0) 100%
    );
}


/* =========================================================
   LOGO 2 / FILLE
========================================================= */

.hero-girl {
  position: absolute;

  /*
   * Beaucoup plus grande que précédemment.
   *
   * Elle doit presque toucher
   * le haut et le bas.
   */
  width: 440px;

  max-width: none;

  height: auto;

  right: -92px;

  bottom: -92px;

  z-index: 2;

  object-fit: contain;

  pointer-events: none;

  user-select: none;

  -webkit-user-drag: none;

  filter:
    drop-shadow(
      -14px
      12px
      20px
      rgba(0, 0, 0, 0.15)
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
   PROFILE
========================================================= */

.profile-mini {
  display: flex;

  align-items: center;

  gap: 11px;
}


.avatar-img {
  width: 48px;

  height: 48px;

  border-radius: 16px;

  object-fit: cover;

  border:
    2px solid
    rgba(255, 255, 255, 0.55);

  background: #ffffff;

  box-shadow:
    0 5px 15px
    rgba(0, 0, 0, 0.12);
}


.profile-text {
  display: flex;

  flex-direction: column;

  min-width: 0;
}


.welcome-text {
  margin-bottom: 3px;

  font-size: 10px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.7px;

  color:
    rgba(255, 255, 255, 0.62);
}


.user-name {
  margin: 0;

  max-width: 150px;

  overflow: hidden;

  white-space: nowrap;

  text-overflow: ellipsis;

  font-size: 18px;

  font-weight: 900;

  line-height: 1.05;

  color: #ffffff;
}


/* =========================================================
   TRANSFER BUTTON
========================================================= */

.transfer-btn {
  position: relative;

  z-index: 10;

  width: 45px;

  height: 45px;

  flex-shrink: 0;

  display: flex;

  justify-content: center;

  align-items: center;

  border:
    1px solid
    rgba(255, 255, 255, 0.22);

  border-radius: 15px;

  background:
    rgba(255, 255, 255, 0.14);

  backdrop-filter: blur(14px);

  -webkit-backdrop-filter: blur(14px);

  color: #ffffff;

  font-size: 18px;

  cursor: pointer;

  box-shadow:
    inset
    0
    1px
    0
    rgba(255, 255, 255, 0.13);

  transition:
    transform 0.2s ease,
    background 0.2s ease;
}


.transfer-btn:active {
  transform: scale(0.9);
}


.transfer-btn:disabled {
  opacity: 0.6;
}


/* =========================================================
   MAIN BALANCE
========================================================= */

.hero-balance {
  position: absolute;

  left: 20px;

  top: 124px;

  z-index: 4;

  max-width: 60%;
}


.balance-label {
  display: block;

  margin-bottom: 7px;

  font-size: 11px;

  font-weight: 700;

  letter-spacing: 0.5px;

  color:
    rgba(255, 255, 255, 0.62);
}


.amount-row {
  display: flex;

  align-items: flex-end;

  gap: 7px;
}


.amount {
  font-size: clamp(
    32px,
    8vw,
    42px
  );

  line-height: 0.92;

  font-weight: 950;

  letter-spacing: -1.5px;

  color: #ffffff;

  text-shadow:
    0 4px 20px
    rgba(0, 0, 0, 0.18);
}


.currency {
  padding-bottom: 3px;

  font-size: 13px;

  font-weight: 900;

  color:
    v-bind('AppColor.primary.base');
}

.hero-status {
  position: absolute;

  left: 20px;

  bottom: 15px;

  z-index: 5;

  display: inline-flex;

  align-items: center;

  gap: 7px;

  padding:
    7px
    10px;

  border:
    1px solid
    rgba(255, 255, 255, 0.12);

  border-radius: 50px;

  background:
    rgba(255, 255, 255, 0.08);

  backdrop-filter: blur(10px);

  -webkit-backdrop-filter: blur(10px);

  font-size: 10px;

  font-weight: 700;

  color:
    rgba(255, 255, 255, 0.72);
}


.status-dot {
  width: 6px;

  height: 6px;

  border-radius: 50%;

  background: #3ddc84;

  box-shadow:
    0 0 8px
    rgba(61, 220, 132, 0.75);
}

.balance-summary {
  position: relative;

  z-index: 10;

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 10px;

  margin-top: 12px;

  margin-bottom: 28px;
}


.summary-card {
  min-width: 0;

  padding: 14px;

  display: flex;

  align-items: center;

  gap: 10px;

 

  border-radius: 20px;

  background:
    #ffffff;

  
}


.summary-icon {
  width: 38px;

  height: 38px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 13px;

  background:
    color-mix(
      in srgb,
      v-bind('AppColor.primary.base')
      11%,
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
  margin-bottom: 4px;

  font-size: 9px;

  font-weight: 800;

  text-transform: uppercase;

  color: #999999;
}


.summary-amount {
  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  font-size: 14px;

  font-weight: 900;

  color: #202020;
}


.summary-amount small {
  margin-left: 2px;

  font-size: 8px;

  color: #999999;
}

.section-header {
  padding:
    0
    4px
    9px;

  font-size: 13px;

  font-weight: 900;

  color: #181818;
}


.games-title {
  margin-top: 12px;

  padding-top: 5px;
}

.menu-section {
  display: flex;

  flex-direction: column;

  gap: 9px;
}


.menu-item {
  position: relative;

  display: flex;

  align-items: center;

  min-height: 68px;

  padding:
    12px
    14px;

 

  border-radius: 20px;

  /* background: #ffffff; */

  cursor: pointer;

 

  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}


.menu-item:active {
  transform:
    scale(0.98);
}


.menu-icon {
  width: 43px;

  height: 43px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-right: 13px;

  border-radius: 14px;

  background:
    color-mix(
      in srgb,
      v-bind('AppColor.primary.base')
      9%,
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
  margin-bottom: 3px;

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
   GAME
========================================================= */

.game-icon {
  background:
    rgba(125, 74, 255, 0.09);

  color: #744cff;
}

.share-icon {
  background:
    rgba(33, 188, 104, 0.10);

  color: #1faa62;
}

.menu-item.logout {
  margin-top: 7px;

  border-color:
    rgba(255, 71, 87, 0.12);

  background:
    rgba(255, 71, 87, 0.055);
}


.menu-item.logout .menu-icon {
  background:
    rgba(255, 71, 87, 0.11);

  color: #ff4757;
}


.menu-item.logout .menu-title {
  color: #ff4757;
}

.mini-spinner {
  width: 18px;

  height: 18px;

  border:
    2px solid
    rgba(255, 255, 255, 0.3);

  border-top-color:
    #ffffff;

  border-radius:
    50%;

  animation:
    spin
    0.8s
    linear
    infinite;
}


@keyframes spin {

  100% {
    transform:
      rotate(360deg);
  }

}


/* =========================================================
   MOBILE <= 430
========================================================= */

@media (max-width: 430px) {

  .hero-wallet {
    height: 215px;

    border-radius: 28px;
  }


  .hero-girl {
    width: 420px;

    right: -105px;

    bottom: -83px;
  }


  .hero-balance {
    top: 89px;
  }


  .amount {
    font-size: 35px;
  }

}


/* =========================================================
   MOBILE <= 390
========================================================= */

@media (max-width: 390px) {

  .profile-page {
    padding-left: 12px;

    padding-right: 12px;
  }


  .hero-wallet {
    height: 205px;

    padding: 17px;
  }


  .hero-girl {
    width: 395px;

    right: -105px;

    bottom: -72px;
  }


  .hero-balance {
    left: 17px;

    top: 95px;
  }


  .hero-status {
    left: 17px;

    bottom: 25px;
  }


  .amount {
    font-size: 32px;
  }


  .currency {
    font-size: 11px;
  }


  .summary-card {
    padding: 12px;
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
   MOBILE <= 350
========================================================= */

@media (max-width: 350px) {

  .hero-wallet {
    height: 220px;
  }


  .hero-girl {
    width: 370px;

    right: -110px;

    bottom: -65px;
  }


  .avatar-img {
    width: 44px;

    height: 44px;
  }


  .user-name {
    max-width: 105px;

    font-size: 16px;
  }


  .hero-balance {
    top: 98px;
  }


  .amount {
    font-size: 29px;
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