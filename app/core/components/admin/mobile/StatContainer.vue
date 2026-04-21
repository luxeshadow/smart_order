<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Failure } from '@/core/errors/failure'
import type { PlatformStats } from '../../../../features/smartorder_stats/domain/entities/platform_stats'
import { PlatformStatsRepositoryImpl } from '../../../../features/smartorder_stats/data/repositories/platform_stats_repository_impl'
import { GetPlatformStatsUseCase } from '../../../../features/smartorder_stats/application/usecases/get_platform_stats_usecase'

const repository = new PlatformStatsRepositoryImpl()
const statsUseCase = new GetPlatformStatsUseCase(repository)

const stats = ref<PlatformStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// scroll
const containerRef = ref<HTMLElement | null>(null)
const currentTab = ref(0)

const totalBalance = computed(() => {
  if (!stats.value) return 0
  return stats.value.totalDeposits - stats.value.totalWithdrawals
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const fetchStats = async () => {
  loading.value = true
  error.value = null

  const result = await statsUseCase.execute()

  if (result instanceof Failure) {
    error.value = result.message
  } else {
    stats.value = result
  }

  loading.value = false
}

const onScroll = () => {
  if (!containerRef.value) return

  const width = containerRef.value.clientWidth
  currentTab.value = Math.round(containerRef.value.scrollLeft / width)
}

const goTo = (index: number) => {
  if (!containerRef.value) return

  const width = containerRef.value.clientWidth
  containerRef.value.scrollTo({
    left: index * width,
    behavior: 'smooth'
  })
}

onMounted(() => {
  fetchStats()
})
</script>
<template>
  <div class="dashboard-container">

    <div class="block-container" ref="containerRef" @scroll="onScroll">

      <!-- ================= WALLET ================= -->
      <div class="block-page">
        <div class="wallet-card" :class="{ loading }">

          <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
          </div>

          <div v-if="error" class="error-state">
            <i class="fi fi-rr-circle-exclamation"></i>
            <p>{{ error }}</p>
            <button @click="fetchStats" class="retry-btn">Réessayer</button>
          </div>

          <div class="card-header">
            <div class="brand-badge">
              <i class="fi fi-rr-chart-line"></i>
              <span>SmartOrder Stats</span>
            </div>
            <div class="date-badge">
              <i class="fi fi-rr-calendar"></i>
              <span>{{ currentDate }}</span>
            </div>
          </div>

          <div class="hero-section">
            <div class="balance-label">
              <i class="fi fi-rr-wallet"></i>
              <span>Solde Total</span>
            </div>

            <h1 class="balance-value">
              {{ totalBalance.toLocaleString('fr-FR') }}
            </h1>
          </div>

          <div class="stats-grid">
            <div class="stat-card deposit">
              <div class="stat-icon-wrapper">
                <i class="fi fi-rr-arrow-down"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">Dépôts</span>
                <strong class="stat-value">
                  {{ stats?.totalDeposits.toLocaleString('fr-FR') || 0 }}
                </strong>
              </div>
            </div>

            <div class="stat-card withdraw">
              <div class="stat-icon-wrapper">
                <i class="fi fi-rr-arrow-up"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">Retraits</span>
                <strong class="stat-value">
                  {{ stats?.totalWithdrawals.toLocaleString('fr-FR') || 0 }}
                </strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ================= USERS ================= -->
      <div class="block-page">
        <div class="user-section">

          <div class="section-header">
            <i class="fi fi-rr-users-alt"></i>
            <span>Utilisateurs</span>
          </div>

          <div class="user-stats-grid">
            <div class="user-stat-item clients">
              <div class="user-stat-icon">
                <i class="fi fi-rr-users"></i>
              </div>
              <div class="user-stat-info">
                <span class="user-stat-label">Clients</span>
                <strong class="user-stat-value">{{ stats?.countClients || 0 }}</strong>
              </div>
            </div>

            <div class="user-stat-item admins">
              <div class="user-stat-icon">
                <i class="fi fi-rr-shield"></i>
              </div>
              <div class="user-stat-info">
                <span class="user-stat-label">Admins</span>
                <strong class="user-stat-value">{{ stats?.countAdmins || 0 }}</strong>
              </div>
            </div>

            <div class="user-stat-item fakes">
              <div class="user-stat-icon">
                <i class="fi fi-rr-eye-crossed"></i>
              </div>
              <div class="user-stat-info">
                <span class="user-stat-label">Fakes</span>
                <strong class="user-stat-value">{{ stats?.countFakes || 0 }}</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <div class="block-indicators">
      <span :class="{ active: currentTab === 0 }" @click="goTo(0)"></span>
      <span :class="{ active: currentTab === 1 }" @click="goTo(1)"></span>
    </div>

  </div>
</template>

<style scoped>
.block-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 16px;
  scroll-behavior: smooth;
}

.block-container > div {
  min-width: 100%;
  scroll-snap-align: start;
}.block-container::-webkit-scrollbar {
  display: none;
}

.block-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.block-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.block-indicators span {
  width: 8px;
  height: 8px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s;
}

.block-indicators span.active {
  width: 20px;
  border-radius: 10px;
  background: #fa4903;
}

.fade {
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}


/* Container principal - adapté pour PC */
.dashboard-container {
 
  background: linear-gradient(135deg, #0f172a 0%, #1a2332 100%);
  padding: 32px;
}

.dashboard-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
 
  gap: 24px;
  align-items: start;
}

/* Main Card */
.wallet-card {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 40px;
  padding: 32px;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.wallet-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 30px 60px -12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 2;
}

.brand-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  color: #a5f3c3;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 2;
  margin-bottom: 10px;
}

