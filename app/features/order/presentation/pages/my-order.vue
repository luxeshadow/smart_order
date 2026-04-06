<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AppColor } from '@/core/constants/app_colors'
import { Failure } from '@/core/errors/failure'

// Stores
import { useOrderStore } from '../stores/my_order_item_store'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'

// Clean Arch
import { ListMyOrderItemUseCase } from '../../application/usecases/list_my_order_item_usecase'
import { ListMyOrderItemRepositoryImpl } from '../../data/repositories/list_my_order_item_repository_impl'

// Components
import SmartChart from '@/core/components/client/SmartChart.vue'
import Footer from '@/core/components/client/Footer.vue'

const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()

const repo = new ListMyOrderItemRepositoryImpl()
const listOrdersUseCase = new ListMyOrderItemUseCase(repo)

const isToday = (dateString: string): boolean => {
    if (!dateString) return false
    const dateToCompare = new Date(dateString)
    const today = new Date()
    return (
        dateToCompare.getDate() === today.getDate() &&
        dateToCompare.getMonth() === today.getMonth() &&
        dateToCompare.getFullYear() === today.getFullYear()
    )
}

const fetchOrders = async () => {
    // 1. Récupération du vrai ID utilisateur depuis l'AuthStore
    const userId = authStore.user?.id
    if (!userId) return

    // 2. On ne montre le loader que si le store est vide pour éviter le flash
    if (orderStore.items.length === 0) {
        orderStore.loading = true
    }
  
    const result = await listOrdersUseCase.execute({ userId: userId })

    if (!(result instanceof Failure)) {
        orderStore.setItems(result)
        
        // Sécurité : Reset de l'index si la liste a rétréci
        if (orderStore.currentIndex >= result.length) {
            orderStore.setCurrentIndex(0)
        }
    }
    orderStore.loading = false
}

onMounted(() => {
    fetchOrders()
})

// Utilisation de l'index mémorisé dans le store au lieu d'un ref local
const currentProduct = computed(() => orderStore.items[orderStore.currentIndex] ?? null)

const nextProduct = () => {
    if (!orderStore.items.length) return
    const nextIdx = orderStore.currentIndex < orderStore.items.length - 1 
        ? orderStore.currentIndex + 1 
        : 0
    orderStore.setCurrentIndex(nextIdx)
}

const categories = computed(() => [
    { name: 'Pending', count: orderStore.items.length, icon: 'fi-rr-layers' },
    { name: 'Pickup', icon: 'fi-rr-shopping-basket' },
    { name: 'Rated', icon: 'fi-rr-star' }
])
</script>

<template>
    <nav class="app-bar">
        <button class="back-btn" @click="router.back()">
            <i class="fi fi-rr-arrow-small-left"></i>
        </button>
        <span class="app-bar-title">My Orders</span>
        <div class="spacer"></div>
    </nav>

    <div class="order-page">
        <div v-if="orderStore.loading && orderStore.items.length === 0" class="loader-container">
            <div class="spinner"></div>
        </div>

        <template v-else>
            <div class="category-container">
                <div v-for="cat in categories" :key="cat.name" class="pill-category">
                    <i :class="cat.icon" class="pill-icon"></i>
                    <span>{{ cat.name }}</span>
                    <span v-if="cat.count" class="badge-count">{{ cat.count }}</span>
                </div>
            </div>

            <div class="product-view">
                <Transition name="fade-slide" mode="out-in">
                    <div v-if="currentProduct" :key="currentProduct.id" class="product-card">

                        <div class="image-section">
                            <span :class="['status-badge', isToday(currentProduct.createdAt) ? 'new' : 'old']">
                                {{ isToday(currentProduct.createdAt) ? 'new' : 'old' }}
                            </span>
                            <img :src="currentProduct.productPhoto" alt="Product" class="bordered-img" />
                        </div>

                        <div class="content-section">
                            <h2 class="product-title">{{ currentProduct.productName }}</h2>
                            <p class="product-price">{{ currentProduct.priceAtPurchase }} FCFA</p>
                            <div class="profit-badge">
                                +{{ currentProduct.commission }} FCFA bénéfice
                            </div>
                        </div>

                        <button class="validate-btn" @click="nextProduct">
                            <span>Valider</span>
                            <i class="fi fi-rr-plus"></i>
                        </button>
                    </div>

                    <div v-else class="empty-state">
                        <p>Aucune commande disponible.</p>
                    </div>
                </Transition>
            </div>

            <div class="order-info-box">
                <div class="info-row">
                    <i class="fi fi-rr-info info-icon"></i>
                    <div class="info-text">
                        <p><strong>Commande classique :</strong> valider = 10% du prix du produit versé</p>
                        <p><strong>Commande chanceuse :</strong> valider = 20% du prix du produit versé</p>
                    </div>
                </div>
            </div>
        </template>

        <SmartChart />
        <Footer />
    </div>
