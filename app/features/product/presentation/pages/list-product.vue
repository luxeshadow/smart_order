<script setup lang="ts">
import { ListProductUseCase } from '../../application/usecases/list_product_usecase';
import { ListProductRepositoryImpl } from '../../data/repositories/list_product_repository_impl';
import { Failure } from '~/core/errors/failure';

const productImages = ref<string[]>([]);
const errorMsg = ref<string | null>(null);
const pending = ref(true);

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
        .filter((url): url is string => !!url && url !== '');
      
      if (productImages.value.length === 0) {
        productImages.value = ['https://via.placeholder.com/400'];
      }
    }
  } catch (e) {
    errorMsg.value = "Une erreur inattendue est survenue.";
  } finally {
    pending.value = false;
  }
});
</script>


<template>
  <div class="relative h-screen w-full bg-[#060010] overflow-hidden">
    
    <div class="absolute top-10 left-0 w-full z-10 pointer-events-none">
      <h1 class="text-center text-4xl md:text-6xl font-bold text-white tracking-tighter uppercase opacity-80">
        List Products
      </h1>
      <div class="w-20 h-1 bg-blue-500 mx-auto mt-2"></div>
    </div>

    <div v-if="pending" class="flex h-full items-center justify-center text-white">
      <span class="animate-pulse">Chargement des produits...</span>
    </div>

    <div v-else-if="errorMsg" class="flex h-full items-center justify-center text-red-500">
      {{ errorMsg }}
    </div>

    <BitsDomeGallery
      v-else
      :images="productImages"
      :fit="0.8"
      fit-basis="auto"
      :min-radius="600"
      :segments="34"
      :drag-sensitivity="20"
      :enlarge-transition-ms="300"
      :grayscale="false"
      overlay-blur-color="#060010"
      image-border-radius="20px"
      opened-image-width="300px"
      opened-image-height="400px"
    />
  </div>
</template>


<style scoped>
h1 {
  text-shadow: 0 10px 20px rgba(0,0,0,0.5);
}

:deep(body), :deep(#__nuxt) {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}
</style>