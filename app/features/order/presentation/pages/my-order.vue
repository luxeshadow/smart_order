<script setup lang="ts">
import SmartChart from '@/core/components/client/SmartChart.vue'
import Footer from '@/core/components/client/Footer.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppColor } from '@/core/constants/app_colors'

const router = useRouter()

type Product = {
  id: number
  name: string
  price: string
  profit: string
  image: string
  status: 'new' | 'old'
}

const currentIndex = ref(0)
const products = ref<Product[]>([
  {
    id: 1,
    name: 'Yaourt fruité',
    price: '2000 FCFA',
    profit: '+150 FCFA',
    status: 'new',
    image: 'https://i.postimg.cc/8cbpwgWx/Whats-App-Image-2026-04-03-at-11-38-06.jpg'
  },
  {
    id: 2,
    name: 'Salade César',
    price: '3500 FCFA',
    profit: '+300 FCFA',
    status: 'old',
    image: 'https://i.postimg.cc/ZK7ZqcLH/Whats-App-Image-2026-04-03-at-11-38-07-(3).jpg'
  },
  { 
    id: 3, 
    name: 'AirPods Pro 2',  
    price:'35000 FCFA', 
    profit:'+800 FCFA', 
    status: 'new',
    image: 'https://i.postimg.cc/pTJMMYTP/Whats-App-Image-2026-04-03-at-11-38-08.jpg' 
  }, 
  { 
    id: 4, 
    name: 'Samsung S24 Ultra', 
    price: '76655 FCFA',
    profit: '+3080 FCFA', 
    status: 'new',
    image: 'https://i.postimg.cc/c1TGDm2z/Whats-App-Image-2026-04-03-at-11-38-05-(2).jpg' 
  },
])

const currentProduct = computed(() => products.value[currentIndex.value] ?? null)

const nextProduct = () => {
  if (!products.value.length) return
  currentIndex.value = currentIndex.value < products.value.length - 1 ? currentIndex.value + 1 : 0
}

const categories = [
  { name: 'Pending', count: 12, icon: 'fi-rr-layers' },
  { name: 'Pickup', icon: 'fi-rr-shopping-basket' },
  { name: 'Rated', icon: 'fi-rr-star' }
]
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
      <Transition name="fade-slide" mode="out-in">
        <div v-if="currentProduct" :key="currentProduct.id" class="product-card">
          
          <div class="image-section">
            <span :class="['status-badge', currentProduct.status]">
              {{ currentProduct.status }}
            </span>
            <img :src="currentProduct.image" alt="Product" class="bordered-img" />
          </div>

          <div class="content-section">
            <h2 class="product-title">{{ currentProduct.name }}</h2>
            <p class="product-price">{{ currentProduct.price }}</p>
            <div class="profit-badge">
                {{ currentProduct.profit }} bénéfice
            </div>
          </div>

          <button class="validate-btn" @click="nextProduct">
            <span>Valider</span>
            <i class="fi fi-rr-plus"></i>
          </button>
        </div>
      </Transition>
    </div>

    <SmartChart />
  </div>
   <Footer />
</template>

<style scoped>
.order-page {
  padding: 20px;
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
  width: 45px; height: 45px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.app-bar-title { flex: 1; text-align: center; font-weight: 700; font-size: 17px; color: #2d3436; }
.spacer { width: 45px; }

/* Categories */
.category-container { display: flex; gap: 10px; padding-bottom: 25px; width: 100%; justify-content: center; flex-wrap: wrap; }
.pill-category {
  display: flex; align-items: center; gap: 8px;
  background: v-bind('AppColor.primary.light + "40"');
  padding: 8px 14px; border-radius: 14px;
  border: 1px solid v-bind('AppColor.primary.light');
}
.badge-count {
  background: v-bind('AppColor.primary.base');
  color: white; font-size: 10px; font-weight: 800;
  padding: 2px 7px; border-radius: 8px; min-width: 18px;
}
.pill-icon { color: v-bind('AppColor.primary.base'); font-size: 14px; }
.pill-category span { font-weight: 700; font-size: 13px; color: #333; }

/* Product Card */
.product-view { width: 100%; display: flex; justify-content: center; }
.product-card {
  position: relative; display: flex; align-items: center; gap: 12px;
  width: 100%; max-width: 480px; padding: 12px;
  background: white; border-radius: 15px; border: 1.2px solid #f2f2f2;
}
.image-section { position: relative; }
.status-badge {
  position: absolute; top: -5px; left: -5px;
  font-size: 9px; font-weight: 900; text-transform: uppercase;
  padding: 3px 7px; border-radius: 6px; z-index: 1; color: white;
}
.status-badge.new { background: v-bind('AppColor.primary.base'); }
.status-badge.old { background: #636e72; }
.bordered-img { width: 90px; height: 90px; border-radius: 10px; object-fit: cover; border: 1.5px solid #f8f8f8; }

.content-section { flex: 1; display: flex; flex-direction: column; gap: 6px; justify-content: center; }
.product-title { font-size: 16px; font-weight: 800; color: #111; margin: 0; }
.product-price { color: #777; font-size: 13px; font-weight: 600; margin: 0; }
.profit-badge {
  color: v-bind('AppColor.status.success');
  background: v-bind('AppColor.status.success + "15"');
  font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 8px; width: fit-content;
}

.validate-btn {
  position: absolute; bottom: 12px; right: 12px;
  background: v-bind('AppColor.primary.base');
  color: white; border: none; padding: 8px 14px; border-radius: 12px;
  display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 12px;
}

/* Animations */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(15px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-15px); }
</style>