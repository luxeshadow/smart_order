<script setup lang="ts">
import { ref, nextTick } from 'vue';
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
  { role: 'ai', text: 'Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider avec vos niveaux ou vos gains aujourd\'hui ?' }
]);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
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
           <h1 class="title">Gemini IA</h1>
           <p class="subtitle">Expert en gestion de niveaux et profits</p>
        </div>

        <div class="chat-box" ref="chatContainer">
          <TransitionGroup name="fade-slide">
            <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', msg.role]">
              <div class="bubble-content">
                {{ msg.text }}
              </div>
            </div>
          </TransitionGroup>
          
          <div v-if="isLoading" class="message-bubble ai">
            <div class="bubble-content timer-hint">
              L'IA analyse les données...
            </div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-wrapper">
            <input 
              v-model="userInput" 
              type="text" 
              placeholder="Posez votre question..." 
              @keyup.enter="sendMessage"
            />
            <button class="send-btn" :disabled="isLoading" @click="sendMessage">
              <i class="fi fi-rr-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Couleurs dynamiques basées sur ton AppColor */
.ai-main-icon {
  font-size: 50px;
  color: v-bind('AppColor.primary.base');
}

.user .bubble-content {
  background: v-bind('AppColor.primary.base');
  color: white;
  border-bottom-right-radius: 4px;
}

.send-btn {
  background: v-bind('AppColor.primary.base');
  color: white;
  /* ... le reste identique ... */
}

input:focus {
  border-color: v-bind('AppColor.primary.base');
}

/* Structure du Chat */
.chat-wrapper {
  padding: 85px 20px 20px 20px;
  display: flex;
  justify-content: center;
}

.chat-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.chat-box {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: none;
}

.chat-box::-webkit-scrollbar { display: none; }

.message-bubble {
  max-width: 80%;
  display: flex;
}

.bubble-content {
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.user { align-self: flex-end; }
.ai { align-self: flex-start; }
.ai .bubble-content {
  background: #f1f2f6;
  color: #2d3436;
  border-bottom-left-radius: 4px;
}

/* Input Area */
.input-area {
  padding-top: 15px;
  border-top: 1px solid #f8f9fa;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

input {
  flex: 1;
  height: 52px;
  border: 1.5px solid #eee;
  border-radius: 16px;
  padding: 0 18px;
  outline: none;
}

.send-btn {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:disabled { opacity: 0.5; }

/* Transitions */
.fade-slide-enter-active {
  transition: all 0.3s ease-out;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>