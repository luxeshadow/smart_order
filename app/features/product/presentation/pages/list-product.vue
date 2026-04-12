<script setup lang="ts">
import DomeGallery from '~/core/bits-components/DomeGallery/DomeGallery.vue';
import { ListProductUseCase } from '../../application/usecases/list_product_usecase';
import { ListProductRepositoryImpl } from '../../data/repositories/list_product_repository_impl';
import { Failure } from '~/core/errors/failure';
// Importe ta classe de couleurs (ajuste le chemin selon ton projet)
import { AppColor } from '~/core/constants/app_colors'; 

const productImages = ref<string[]>([]);
const errorMsg = ref<string | null>(null);
const pending = ref(true);

// Clean Architecture
const repository = new ListProductRepositoryImpl();
const listProductUseCase = new ListProductUseCase(repository);

onMounted(async () => {
  try {
    const result = await listProductUseCase.execute();
    if (result instanceof Failure) {
      errorMsg.value = result.message;
    } else {
      productImages.value = result
        .map(p => p.photoUrl)
        .filter((url): url is string => typeof url === 'string' && url.length > 0);
      
      if (productImages.value.length === 0) {
        productImages.value = ['https://via.placeholder.com/400'];
      }
    }
  } catch (e) {
    errorMsg.value = "Une erreur est survenue";
  } finally {
    setTimeout(() => { pending.value = false; }, 300);
  }
});
</script>

<template>
  <div class="page-container">
    
    <header class="header-overlay">
      <h1 class="main-title">List Products</h1>
      <div class="title-underline"></div>
    </header>

    <div v-if="pending" class="status-container">
      <div class="loader-wrapper">
        <div class="spinner"></div>
        <span class="pulse-text">Chargement...</span>
      </div>
    </div>

    <div v-else-if="errorMsg" class="status-container error-text">
      {{ errorMsg }}
    </div>

    <DomeGallery
      v-else
      :images="productImages"
      :fit="0.8"
      :min-radius="600"
      :segments="34"
      overlay-blur-color="#060010"
      image-border-radius="20px"
    />
  </div>
</template>

<style scoped>
/* Liaison avec ta classe AppColor */
.page-container {
  --primary-base: v-bind('AppColor.primary.base');
  --primary-dark: v-bind('AppColor.primary.dark');
  --primary-light: v-bind('AppColor.primary.light');

  position: relative;
  margin: 5px;
  height: 100vh;
  width: 100%;
  background-color: #060010;
  overflow: hidden;
  color: white;
}

.header-overlay {
  position: absolute;
  top: 40px;
  width: 100%;
  z-index: 20;
  pointer-events: none;
  text-align: center;
}

.main-title {
  font-size: 3rem;
  /* Utilisation de la couleur light pour le titre */
  color: var(--primary-light); 
}

.title-underline {
  width: 80px;
  height: 4px;
  /* Utilisation de la couleur base */
  background-color: var(--primary-base); 
  margin: 8px auto 0;
}

.status-container {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  /* Utilisation de base et dark pour le spinner */
  border: 4px solid var(--primary-dark);
  border-top-color: var(--primary-base);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.pulse-text {
  color: var(--primary-light);
  animation: pulse 2s infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

:deep(body) {
  margin: 0;
  overflow: hidden;
}
</style>