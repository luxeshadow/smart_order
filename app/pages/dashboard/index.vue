<script setup lang="ts">

import AppBar from '@/core/components/admin/mobile/AppBar.vue'
import BottomNavigationBar from '@/core/components/admin/mobile/BottomNavigationBar.vue'
import StatContainer from '@/core/components/admin/mobile/StatContainer.vue'
import ShopContainer from '@/core/components/admin/mobile/ShopContainer.vue'

</script>

<template>
  <div class="app-layout">
    <AppBar />
    <BottomNavigationBar/>
    <StatContainer/>
    <ShopContainer/>
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
</style>