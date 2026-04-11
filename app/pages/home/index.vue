<!-- pages/index.vue -->
<script setup lang="ts">
import FloatingActionButton from '@/core/components/client/mobile/FloatingActionButton.vue'
import AppBar from '@/core/components/client/mobile/AppBar.vue'
import StatCard from '@/core/components/client/mobile/StatCard.vue'
import TransactionActionButton from '@/core/components/client/mobile/TransactionActionButton.vue'
import AccountMetricsCard from '@/core/components/client/mobile/AccountMetricsCard.vue'
import LoopVideo from '@/core/components/client/mobile/LoopVideo.vue'
import Shop from '@/core/components/client/mobile/Shop.vue'
import Footer  from '@/core/components/client/mobile/Footer.vue'
</script>

<template>
  <div class="app-layout">
    <AppBar />
    <LoopVideo/>
    <StatCard />
    <TransactionActionButton />
    <AccountMetricsCard />
    <Shop />
    <Footer />
    <NuxtRouteAnnouncer />
    <FloatingActionButton />
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
</style>