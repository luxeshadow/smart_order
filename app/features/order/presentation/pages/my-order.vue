<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppColor } from '@/core/constants/app_colors'
import { AppImage } from '@/core/constants/app_images'
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
import SmartChart from '@/core/components/client/mobile/SmartChart.vue'
import Footer from '@/core/components/client/mobile/Footer.vue'

const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()
const { showToast } = useToast()

const isValidating = ref(false)

const listRepository = new ListMyOrderItemRepositoryImpl()
const listOrdersUseCase = new ListMyOrderItemUseCase(listRepository)

const validateRepository = new ValidateMyOrderItemRepositoryImpl()
const validateUseCase = new ValidateMyOrderItemUseCase(validateRepository)

/**
 * Détecte si le lien de la photo est en réalité une vidéo
 */
const isVideo = (path: string | undefined | null): boolean => {
    if (!path) return false
    const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.avi']
    return videoExtensions.some(ext => path.toLowerCase().endsWith(ext))
}

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

                            <video v-if="currentProduct.productPhoto && isVideo(currentProduct.productPhoto)"
                                :src="currentProduct.productPhoto" class="bordered-img" autoplay muted loop
                                playsinline></video>

                            <img v-else :src="currentProduct.productPhoto" alt="Product" class="bordered-img" />
                        </div>

                        <div class="content-section">
                            <h2 class="product-title">{{ currentProduct.productName }}</h2>
                            <p class="product-price">{{ currentProduct.priceAtPurchase }} FCFA</p>
                            <div class="profit-badge">
                                +{{ currentProduct.commission }} FCFA bénéfice
                            </div>
                        </div>

                        <button class="validate-btn" :disabled="isValidating" @click="handleValidation"
                            :class="{ 'btn-loading': isValidating }">
                            <span v-if="!isValidating">Valider</span>
                            <span v-else>Traitement...</span>
                            <i v-if="!isValidating" class="fi fi-rr-plus"></i>
                        </button>
                    </div>

                    <div v-else class="empty-state">
                        <div class="empty-icon-wrapper">
                            <img :src="AppImage.EmptyBox" alt="Aucune donnée" class="empty-gif" />
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
                    <p><strong>Commande classique :</strong> 10% de commission versés sur votre compte après validation.
                    </p>
                    <p><strong>Commande chanceuse :</strong> 12% de commission versés pour les articles sélectionnés.
                    </p>
                </div>
            </div>
        </div>

        <SmartChart />
        <Footer />
    </div>
</template>

<style scoped>
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 10px 20px;
    /* Augmenté un peu pour l'équilibre visuel */
    width: 100%;
    animation: fadeIn 0.5s ease-out;
}

.empty-icon-wrapper {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    border: 1px solid #f1f1f1;
    overflow: hidden;
    /* Pour que le GIF ne dépasse pas du cercle */
}

.empty-gif {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Remplit le cercle proprement */
}

.empty-state h3 {
    font-size: 12px;
    font-weight: 800;
    color: #2d3436;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
    text-transform: uppercase;
    /* Optionnel : pour le style admin */
}

.empty-state p {
    font-size: 11px;
    /* Légèrement plus grand pour la lisibilité */
    font-weight: 500;
    color: #95a5a6;
    margin: 0;
    max-width: 250px;
    line-height: 1.4;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Petite animation d'entrée */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.order-page {
    padding: 10px;
    padding-top: 85px;
    background: white;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

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

.spacer {
    width: 45px;
}

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

.pill-icon {
    color: v-bind('AppColor.primary.base');
    font-size: 14px;
}

.pill-category span {
    font-weight: 700;
    font-size: 13px;
    color: #3f3e3e;
}

/* Product Card */
.product-view {
    width: 100%;
    display: flex;
    justify-content: center;
}

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

.image-section {
    position: relative;
}

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

.status-badge.new {
    background: v-bind('AppColor.primary.base');
}

.status-badge.old {
    background: #636e72;
}

.bordered-img {
    width: 90px;
    height: 90px;
    border-radius: 10px;
    object-fit: cover;
    border: 1.5px solid #f8f8f8;
}

.content-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    justify-content: center;
}

.product-title {
    font-size: 16px;
    font-weight: 800;
    color: #111;
    margin: 0;
}

.product-price {
    color: #777;
    font-size: 13px;
    font-weight: 600;
    margin: 0;
}

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

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateX(15px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-15px);
}

.order-info-box {
    width: 100%;
    max-width: 480px;
    margin-top: 12px;
    padding: 20px;
    border-radius: 16px;
}

.info-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.info-icon {
    min-width: 38px;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: v-bind('AppColor.primary.base');
    color: white;
    font-size: 16px;
}

.info-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-text p {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    color: #444;
    line-height: 1.5;
}

.info-text strong {
    color: #111;
}
</style>