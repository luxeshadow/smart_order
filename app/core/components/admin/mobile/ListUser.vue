<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Input from '@/core/components/client/mobile/Input.vue'
import { AppColor } from '@/core/constants/app_colors'

import { GetUsersDetailUseCase } from '../../../../features/user/application/usecases/get_user_detail_usercase'
import { UserDetailRepositoryImpl } from '../../../../features/user/data/repositories/user_detail_repository_impl'
import type { UserDetail } from '../../../../features/user/domain/entities/user_detail'
import { Failure } from '@/core/errors/failure'

const search = ref('')
const users = ref<UserDetail[]>([])
const loading = ref(false)

// Gestion des cartes dépliées pour voir les enfants (contient les IDs des users ouverts)
const expandedUsers = ref<Record<string, boolean>>({})

const repository = new UserDetailRepositoryImpl()
const useCase = new GetUsersDetailUseCase(repository)

// 🔥 fetch users
const fetchUsers = async () => {
  loading.value = true

  const result = await useCase.execute({
    query: search.value
  })

  if (result instanceof Failure) {
    console.error(result.message)
  } else {
    users.value = result
  }

  loading.value = false
}

// 🔥 Basculer l'affichage des enfants
const toggleChildren = (userId: string) => {
  expandedUsers.value[userId] = !expandedUsers.value[userId]
}

// 🔥 init
onMounted(() => {
  fetchUsers()
})

// 🔥 recherche dynamique (debounce simple)
let timeout: any
watch(search, () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    fetchUsers()
  }, 400)
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
        <button v-if="search" class="clear-btn" @click="clearSearch">
          <i class="fi fi-rr-cross-small"></i>
        </button>
      </div>
    </div>

    <!-- 🔥 loading -->
    <div v-if="loading" class="loading-state">Chargement...</div>

    <!-- 🔥 users -->
    <div v-else class="users-grid">
      <div v-for="user in users" :key="user.id" class="user-card">
        
        <div class="user-header">
          <div class="avatar">
            {{ user.username?.charAt(0).toUpperCase() }}
          </div>
          <div class="user-meta">
            <h3>{{ user.username }}</h3>
            <p>{{ user.email }}</p>
          </div>
        </div>

        <div class="shops-list">
          <div
            v-for="shop in user.levelNames"
            :key="shop"
            class="shop-chip"
          >
            <i class="fi fi-rr-shop"></i>
            {{ shop }}
          </div>
        </div>

        <div class="balances">
          <div class="balance-box main">
            <span class="box-label">Solde Principal</span>
            <div class="amount-row">
              <strong class="amount">
                {{ Number(user.mainBalance || 0).toLocaleString() }}
              </strong>
              <small class="unit">XOF</small>
            </div>
          </div>

          <div class="balance-box refund">
            <span class="box-label">Remboursement</span>
            <div class="amount-row">
              <strong class="amount">
                {{ Number(user.refundBalance || 0).toLocaleString() }}
              </strong>
              <small class="unit">XOF</small>
            </div>
          </div>
        </div>

        <!-- 🔥 Section enfants/filleuls -->
        <div class="children-section">
          <button 
            class="toggle-children-btn" 
            :class="{ active: expandedUsers[user.id] }"
            @click="toggleChildren(user.id)"
          >
            <span>
              <i class="fi fi-rr-users-alt icon"></i> 
              Filleuls ({{ user.childrenDetails?.length || 0 }})
            </span>
            <i class="fi" :class="expandedUsers[user.id] ? 'fi-rr-angle-small-up' : 'fi-rr-angle-small-down'"></i>
          </button>

          <!-- Liste dépliable -->
          <div v-if="expandedUsers[user.id]" class="children-dropdown">
            <div 
              v-if="!user.childrenDetails || user.childrenDetails.length === 0" 
              class="empty-children"
            >
              Aucun utilisateur parrainé.
            </div>
            
            <div v-else class="children-list">
              <div 
                v-for="child in user.childrenDetails" 
                :key="child.id" 
                class="child-item"
              >
                <div class="child-info">
                  <span class="child-name">{{ child.username }}</span>
                  <span class="child-phone">{{ child.phoneNumber || 'Pas de numéro' }}</span>
                </div>

                <div class="child-right">
                  <!-- Badges des niveaux de l'enfant -->
                  <div class="child-levels">
                    <span 
                      v-for="lvl in child.activeLevels" 
                      :key="lvl" 
                      class="child-level-badge"
                    >
                      {{ lvl }}
                    </span>
                  </div>
                  <span class="child-balance">
                    {{ Number(child.mainBalance || 0).toLocaleString() }} <small>XOF</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.list-user-page { padding: 16px; }
.top-bar { margin-bottom: 16px; }
.search-box { position: relative; }

.loading-state {
  text-align: center;
  padding: 32px;
  color: v-bind('AppColor.tertiary.soft');
  font-size: 14px;
}

.clear-btn {
  position: absolute;
  right: 14px;
  top: 65%;
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

/* 🔥 Styles de la section des enfants */
.children-section {
  margin-top: 14px;
  border-top: 1px dashed v-bind('AppColor.surface.bone');
  padding-top: 12px;
}

.toggle-children-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: v-bind('AppColor.surface.off');
  border: none;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  color: v-bind('AppColor.tertiary.base');
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-children-btn.active {
  background: v-bind('AppColor.surface.smoke');
}

.toggle-children-btn .icon {
  margin-right: 6px;
  color: v-bind('AppColor.primary.base');
}

.children-dropdown {
  margin-top: 8px;
  padding: 4px;
}

.empty-children {
  font-size: 11px;
  color: v-bind('AppColor.tertiary.soft');
  text-align: center;
  padding: 12px 0;
  font-style: italic;
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.child-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #FAFAFA;
  border-radius: 10px;
  border: 1px solid v-bind('AppColor.surface.bone');
}

.child-info {
  display: flex;
  flex-direction: column;
}

.child-name {
  font-size: 12px;
  font-weight: 700;
  color: v-bind('AppColor.tertiary.base');
}

.child-phone {
  font-size: 10px;
  color: v-bind('AppColor.tertiary.soft');
}

.child-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.child-balance {
  font-size: 12px;
  font-weight: 800;
  color: v-bind('AppColor.tertiary.charcoal');
}

.child-balance small {
  font-size: 8px;
  color: v-bind('AppColor.primary.base');
}

.child-levels {
  display: flex;
  gap: 4px;
}

.child-level-badge {
  font-size: 8px;
  font-weight: 700;
  background: v-bind('AppColor.primary.base');
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>