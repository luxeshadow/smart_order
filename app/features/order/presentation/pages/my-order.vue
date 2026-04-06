<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppColor } from '@/core/constants/app_colors'
import { Failure } from '@/core/errors/failure'
import { useToast } from '@/core/utils/useToast'

// Stores
import { useOrderStore } from '../stores/my_order_item_store'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'

// Clean Arch - UseCases & Repositories
import { ListMyOrderItemUseCase } from '../../application/usecases/list_my_order_item_usecase'
import { ListMyOrderItemRepositoryImpl } from '../../data/repositories/list_my_order_item_repository_impl'
import { ValidateMyOrderItemUseCase } from '../../application/usecases/validate_my_order_item_usecase'
import { ValidateMyOrderItemRepositoryImpl } from '../../data/repositories/validate_my_order_item_repository_impl'

// Components
import SmartChart from '@/core/components/client/SmartChart.vue'
import Footer from '@/core/components/client/Footer.vue'

const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()
const { showToast } = useToast()

const isValidating = ref(false)

const listRepository = new ListMyOrderItemRepositoryImpl()
const listOrdersUseCase = new ListMyOrderItemUseCase(listRepository)

const validateRepository = new ValidateMyOrderItemRepositoryImpl()
const validateUseCase = new ValidateMyOrderItemUseCase(validateRepository)

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
    const userId = authStore.user?.id
    if (!userId) return

    if (orderStore.items.length === 0) {
        orderStore.loading = true
    }
  
    const result = await listOrdersUseCase.execute({ userId })

    if (!(result instanceof Failure)) {
        orderStore.setItems(result)
        if (orderStore.currentIndex >= result.length) {
            orderStore.setCurrentIndex(0)
        }
    }
    orderStore.loading = false
}

const handleValidation = async () => {
    const userId = authStore.user?.id
    const orderItem = currentProduct.value

    if (!userId || !orderItem) {
        showToast('Session expirée ou commande invalide', 'fi-rr-cross-circle', 'error', '#ff4757')
        return
    }

    isValidating.value = true
    
    try {
        const result = await validateUseCase.execute({
            userId: userId,
            orderItemId: orderItem.id
        })

        if (result instanceof Failure) {
            throw new Error(result.message)
        }

        showToast('Commande validée avec succès !', 'fi-rr-check', 'success', '#2ecc71')
        
        // Mise à jour locale pour fluidité
        const newItems = orderStore.items.filter(item => item.id !== orderItem.id)
        orderStore.setItems(newItems)

        if (orderStore.currentIndex >= newItems.length) {
            orderStore.setCurrentIndex(0)
        }

        // On rafraîchit en arrière-plan pour synchroniser les balances
        fetchOrders()

    } catch (error: any) {
        showToast(
            error.message || 'Erreur lors de la validation', 
            'fi-rr-shield-exclamation', 
            'error', 
            '#ff4757'
        )
    } finally {
        isValidating.value = false
    }
}

onMounted(() => {
    fetchOrders()
})

const currentProduct = computed(() => orderStore.items[orderStore.currentIndex] ?? null)

const categories = computed(() => [
    { name: 'Pending', count: orderStore.items.length, icon: 'fi-rr-layers' },
    { name: 'Pickup', icon: 'fi-rr-shopping-basket' },
    { name: 'Rated', icon: 'fi-rr-star' }
])
</script>

