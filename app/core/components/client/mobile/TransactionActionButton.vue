<script setup lang="ts">
import { storeToRefs } from "pinia";
import { AppColor } from "@/core/constants/app_colors";
import { useAuthStore } from "@/features/auth/presentation/stores/auth_store";
import { checkUserWallet } from "../../../utils/haveWallet";
import AuthAlert from "./AuthAlert.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { isAuthenticated, user } = storeToRefs(authStore); 

const showAlert = ref(false);
let timer: any = null;

const handleProtectedAction = async (path: string) => {

  if (!isAuthenticated.value) {
    triggerAlert();
    return;
  }

  // 2. Logique manuelle pour le retrait
  if (path.includes('withdrawal')) {
    const hasWallet = await checkUserWallet(String(user.value?.id));
    
    if (!hasWallet) {
      router.push('/transaction/wallet');
      return;
    }
  }

  router.push(path);
};

const triggerAlert = () => {
  if (timer) clearTimeout(timer);
  showAlert.value = true;
  timer = setTimeout(() => {
    showAlert.value = false;
  }, 5000);
};

watch(() => route.path, () => {
  showAlert.value = false;
  if (timer) clearTimeout(timer);
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <div class="actions-section">
    <AuthAlert :show="showAlert" @close="showAlert = false" />

    <div class="actions-container">
      <div @click="handleProtectedAction('/transaction/deposit')" class="action-btn">
        <i class="fi fi-rr-arrow-trend-up"></i>
        <span>Recharger</span>
      </div>

      <div @click="handleProtectedAction('/transaction/client-withdrawal')" class="action-btn">
        <i class="fi fi-rr-arrow-trend-down"></i>
        <span>Récupérer</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.actions-section {
  padding: 15px;
}

.actions-container {
  display: flex;
  gap: 12px;
  width: 100%;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border-radius: 20px;
  background-color: transparent;
  border: 1.5px solid v-bind("AppColor.primary.base");
  color: v-bind("AppColor.primary.base");
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: v-bind("AppColor.primary.base + '08'");
}
</style>