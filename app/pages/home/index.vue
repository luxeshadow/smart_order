<!-- pages/index.vue -->
<script setup lang="ts">
import FloatingActionButton from '@/core/components/client/FloatingActionButton.vue'
import AppBar from '@/core/components/client/AppBar.vue'
import StatCard from '@/core/components/client/StatCard.vue'
import TransactionActionButton from '@/core/components/client/TransactionActionButton.vue'
import AccountMetricsCard from '@/core/components/client/AccountMetricsCard.vue'
import LoopVideo from '@/core/components/client/LoopVideo.vue'
import Shop from '@/core/components/client/Shop.vue'
import Footer  from '@/core/components/client/Footer.vue'
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