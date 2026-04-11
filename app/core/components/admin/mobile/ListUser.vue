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
  padding: 12px;
}

.top-bar {
  margin-bottom: 12px;
}

.search-box {
  position: relative;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 52px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.base');
  display: flex;
  align-items: center;
  justify-content: center;
}

/* LIST */
.users-grid {
  display: grid;
  gap: 10px;
}

.user-card {
  background: white;
  border: 1px solid v-bind('AppColor.primary.light');
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(255, 94, 0, 0.05);
}

/* HEADER */
.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    v-bind('AppColor.primary.base'),
    v-bind('AppColor.primary.dark')
  );
  color: white;
  font-weight: 800;
  font-size: 16px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.user-meta {
  flex: 1;
  min-width: 0;
}

.user-meta h3 {
  margin: 0;
  font-size: 14px;
  color: #1e293b;
  line-height: 1.2;
}

.user-meta p {
  margin: 2px 0 0;
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* INLINE SHOPS */
.shops-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.shop-chip {
  padding: 4px 8px;
  border-radius: 999px;
  background: v-bind('AppColor.primary.light');
  color: v-bind('AppColor.primary.dark');
  font-size: 10px;
  font-weight: 700;
}

/* INLINE BALANCES */
.balances {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}

.balance-box {
  flex: 1;
  border-radius: 12px;
  padding: 8px 10px;
}

.main {
  background: rgba(255, 94, 0, 0.06);
}

.refund {
  background: rgba(255, 183, 77, 0.12);
}

.balance-box span {
  display: block;
  font-size: 10px;
  color: #64748b;
  margin-bottom: 3px;
}

.balance-box strong {
  font-size: 14px;
  color: #1e293b;
  font-weight: 800;
}
</style>