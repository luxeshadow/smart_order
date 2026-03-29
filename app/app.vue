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

<script setup lang="ts">
import FloatingActionButton from '@/core/components/client/FloatingActionButton.vue'
import AppBar from '@/core/components/client/AppBar.vue'
import StatCard from '@/core/components/client/StatCard.vue'
import TransactionActionButton from '@/core/components/client/TransactionActionButton.vue'
import AccountMetricsCard from '@/core/components/client/AccountMetricsCard.vue'
import LoopVideo from '@/core/components/client/LoopVideo.vue'
import Shop from '@/core/components/client/Shop.vue'
import Footer  from '@/core/components/client/Footer.vue'


useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    }
  ]
})
</script>

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