<template>
    <div class="page-container">
        <nav class="app-bar">
            <button class="back-btn" @click="router.back()">
                <i class="fi fi-rr-arrow-small-left"></i>
            </button>
            <span class="app-bar-title">My Orders</span>
            <div class="spacer"></div>
        </nav>

        <div class="order-page">
            <div class="category-container">
                <div v-for="cat in categories" :key="cat.name" class="pill-category">
                    <i :class="cat.icon" class="pill-icon"></i>
                    <span>{{ cat.name }}</span>
                    <span v-if="cat.count" class="badge-count">{{ cat.count }}</span>
                </div>
            </div>

            <div class="product-view">
                <div v-if="orderStore.loading && orderStore.items.length === 0" class="loader-container">
                    <div class="spinner"></div>
                    <p class="loader-text">Chargement...</p>
                </div>

                <template v-else>
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

                            <button 
                                class="validate-btn" 
                                :disabled="isValidating"
                                @click="handleValidation"
                                :class="{ 'btn-loading': isValidating }"
                            >
                                <span v-if="!isValidating">Valider</span>
                                <span v-else>...</span>
                                <i v-if="!isValidating" class="fi fi-rr-plus"></i>
                            </button>
                        </div>

                        <div v-else class="empty-state">
                            <div class="empty-icon-wrapper">
                                <i class="fi fi-rr-box-open empty-icon"></i>
                            </div>
                            <h3>Aucune commande</h3>
                            <p>Revenez plus tard pour de nouvelles opportunités.</p>
                        </div>
                    </Transition>
                </template>
            </div>

            <div class="order-info-box">
                <div class="info-row">
                    <div class="info-icon">
                        <i class="fi fi-rr-info"></i>
                    </div>
                    <div class="info-text">
                        <p><strong>Commande classique :</strong> 10% de commission.</p>
                        <p><strong>Commande chanceuse :</strong> 15% de commission.</p>
                    </div>
                </div>
            </div>

            <SmartChart />
            <Footer />
        </div>
    </div>
</template>

<style scoped>
/* Empêche les rebonds bizarres sur mobile */
.page-container {
    overflow-x: hidden;
    width: 100%;
}

/* AppBar FIXE et STABLE */
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
    /* Force le rendu GPU pour éviter le tremblement au scroll */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
}

.order-page {
    padding: 10px;
    padding-top: 85px; /* Espace pour l'AppBar */
    background: white;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* PROTECTION CONTRE LE SAUT D'INTERFACE */
.product-view {
    width: 100%;
    display: flex;
    justify-content: center;
    min-height: 160px; /* IMPORTANT: Doit être proche de la hauteur de ta .product-card */
    align-items: center;
}

.product-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 480px;
    height: 140px; /* Hauteur fixe pour la carte */
    padding: 12px;
    background: white;
    border-radius: 15px;
    border: 1.2px solid #f2f2f2;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 140px; /* Même hauteur que la carte pour éviter le mouvement */
}

/* --- LE RESTE DU CSS (Inchangé mais conservé pour le style) --- */
.empty-icon-wrapper {
    width: 50px;
    height: 50px;
    background-color: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
}

.empty-icon { font-size: 22px; color: #bdc3c7; }
.empty-state h3 { font-size: 14px; color: #2d3436; margin: 0; }
.empty-state p { font-size: 10px; color: #95a5a6; }

.back-btn {
    width: 45px; height: 45px;
    background-color: #f8f9fa;
    border: 1px solid #eee;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
}

.app-bar-title { flex: 1; text-align: center; font-weight: 700; font-size: 17px; }
.spacer { width: 45px; }

.category-container { display: flex; gap: 10px; padding-bottom: 20px; width: 100%; justify-content: center; }
.pill-category { 
    display: flex; align-items: center; gap: 8px; 
    background: v-bind('AppColor.primary.light + "40"');
    padding: 8px 14px; border-radius: 14px;
    border: 1px solid v-bind('AppColor.primary.light');
}

.badge-count {
    background: v-bind('AppColor.primary.base');
    color: white; font-size: 10px; padding: 2px 7px; border-radius: 8px;
}

.bordered-img { width: 85px; height: 85px; border-radius: 10px; object-fit: cover; }
.product-title { font-size: 15px; font-weight: 800; margin: 0; }
.profit-badge { 
    color: v-bind('AppColor.status.success'); 
    background: v-bind('AppColor.status.success + "15"');
    font-size: 11px; padding: 4px 10px; border-radius: 8px;
}

.validate-btn {
    position: absolute; bottom: 12px; right: 12px;
    background: v-bind('AppColor.primary.base');
    color: white; border: none; padding: 8px 14px; border-radius: 10px;
}
</style>