<script setup lang="ts">
import Button from '@/core/components/client/Button.vue'
import Input from '@/core/components/client/Input.vue'
import { AppColor } from "@/core/constants/app_colors";
import { AppImage } from "@/core/constants/app_images";
import { useToast } from "@/core/utils/useToast";
import { Failure } from '@/core/errors/failure';
import { VerifyOtpUseCase } from '../../application/usecases/verify_otp_usecase';
import { VerifyOtpRepositoryImpl } from '../../data/repositories/verify_otp_repository_impl';

const { showToast } = useToast();
const router = useRouter();
const route = useRoute();

const repository = new VerifyOtpRepositoryImpl();
const verifyOtpUseCase = new VerifyOtpUseCase(repository);

const email = computed(() => (route.query.email as string) || "");
const otpCode = ref("");
const isLoading = ref(false);

const initialTimer = 600; 
const timer = ref(initialTimer);
const canResend = ref(false);
let interval: any = null;

const startTimer = () => {
  canResend.value = false;
  timer.value = initialTimer;
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    if (timer.value > 0) timer.value--;
    else {
      canResend.value = true;
      clearInterval(interval);
    }
  }, 1000);
};

const formatTimer = computed(() => {
  const minutes = Math.floor(timer.value / 60);
  const seconds = timer.value % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
});

const handleVerify = async () => {
  if (otpCode.value.length < 6) {
    showToast("Veuillez entrer le code complet", "fi-rr-info", "error",);
    return;
  }

  isLoading.value = true;
  try {
    const result = await verifyOtpUseCase.execute({
      email: email.value,
      otp: otpCode.value
    });

    if (result instanceof Failure) {
      showToast(result.message, "fi-rr-cross-circle", "error",);
      isLoading.value = false;
    } else {
      showToast("Vérification réussie !", "fi-rr-check", "success",);
      setTimeout(() => {
        router.push("/auth/login");
        isLoading.value = false;
      }, 1500);
    }
  } catch (error) {
    isLoading.value = false;
    showToast("Erreur de connexion au serveur", "fi-rr-shield-exclamation", "error",);
  }
};

const handleResend = () => {
  if (!canResend.value) return;
  showToast("Un nouveau code a été envoyé", "fi-rr-refresh", "success", AppColor.primary.base);
  startTimer();
};

onMounted(() => {
  if (!email.value) {
    showToast("Email manquant, veuillez recommencer", "fi-rr-info", "error",);
    router.push("/auth/register");
  }
  startTimer();
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <div class="otp-page">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
      <span class="app-bar-title">Vérification</span>
      <div class="spacer"></div>
    </nav>

    <div class="auth-card">
      <div class="logo-container">
        <img :src="AppImage.Logo" alt="Logo" class="app-logo" />
      </div>

      <header class="header-content">
        <h2 class="title">Code de sécurité</h2>
        <p class="subtitle">
          Saisissez le code envoyé à l'adresse : <br />
          <strong :style="{ color: AppColor.primary.base }">{{ email }}</strong>
        </p>
      </header>

      <div class="form-group">
        <Input
          id="otp-code"
          label="Code de validation*"
          type="text"
          v-model="otpCode"
          icon="fi-rr-shield-check"
          placeholder="Ex: 755843"
          maxlength="6"
        />

        <div class="timer-container">
          <p v-if="!canResend" class="timer-text">
            Le code expire dans <span class="time">{{ formatTimer }}</span>
          </p>
          <button
            v-else
            @click="handleResend"
            class="resend-btn"
            :style="{ color: AppColor.primary.base }"
          >
            <i class="fi fi-rr-refresh"></i> Renvoyer le code
          </button>
        </div>
      </div>

      <Button label="Vérifier le code" :loading="isLoading" @click="handleVerify" />

      <div class="footer-link">
        <NuxtLink to="/auth/register" class="back-link">
          <i class="fi fi-rr-hand-back-point-left"></i>
          <span>Annuler et retourner</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* App Bar Style */
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
  width: 45px;
  height: 45px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-bar-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 17px;
  color: #2d3436;
}

.spacer { width: 45px; }

/* Page & Card Style */
.otp-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 85px 20px 40px 20px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 40px 30px;
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.logo-container {
  text-align: center;
  margin-bottom: 15px;
}

.app-logo {
  height: 70px;
  width: auto;
}

.header-content {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  font-size: 22px;
  font-weight: 800;
  color: #2d3436;
  margin-bottom: 8px;
}

.subtitle {
  color: #95a5a6;
  font-size: 14px;
  line-height: 1.5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.timer-container {
  display: flex;
  justify-content: center;
  min-height: 20px;
}

.timer-text {
  font-size: 13px;
  color: #999;
}

.time {
  font-weight: 700;
  color: #333;
}

.resend-btn {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-link {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #a0a0a0;
  text-decoration: none;
}

.back-link:hover {
  color: v-bind('AppColor.primary.base');
}

/* Responsive */
@media (max-width: 600px) {
  .otp-page {
    background-color: white;
    align-items: flex-start;
    padding: 85px 20px 20px 20px;
  }
  .auth-card {
    box-shadow: none;
    border-radius: 0;
    padding: 20px 0;
  }
}
</style>