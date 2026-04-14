<script setup lang="ts">
import { ref } from 'vue'
import AppBar from '@/core/components/admin/mobile/AppBar.vue'
import BottomNavigationBar from '@/core/components/admin/mobile/BottomNavigationBar.vue'
import StatContainer from '@/core/components/admin/mobile/StatContainer.vue'
import ShopContainer from '@/core/components/admin/mobile/ShopContainer.vue'
import ListUser from '@/core/components/admin/mobile/ListUser.vue'
import AdminWithdrawalPage from '../../features/transaction/presentation/pages/validate-withdrawal.vue'
import ListProduct from '../../features/product/presentation/pages/list-product.vue'

const activeTab = ref('dashboard')
</script>

<template>
  <div class="app-layout">
    <AppBar />

    <main class="page-content">
      <template v-if="activeTab === 'dashboard'">
        <StatContainer />
        <ShopContainer />
        <ListProduct />
      </template>

      <template v-if="activeTab === 'manager'">
        <ListUser />
      </template>

      <template v-if="activeTab === 'withdrawal'">
        <div class="placeholder-page">
            <AdminWithdrawalPage />
        </div>
      </template>
    </main>

    <BottomNavigationBar v-model="activeTab" />
    <NuxtRouteAnnouncer />
  </div>
</template>

<style>
:root {
  font-family: 'Inter', sans-serif;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  background-color: #f5f5f5;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, button, span {
  font-family: 'Inter', sans-serif;
}

.app-layout {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 90px;
}

.page-content {
  padding-top: 12px;
}

.placeholder-page {
  padding: 20px;
}
</style>