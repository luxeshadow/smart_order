<script setup lang="ts">
import Button from '@/core/components/client/Button.vue'
import Input from '@/core/components/client/Input.vue'
import { AppColor } from "@/core/constants/app_colors";
import { AppImage } from "@/core/constants/app_images";
import { useToast } from "../../../../core/utils/useToast";
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
  isLoading.value = true;
  try {

    const result = await verifyOtpUseCase.execute({
      email: email.value,
      otp: otpCode.value
    });

    if (result instanceof Failure) {
      showToast(result.message, "fi-rr-cross-circle", "error", "#ff4757");
      isLoading.value = false;
    } else {
      showToast("Vérification réussie !", "fi-rr-check", "success", "#2ecc71");
      
      setTimeout(() => {
        router.push("/auth/login");
        isLoading.value = false;
      }, 1500);
    }
  } catch (error) {
    isLoading.value = false;
    showToast("Erreur de connexion au serveur", "fi-rr-shield-exclamation", "error", "#ff4757");
  }
};

const handleResend = () => {
  if (!canResend.value) return;
  // Ici tu pourrais appeler un UseCase 'ResendOtp' si tu l'as créé
  showToast("Un nouveau code a été envoyé", "fi-rr-refresh", "success", AppColor.primary.base);
  startTimer();
};

onMounted(() => {
  if (!email.value) {
    showToast("Email manquant, veuillez recommencer", "fi-rr-info", "error", "#ff4757");
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
    <div class="auth-card">
      <div class="logo-container">
        <img :src="AppImage.Logo" alt="Logo" class="app-logo" />
      </div>

      <header class="header-content">
        <h2 class="title">Vérification</h2>
        <p class="subtitle">
          Un code de sécurité a été envoyé sur l'adresse : <br />
          <strong :style="{ color: AppColor.tertiary.base }">{{ email }}</strong>
        </p>
      </header>

      <div class="form-group">
        <Input
          id="otp-code"
          label="Code de validation"
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
/* Conserve tes styles actuels, ils sont déjà très propres */
.otp-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 10px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px 30px;
  border-radius: 28px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.app-logo {
  height: 80px;
  width: auto;
}
.title {
  font-size: 23px;
  font-weight: 800;
  color: v-bind("AppColor.tertiary.base");
  margin-bottom: 8px;
}
.subtitle {
  color: #666;
  font-size: 14px;
  margin-bottom: 25px;
  text-align: center;
  line-height: 1.6;
}
.form-group {
  width: 100%;
  margin-bottom: 20px;
}
.timer-container {
  margin-top: 15px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.timer-text {
  font-size: 13px;
  color: #999;
  font-weight: 500;
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
  margin-top: 30px;
}
.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #a0a0a0;
  text-decoration: none;
  transition: all 0.3s ease;
}
.back-link:hover {
  color: v-bind("AppColor.primary.base");
}
</style>