.balance-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

.balance-main {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}



.balance-value {
  font-size: 72px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #a5f3c3 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
}

.balance-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.trend-up {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  position: relative;
  z-index: 2;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  padding: 20px;
  display: flex;
  gap: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.deposit .stat-icon-wrapper {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05));
  color: #22c55e;
}

.withdraw .stat-icon-wrapper {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05));
  color: #ef4444;
}

.stat-content {
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
  font-weight: 500;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin-bottom: 6px;
}

.stat-change {
  font-size: 11px;
  font-weight: 600;
}

.stat-change.positive {
  color: #22c55e;
}

.stat-change.negative {
  color: #ef4444;
}

/* User Section */
.user-section {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 32px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-stats-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: transparent;
}

.user-stat-item {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.user-stat-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
  border-color: rgba(255, 255, 255, 0.1);
}

.user-stat-icon {
  margin-top: 5px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.clients .user-stat-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.admins .user-stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.fakes .user-stat-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.user-stat-info {
  flex: 1;
}

.user-stat-label {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
  font-weight: 500;
}

.user-stat-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
}

.user-stat-progress {
  width: 120px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.clients .progress-bar {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.admins .progress-bar {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.fakes .progress-bar {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

/* Loading State */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 40px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 60px 40px;
  color: white;
}

.error-state i {
  font-size: 64px;
  color: #ef4444;
  margin-bottom: 20px;
}

.retry-btn {
  margin-top: 20px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Decorative Elements */
.gradient-bg {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.1), transparent 70%);
  pointer-events: none;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
  border-radius: 40px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr 360px;
    gap: 20px;
  }
  
  .balance-value {
    font-size: 56px;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 20px;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .user-section {
    position: static;
  }
  
  .wallet-card {
    padding: 24px;
  }
  
  .balance-value {
    font-size: 48px;
  }
  
  .stats-grid {
    gap: 16px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .user-stat-value {
    font-size: 24px;
  }
  
  .user-stat-progress {
    width: 100px;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .wallet-card {
    padding: 20px;
  }
  
  .balance-value {
    font-size: 36px;
  }
  
  .stats-grid {
    gap: 12px;
  }
  
  .stat-card {
    padding: 12px;
    gap: 12px;
  }
  
  .stat-icon-wrapper {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  .user-stat-item {
    padding: 12px;
    gap: 12px;
  }
  
  .user-stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
  .user-stat-value {
    font-size: 20px;
  }
  
  .user-stat-progress {
    width: 80px;
  }
}
</style>