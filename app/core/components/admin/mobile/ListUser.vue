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
  {
    id: 1,
    username: 'natanael',
    email: 'nat@gmail.com',
    subscribedShops: ['Amazon', 'Temu'],
    mainBalance: 45000,
    refundBalance: 5000
  },
  {
    id: 2,
    username: 'shadow',
    email: 'shadow@gmail.com',
    subscribedShops: ['Alibaba', 'Costco', 'Amazon'],
    mainBalance: 22000,
    refundBalance: 3500
  },
  {
    id: 3,
    username: 'benoit',
    email: 'benoit@gmail.com',
    subscribedShops: ['Temu'],
    mainBalance: 80000,
    refundBalance: 10000
  }
])

const filteredUsers = computed(() => {
  if (!search.value.trim()) return users.value

  const keyword = search.value.toLowerCase()

  return users.value.filter((user) =>
    user.username.toLowerCase().includes(keyword) ||
    user.email.toLowerCase().includes(keyword) ||
    user.subscribedShops.some((shop) =>
      shop.toLowerCase().includes(keyword)
    )
  )
})

const clearSearch = () => {
  search.value = ''
}
</script>

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

        <button
          v-if="search"
          class="clear-btn"
          @click="clearSearch"
        >
          <i class="fi fi-rr-cross-small"></i>
        </button>
      </div>
    </div>

    <div class="users-grid">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="user-card"
      >
        <div class="accent-glow"></div>

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
          <div
            v-for="shop in user.subscribedShops"
            :key="shop"
            class="shop-chip"
          >
            {{ shop }}
          </div>
        </div>

        <div class="balances">
          <div class="balance-box main">
            <span>Main Balance</span>
            <strong>{{ user.mainBalance.toLocaleString() }}</strong>
          </div>

          <div class="balance-box refund">
            <span>Refund Balance</span>
            <strong>{{ user.refundBalance.toLocaleString() }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-user-page {
  padding: 16px;
}

.top-bar {
  margin-bottom: 18px;
}

.search-box {
  position: relative;
}

.clear-btn {
  position: absolute;
  right: 14px;
  top: 38px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* GRID */
.users-grid {
  display: grid;
  gap: 16px;
}

/* CARD */
.user-card {
  position: relative;
  overflow: hidden;
  background: white;
  border-radius: 22px;
  padding: 18px;
  border: 1px solid v-bind('AppColor.primary.light');
  box-shadow: 0 12px 30px rgba(255, 94, 0, 0.08);
}

.accent-glow {
  position: absolute;
  width: 100px;
  height: 100px;
  right: -20px;
  top: -20px;
  background: v-bind('AppColor.primary.base');
  opacity: 0.08;
  border-radius: 50%;
  filter: blur(40px);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 2;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    v-bind('AppColor.primary.base'),
    v-bind('AppColor.primary.dark')
  );
  color: white;
  font-weight: 800;
  font-size: 20px;
  display: grid;
  place-items: center;
}

.user-meta h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
}

.user-meta p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
}

/* MULTI SHOPS */
.shops-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.shop-chip {
  padding: 6px 12px;
  border-radius: 999px;
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.dark');
  font-size: 12px;
  font-weight: 700;
}

/* BALANCES */
.balances {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.balance-box {
  border-radius: 18px;
  padding: 14px;
}

.main {
  background: rgba(255, 94, 0, 0.06);
}

.refund {
  background: rgba(255, 183, 77, 0.12);
}

.balance-box span {
  display: block;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 6px;
}

.balance-box strong {
  font-size: 18px;
  color: #1e293b;
  font-weight: 800;
}

@media (max-width: 600px) {
  .balances {
    grid-template-columns: 1fr;
  }
}
</style>