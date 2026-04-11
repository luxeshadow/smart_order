<template>
  <div class="list-user-page">
    <div class="top-bar">
      <div class="search-box">
        <Input
          id="search-user"
          v-model="search"
          label="Recherche utilisateur"
          icon="fi-rr-search"
        />
        <button v-if="search" class="clear-btn" @click="clearSearch">
          <i class="fi fi-rr-cross-small"></i>
        </button>
      </div>
    </div>

    <div class="users-grid">
      <div v-for="user in filteredUsers" :key="user.id" class="user-card">
        
        <div class="user-header">
          <div class="avatar">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>
          <div class="user-meta">
            <h3>{{ user.username }}</h3>
            <p>{{ user.email }}</p>
          </div>
        </div>

        <div class="shops-list">
          <div v-for="shop in user.subscribedShops" :key="shop" class="shop-chip">
            <i class="fi fi-rr-shop"></i>
            {{ shop }}
          </div>
        </div>

        <div class="balances">
          <div class="balance-box main">
            <span class="box-label">Solde Principal</span>
            <div class="amount-row">
              <strong class="amount">{{ user.mainBalance.toLocaleString() }}</strong>
              <small class="unit">XOF</small>
            </div>
          </div>
          <div class="balance-box refund">
            <span class="box-label">Remboursement</span>
            <div class="amount-row">
              <strong class="amount">{{ user.refundBalance.toLocaleString() }}</strong>
              <small class="unit">XOF</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Input from '@/core/components/client/mobile/Input.vue'
import { AppColor } from '@/core/constants/app_colors'

interface User {
  id: number
  username: string
  email: string
  subscribedShops: string[]
  mainBalance: number
  refundBalance: number
}

const search = ref('')

const users = ref<User[]>([
  { id: 1, username: 'natanael', email: 'nat@gmail.com', subscribedShops: ['Amazon', 'Temu'], mainBalance: 45000, refundBalance: 5000 },
  { id: 2, username: 'shadow', email: 'shadow@gmail.com', subscribedShops: ['Alibaba', 'Costco', 'Amazon'], mainBalance: 22000, refundBalance: 3500 },
  { id: 3, username: 'benoit', email: 'benoit@gmail.com', subscribedShops: ['Temu'], mainBalance: 80000, refundBalance: 10000 }
])

const filteredUsers = computed(() => {
  if (!search.value.trim()) return users.value
  const keyword = search.value.toLowerCase()
  return users.value.filter((user) =>
    user.username.toLowerCase().includes(keyword) ||
    user.email.toLowerCase().includes(keyword) ||
    user.subscribedShops.some((shop) => shop.toLowerCase().includes(keyword))
  )
})

const clearSearch = () => { search.value = '' }
</script>

<style scoped>
.list-user-page { padding: 16px; }
.top-bar { margin-bottom: 16px; }
.search-box { position: relative; }

.clear-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background: v-bind('AppColor.surface.smoke');
  color: v-bind('AppColor.tertiary.soft');
  display: flex;
  align-items: center;
  justify-content: center;
}

.users-grid { display: grid; gap: 12px; }

.user-card {
  background: white;
  border: 1.5px solid v-bind('AppColor.surface.bone');
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}

.user-header { display: flex; align-items: center; gap: 12px; }

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: linear-gradient(135deg, v-bind('AppColor.primary.base'), v-bind('AppColor.primary.dark'));
  color: white;
  font-weight: 800;
  font-size: 18px;
  display: grid; 
  place-items: center;
}

.user-meta h3 { margin: 0; font-size: 15px; font-weight: 700; color: v-bind('AppColor.tertiary.base'); }
.user-meta p { margin: 2px 0 0; font-size: 11px; color: v-bind('AppColor.tertiary.soft'); }

.shops-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }

.shop-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: v-bind('AppColor.secondary.light');
  color: v-bind('AppColor.secondary.dark');
  font-size: 10px;
  font-weight: 700;
  display: flex; 
  align-items: center; 
  gap: 4px;
}

.balances { display: flex; gap: 10px; margin-top: 14px; }

.balance-box {
  flex: 1;
  border-radius: 16px;
  padding: 10px 12px;
  border: 1px solid v-bind('AppColor.surface.bone');
}

.main { background: v-bind('AppColor.surface.off'); }
.refund { background: #FFFFFF; }

.box-label {
  display: block;
  font-size: 9px;
  color: v-bind('AppColor.tertiary.soft');
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
}

.amount-row { display: flex; align-items: baseline; gap: 4px; }
.amount { font-size: 14px; font-weight: 800; color: v-bind('AppColor.tertiary.charcoal'); }
.unit { font-size: 9px; font-weight: 600; color: v-bind('AppColor.primary.base'); }
</style>