</template>

<style scoped>
.order-page {
    padding: 10px;
    padding-top: 85px;
    background: white;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.loader-container {
    padding: 50px;
}

.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid v-bind('AppColor.primary.light');
    border-top-color: v-bind('AppColor.primary.base');
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* AppBar */
.app-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 65px;
    background: white;
    display: flex;
    align-items: center;
    padding: 0 15px;
    z-index: 1000;
    border-bottom: 1px solid #f1f1f1;
}

.back-btn {
    width: 45px;
    height: 45px;
    background-color: #f8f9fa;
    border: 1px solid #eee;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.app-bar-title {
    flex: 1;
    text-align: center;
    font-weight: 700;
    font-size: 17px;
    color: #2d3436;
}

.spacer { width: 45px; }

/* Categories */
.category-container {
    display: flex;
    gap: 10px;
    padding-bottom: 25px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
}

.pill-category {
    display: flex;
    align-items: center;
    gap: 8px;
    background: v-bind('AppColor.primary.light + "40"');
    padding: 8px 14px;
    border-radius: 14px;
    border: 1px solid v-bind('AppColor.primary.light');
}

.badge-count {
    background: v-bind('AppColor.primary.base');
    color: white;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 8px;
    min-width: 18px;
}

.pill-icon { color: v-bind('AppColor.primary.base'); font-size: 14px; }
.pill-category span { font-weight: 700; font-size: 13px; color: #3f3e3e; }

/* Product Card */
.product-view { width: 100%; display: flex; justify-content: center; }

.product-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 480px;
    padding: 12px;
    background: white;
    border-radius: 15px;
    border: 1.2px solid #f2f2f2;
}

.image-section { position: relative; }

.status-badge {
    position: absolute;
    top: -5px;
    left: -5px;
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    padding: 3px 7px;
    border-radius: 6px;
    z-index: 1;
    color: white;
}

.status-badge.new { background: v-bind('AppColor.primary.base'); }
.status-badge.old { background: #636e72; }

.bordered-img {
    width: 95px;
    height: 95px;
    border-radius: 10px;
    object-fit: cover;
    border: 1.5px solid #f8f8f8;
}

.content-section { flex: 1; display: flex; flex-direction: column; gap: 6px; justify-content: center; }
.product-title { font-size: 16px; font-weight: 800; color: #111; margin: 0; }
.product-price { color: #777; font-size: 13px; font-weight: 600; margin: 0; }

.profit-badge {
    color: v-bind('AppColor.status.success');
    background: v-bind('AppColor.status.success + "15"');
    font-weight: 800;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 8px;
    width: fit-content;
}

.validate-btn {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: v-bind('AppColor.primary.base');
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    font-size: 12px;
}

.empty-state { padding: 40px; text-align: center; color: #999; font-weight: 600; }

/* Animations */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(15px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-15px); }

.order-info-box { width: 100%; max-width: 480px; margin-top: 12px; padding: 20px; border-radius: 16px; }
.info-row { display: flex; gap: 12px; align-items: flex-start; }
.info-icon {
    min-width: 38px; width: 38px; height: 38px;
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    background: v-bind('AppColor.primary.base'); color: white; font-size: 16px;
}
.info-text { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.info-text p { margin: 0; font-size: 12px; font-weight: 600; color: #444; line-height: 1.5; }
.info-text strong { color: #111; }
</style>