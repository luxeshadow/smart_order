<script setup lang="ts">
import { storeToRefs } from "pinia";
import { AppColor } from "@/core/constants/app_colors";
import { AppIcon } from "@/core/constants/app_icons";
import { useAuthStore } from "@/features/auth/presentation/stores/auth_store";

const router = useRouter();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore); 

const showAlert = ref(false);
let timer: any = null;

const handleProtectedAction = (path: string) => {
  if (!isAuthenticated.value) {
    triggerAlert();
  } else {
    router.push(path);
  }
};

const triggerAlert = () => {
  if (timer) clearTimeout(timer);
  showAlert.value = true;

  timer = setTimeout(() => {
    showAlert.value = false;
  }, 3000);
};

const closeAlert = () => {
  showAlert.value = false;
  if (timer) clearTimeout(timer);
};

// Nettoyage automatique du timer si on quitte la page
onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <div class="actions-section">
    <Transition name="drop">
      <div v-if="showAlert" class="auth-alert-container">
        <div class="alert-content">
          <button class="close-btn" @click="closeAlert" aria-label="Fermer">
            <i class="fi fi-rr-cross-small"></i>
          </button>

          <div class="alert-header">
            <i class="fi fi-rr-lock icon-lock"></i>
            <h3>Connexion requise</h3>
          </div>

          <p class="alert-text">
            Pour continuer, veuillez vous connecter ou vous inscrire.
          </p>

          <div class="alert-actions">
            <NuxtLink to="/auth/login" class="btn-auth login" @click="closeAlert">
              <i class="fi fi-rr-sign-in-alt"></i> Connexion
            </NuxtLink>

            <NuxtLink to="/auth/register" class="btn-auth register" @click="closeAlert">
              <i class="fi fi-rr-user-add"></i> Inscription
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>

    <div class="actions-container">
      <div @click="handleProtectedAction('/deposit')" class="action-btn">
        <i :class="AppIcon.add" class="icon add"></i>
        <span>Dépôt</span>
      </div>

      <div @click="handleProtectedAction('/withdraw')" class="action-btn">
        <i class="fi fi-rr-minus icon minus"></i>
        <span>Retrait</span>
      </div>
    </div>
  </div>
</template>

<style scoped>

.actions-section {
  padding: 15px;
  position: relative;
}

.auth-alert-container {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  justify-content: center;
}

.alert-content {
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 20px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.icon-lock {
  font-size: 20px;
  color: v-bind("AppColor.primary.base");
}

.alert-header h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}

.alert-text {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 12px 0 20px 0;
}

.alert-actions {
  display: flex;
  gap: 10px;
}

.btn-auth {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login {
  background-color: v-bind("AppColor.primary.base");
  color: white;
}

.register {
  background-color: #f5f5f5;
  color: #333;
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
  gap: 8px;
  padding: 14px;
  border-radius: 18px;
  background-color: transparent;
  border: 1.5px solid v-bind("AppColor.primary.base");
  color: v-bind("AppColor.primary.base");
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s;
}

.drop-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.drop-leave-active {
  transition: all 0.3s ease-in;
}
.drop-enter-from {
  transform: translateY(-150px);
  opacity: 0;
}
.drop-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
