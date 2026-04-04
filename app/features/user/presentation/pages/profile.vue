<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from "pinia"
import { AppColor } from "@/core/constants/app_colors"
import { AppImage } from "@/core/constants/app_images" 
import { useAuthStore } from "@/features/auth/presentation/stores/auth_store"
import Footer from '@/core/components/client/Footer.vue'

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const balances = {
  daily: "1,500",
  refund: "12,400",
  principal: "45,000"
}

// GESTION DU LOGOUT VIA LE STORE
const handleLogout = () => {
  authStore.logout()
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
      <img :src="AppImage.Logo_1" alt="background" class="hero-bg" />
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <div class="user-profile-row">
          <div class="avatar-container">
            <img src="https://ui-avatars.com/api/?name=User&background=fff&color=FF9800" alt="Avatar" class="avatar-img" />
          </div>
          <div class="user-info">
            <span class="welcome-text">Bienvenue,</span>
            <h1 class="user-name">{{ user?.username || 'Utilisateur' }}</h1>
          </div>
          <button class="settings-btn" @click="router.push('/profile/edit')">
            <i class="fi fi-rr-settings"></i>
          </button>
        </div>

        <div class="main-balance-display">
          <span class="balance-label">Solde Principal</span>
          <div class="amount-row">
            <h2 class="amount">{{ balances.principal }}</h2>
            <span class="currency">XOF</span>
          </div>
        </div>

        <div class="glass-balances">
          <div class="glass-item">
            <span class="glass-label">Journalier</span>
            <span class="glass-amount">{{ balances.daily }} <small>XOF</small></span>
          </div>
          <div class="glass-divider"></div>
          <div class="glass-item">
            <span class="glass-label">Remboursement</span>
            <span class="glass-amount">{{ balances.refund }} <small>XOF</small></span>
          </div>
        </div>
      </div>
    </div>

    <div class="menu-section">
      <div class="menu-item" @click="router.push('/profile/edit')">
        <div class="menu-icon"><i class="fi fi-rr-user"></i></div>
        <span>Modifier mes informations</span>
        <i class="fi fi-rr-angle-small-right arrow"></i>
      </div>
      
      <div class="menu-item" @click="router.push('/transaction/history')">
        <div class="menu-icon"><i class="fi fi-rr-time-past"></i></div>
        <span>Historique des flux</span>
        <i class="fi fi-rr-angle-small-right arrow"></i>
      </div>

      <div class="menu-item logout" @click="handleLogout">
        <div class="menu-icon"><i class="fi fi-rr-exit"></i></div>
        <span>Se déconnecter</span>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.profile-page {
  padding: 15px;
  padding-top: 85px;
  background: #fff;
  min-height: 100vh;
}

.app-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 65px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 15px;
  z-index: 1000;
  border-bottom: 1px solid #f1f1f1;
}

.back-btn {
  width: 45px; height: 45px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}

.app-bar-title {
  flex: 1; text-align: center;
  font-weight: 800; font-size: 17px;
  color: #111;
}

.spacer { width: 45px; }

.hero-wallet {
  position: relative;
  width: auto;
  height: 280px;
  border-radius: 30px;
  overflow: hidden;
  margin-bottom: 25px;
  padding: 20px;
}

.hero-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* FIX ALIGNEMENT : display flex + align center */
.user-profile-row { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centre le texte verticalement face à l'avatar */
}

.avatar-img { 
  width: 50px; 
  height: 50px; 
  border-radius: 15px; 
  border: 2px solid rgba(255,255,255,0.4);
  display: block;
}

.welcome-text { font-size: 10px; color: rgba(255,255,255,0.6); font-weight: 700; text-transform: uppercase; line-height: 1; margin-bottom: 4px;}
.user-name { font-size: 18px; color: #fff; font-weight: 900; margin: 0; line-height: 1; }

.settings-btn {
  margin-left: auto; width: 40px; height: 40px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; color: #fff;
}

.balance-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; }
.amount { font-size: 36px; font-weight: 900; color: #fff; margin: 0; }
.currency { font-size: 14px; color: #fff; font-weight: 800; margin-left: 5px; }

.glass-balances {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.glass-item { display: flex; flex-direction: column; flex: 1; }
.glass-label { font-size: 9px; font-weight: 800; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-bottom: 2px; }
.glass-amount { font-size: 14px; font-weight: 900; color: #fff; }
.glass-amount small { font-size: 9px; opacity: 0.7; }
.glass-divider { width: 1px; height: 25px; background: rgba(255,255,255,0.1); margin: 0 15px; }

.menu-section { display: flex; flex-direction: column; gap: 10px; }
.menu-item {
  display: flex; align-items: center; padding: 16px;
  background: #fbfbfb; border-radius: 20px; border: 1px solid #f5f5f5;
}
.menu-icon {
  width: 40px; height: 40px; background: white;
  border-radius: 12px; display: flex; align-items: center;
  justify-content: center; margin-right: 15px;
  color: v-bind('AppColor.primary.base'); border: 1px solid #f0f0f0;
}
.menu-item span { flex: 1; font-weight: 700; font-size: 14px; color: #444; }

.menu-item.logout { margin-top: 5px; background: #fff5f5; border-color: #ffe0e0; }
.menu-item.logout .menu-icon { background: #ff4757; color: white; border: none; }
.menu-item.logout span { color: #ff4757; }
</style>