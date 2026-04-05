<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { askGemini } from '@/services/gemini/gemini';
import { AppColor } from '@/core/constants/app_colors';

const router = useRouter();
const userInput = ref('');
const isLoading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const messages = ref<Message[]>([
  { role: 'ai', text: 'Bonjour ! Je suis votre assistant Benoit. Comment puis-je vous aider avec vos niveaux ou vos gains aujourd\'hui ?' }
]);

const scrollToBottom = async () => {
  await nextTick();
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  });
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const userText = userInput.value;
  messages.value.push({ role: 'user', text: userText });
  userInput.value = '';
  isLoading.value = true;
  
  await scrollToBottom();

  try {
    const aiResponse = await askGemini(userText);
    messages.value.push({ role: 'ai', text: aiResponse });
  } catch (error) {
    messages.value.push({ role: 'ai', text: "Désolé, j'ai une petite panne de circuit. Réessayez ?" });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="ia-page">
    <div class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
      <span class="app-bar-title">Assistant IA</span>
      <div class="spacer"></div>
    </div>

    <div class="chat-wrapper">
      <div class="deposit-card chat-card">
        <div class="header-content">
           <div class="logo-container">
             <i class="fi fi-rr-ai-assistant ai-main-icon"></i>
           </div>
           <p class="subtitle">Expert en gestion de niveaux et profits</p>
        </div>

        <div class="chat-box">
          <TransitionGroup name="fade-slide">
            <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', msg.role]">
              <div class="bubble-content">
                {{ msg.text }}
              </div>
            </div>
          </TransitionGroup>
          
          <div v-if="isLoading" class="message-bubble ai">
            <div class="bubble-content timer-hint">
              Benoit réfléchit...
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <div class="input-wrapper">
        <input 
          v-model="userInput" 
          type="text" 
          placeholder="Écrivez ici..." 
          @keyup.enter="sendMessage"
        />
        <button class="send-btn" :disabled="isLoading || !userInput.trim()" @click="sendMessage">
          <i class="fi fi-rr-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- APP BAR --- */
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
  cursor: pointer;
}

.app-bar-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 17px;
  color: #2d3436;
}

.spacer { width: 45px; }

/* --- PAGE & LAYOUT --- */
.ia-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.chat-wrapper {
  padding: 85px 15px 110px 15px; /* Padding bas important pour l'input fixe */
  display: flex;
  justify-content: center;
}

.deposit-card {
  width: 100%;
  max-width: 450px;
  background: white;
  padding: 25px;
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
}

/* --- CHAT BOX & BUBBLES --- */
.header-content { text-align: center; margin-bottom: 25px; }
.ai-main-icon { 
  font-size: 45px; 
  color: v-bind('AppColor.primary.base'); 
}
.subtitle { color: #95a5a6; font-size: 13px; margin-top: 8px; }

.chat-box {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-bubble {
  max-width: 85%;
  display: flex;
}

.bubble-content {
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.user { align-self: flex-end; }
.user .bubble-content {
  background: v-bind('AppColor.primary.base');
  color: white;
  border-bottom-right-radius: 4px;
}

.ai { align-self: flex-start; }
.ai .bubble-content {
  background: #f1f2f6;
  color: #2d3436;
  border-bottom-left-radius: 4px;
}

/* --- INPUT AREA FIXÉ --- */
.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px 20px 25px 20px;
  border-top: 1px solid #f1f1f1;
  z-index: 1000;
  box-shadow: 0 -5px 15px rgba(0,0,0,0.02);
}

.input-wrapper {
  display: flex;
  gap: 12px;
  max-width: 450px;
  margin: 0 auto;
}

input {
  flex: 1;
  height: 52px;
  border: 1.5px solid #eee;
  border-radius: 16px;
  padding: 0 18px;
  outline: none;
  background: #f9f9f9;
  transition: all 0.2s;
}

input:focus {
  border-color: v-bind('AppColor.primary.base');
  background: white;
}

.send-btn {
  width: 52px;
  height: 52px;
  background: v-bind('AppColor.primary.base');
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:disabled {
  background: #bdc3c7;
  opacity: 0.6;
}

/* --- ANIMATIONS --- */
.timer-hint {
  font-size: 12px;
  color: #95a5a6;
  animation: fadePulse 1.5s infinite;
}

@keyframes fadePulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.fade-slide-enter-active {
  transition: all 0.3s ease-out;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 600px) {
  .chat-wrapper { padding: 75px 10px 100px 10px; }
  .deposit-card {
    border-radius: 25px;
    padding: 20px;
    box-shadow: none;
  }
  .input-area { padding: 10px 15px 25px 15px; }
}
</style>