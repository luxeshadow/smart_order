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
                <p class="loader-text">Chargement des commandes...</p>
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
                            <span v-else>Traitement...</span>
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
                    <p><strong>Commande classique :</strong> 10% de commission versés sur votre compte après validation.</p>
                    <p><strong>Commande chanceuse :</strong> 20% de commission versés pour les articles sélectionnés.</p>
                </div>
            </div>
        </div>

        <SmartChart />
        <Footer />
    </div>
</template>

<style scoped>
/* --- Structure de la Page --- */
.order-page {
    padding: 15px;
    padding-top: 85px; /* Espace pour l'AppBar */
    background: #fcfcfc;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

/* --- AppBar --- */
.app-bar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 65px;
    background: white;
    display: flex;
    align-items: center;
    padding: 0 15px;
    z-index: 1000;
    border-bottom: 1px solid #f1f1f1;
}

.back-btn {
    width: 42px;
    height: 42px;
    background-color: #f8f9fa;
    border: 1px solid #eee;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.back-btn:active { transform: scale(0.92); }

.app-bar-title {
    flex: 1;
    text-align: center;
    font-weight: 800;
    font-size: 17px;
    color: #1a1a1a;
}

.spacer { width: 42px; }

/* --- Catégories (Pills) --- */
.category-container {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    width: 100%;
    justify-content: center;
    overflow-x: auto;
    padding: 5px;
}

.pill-category {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    padding: 10px 16px;
    border-radius: 14px;
    border: 1px solid #eee;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    white-space: nowrap;
}

.pill-icon { color: v-bind('AppColor.primary.base'); font-size: 15px; }
.pill-category span { font-weight: 700; font-size: 14px; color: #444; }

.badge-count {
    background: v-bind('AppColor.primary.base');
    color: white;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 8px;
}

/* --- Zone Produit & Card --- */
.product-view {
    width: 100%;
    min-height: 220px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.product-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 15px;
    width: 100%;
    max-width: 480px;
    padding: 15px;
    background: white;
    border-radius: 20px;
    border: 1.5px solid #f2f2f2;
    box-shadow: 0 10px 30px rgba(0,0,0,0.04);
}

.bordered-img {
    width: 100px;
    height: 100px;
    border-radius: 14px;
    object-fit: cover;
    border: 1px solid #f0f0f0;
}

.image-section { position: relative; }

.status-badge {
    position: absolute;
    top: -8px;
    left: -8px;
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: 7px;
    z-index: 2;
    color: white;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.status-badge.new { background: v-bind('AppColor.primary.base'); }
.status-badge.old { background: #636e72; }

.content-section { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.product-title { font-size: 17px; font-weight: 800; color: #111; margin: 0; }
.product-price { color: #888; font-size: 14px; font-weight: 600; margin: 0; }

.profit-badge {
    color: v-bind('AppColor.status.success');
    background: v-bind('AppColor.status.success + "15"');
    font-weight: 800;
    font-size: 12px;
    padding: 5px 12px;
    border-radius: 10px;
    width: fit-content;
    margin-top: 5px;
}

/* --- Bouton Validation --- */
.validate-btn {
    position: absolute;
    bottom: 15px;
    right: 15px;
    background: v-bind('AppColor.primary.base');
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.validate-btn:active { transform: scale(0.95); }
.validate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* --- Loader & Empty State --- */
.loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.spinner {
    width: 38px;
    height: 38px;
    border: 4px solid v-bind('AppColor.primary.light + "30"');
    border-top-color: v-bind('AppColor.primary.base');
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
    text-align: center;
    padding: 30px;
}

.empty-icon-wrapper {
    width: 70px;
    height: 70px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
}

.empty-icon { font-size: 32px; color: #ccc; }
.empty-state h3 { font-size: 18px; font-weight: 800; color: #333; margin: 0; }
.empty-state p { font-size: 14px; color: #999; margin-top: 5px; }

/* --- Info Box (Large) --- */
.order-info-box {
    width: 100%;
    max-width: 480px;
    background: white;
    padding: 24px;
    border-radius: 22px;
    border: 1px solid #f0f0f0;
    margin-top: 10px;
}

.info-row { display: flex; gap: 15px; align-items: flex-start; }

.info-icon {
    min-width: 46px;
    height: 46px;
    background: v-bind('AppColor.primary.base');
    color: white;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.info-text p {
    margin: 0;
    font-size: 14px; /* Plus grand */
    font-weight: 600;
    color: #555;
    line-height: 1.6;
}

.info-text p:first-child { margin-bottom: 10px; }
.info-text strong { color: #000; font-weight: 800; }

/* --- Transitions --- */
.fade-slide-enter-active, .fade-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }

/* --- Responsive Mobile --- */
@media (max-width: 500px) {
    .product-card {
        flex-direction: row;
        align-items: center;
    }
    .bordered-img {
        width: 85px;
        height: 85px;
    }
    .product-title { font-size: 15px; }
}
</style>