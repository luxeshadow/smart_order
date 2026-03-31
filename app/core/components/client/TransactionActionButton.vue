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

// Fonction pour fermer proprement le modal et rediriger
const goToAuth = (path: string) => {
  closeAlert();
  router.push(path);
};

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
  }, 4000); // Un peu plus long pour laisser le temps de lire
};

const closeAlert = () => {
  showAlert.value = false;
  if (timer) clearTimeout(timer);
};

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
            Pour continuer, veuillez vous connecter ou vous inscrire sur <strong>Smart Order</strong>.
          </p>

          <div class="alert-actions">
            <button class="btn-auth login" @click="goToAuth('/auth/login')">
              <i class="fi fi-rr-sign-in-alt"></i> Connexion
            </button>

            <button class="btn-auth register" @click="goToAuth('/auth/register')">
              <i class="fi fi-rr-user-add"></i> Inscription
            </button>
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
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid #f0f0f0;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px; /* Déplacé à droite pour plus d'ergonomie */
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #eeeeee;
}

.alert-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.icon-lock {
  font-size: 20px;
  color: v-bind("AppColor.primary.base");
}

.alert-header h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: #2d3436;
}

.alert-text {
  font-size: 14px;
  color: #636e72;
  text-align: center;
  margin: 15px 0 25px 0;
  line-height: 1.5;
}

.alert-actions {
  display: flex;
  gap: 12px;
}

.btn-auth {
  flex: 1;
  padding: 14px;
  border-radius: 16px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.btn-auth:active {
  transform: scale(0.96);
}

.login {
  background-color: v-bind("AppColor.primary.base");
  color: white;
}

.register {
  background-color: #f1f2f6;
  color: #2d3436;
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
  background-color: v-bind("AppColor.primary.base + '08'"); /* Effet hover léger */
}

.drop-enter-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.drop-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}
.drop-enter-from {
  transform: translateY(-120%);
  opacity: 0;
}
.drop-leave-to {
  transform: translateY(-50px);
  opacity: 0;
}
</style>