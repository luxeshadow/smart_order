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
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
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
    <header class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
      <span class="app-bar-title">Assistant</span>
      <div class="spacer"></div>
    </header>

    <main class="chat-wrapper" ref="chatContainer">
      <div class="chat-content">
        <div class="header-content">
           <div class="logo-container">
             <i class="fi fi-rr-ai-assistant ai-main-icon"></i>
           </div>
           <p class="subtitle">Expert en gestion de niveaux et profits</p>
        </div>

        <div class="messages-list">
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
    </main>

    <footer class="input-area">
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
    </footer>
  </div>
</template>

<style scoped>
/* --- STRUCTURE GLOBALE (Anti-Décalage Clavier) --- */
.ia-page {
  background-color: #f8f9fa;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Empêche la page entière de bouger */
}

/* --- APP BAR --- */
.app-bar {
  height: 65px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 15px;
  border-bottom: 1px solid #f1f1f1;
  flex-shrink: 0;
  z-index: 10;
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

/* --- ZONE DE CHAT (SCROLLABLE) --- */
.chat-wrapper {
  flex: 1;

  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  -webkit-overflow-scrolling: touch;
}

.chat-content {
  width: 100%;
  max-width: 450px;
  background: white;
  padding: 20px;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
  min-height: fit-content;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

/* --- BUBBLES --- */
.header-content { text-align: center; margin-bottom: 25px; }
.ai-main-icon { font-size: 45px; color: v-bind('AppColor.primary.base'); }
.subtitle { color: #95a5a6; font-size: 13px; margin-top: 8px; }

.message-bubble {
  max-width: 85%;
  display: flex;
}

.bubble-content {
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.4;
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

/* --- INPUT AREA (FIXÉ EN BAS) --- */
.input-area {
  background: white;
  padding: 15px 20px 30px 20px;
  border-top: 1px solid #f1f1f1;
  flex-shrink: 0;
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
  font-size: 16px; /* Évite le zoom auto sur iOS */
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
}

.send-btn:disabled { background: #bdc3c7; opacity: 0.6; }

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

.fade-slide-enter-active { transition: all 0.3s ease-out; }
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }

@media (max-width: 600px) {
  .chat-content {
    border-radius: 20px;
    padding: 15px;
    box-shadow: none;
    border: 1px solid #eee;
  }
  .input-area { padding-bottom: 20px; }
}
</style>