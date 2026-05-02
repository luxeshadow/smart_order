<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { askGemini } from '~/services/ai/gemini/gemini'
import { AppColor } from '@/core/constants/app_colors'

const router = useRouter()

const userInput = ref('')
const isLoading = ref(false)

const chatContainer = ref<HTMLElement | null>(null)

interface Message {
  role: 'user' | 'ai'
  text: string
}

const messages = ref<Message[]>([
  {
    role: 'ai',
    text: 'Bonjour ! Je suis votre assistant Roger. Comment puis-je vous aider avec vos niveaux ou vos gains aujourd’hui ?'
  }
])

const scrollToBottom = async () => {

  await nextTick()

  if (chatContainer.value) {

    chatContainer.value.scrollTop =
      chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {

  if (!userInput.value.trim() || isLoading.value) return

  const userText = userInput.value

  messages.value.push({
    role: 'user',
    text: userText
  })

  userInput.value = ''

  isLoading.value = true

  await scrollToBottom()

  try {

    const aiResponse = await askGemini(userText)

    messages.value.push({
      role: 'ai',
      text: aiResponse
    })

  } catch {

    messages.value.push({
      role: 'ai',
      text: "Désolé, j'ai une petite panne de circuit. Réessayez ?"
    })

  } finally {

    isLoading.value = false

    await scrollToBottom()
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="ia-page">

    <!-- APP BAR -->
    <header class="app-bar">

      <button
        class="back-btn"
        @click="router.back()"
      >
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>

      <span class="app-bar-title">
        Assistant
      </span>

      <div class="spacer"></div>

    </header>

    <!-- CHAT -->
    <main
      ref="chatContainer"
      class="chat-wrapper"
    >

      <div class="chat-content">

        <div class="header-content">

          <i class="fi fi-rr-ai-assistant ai-main-icon"></i>

          <p class="subtitle">
            Expert en gestion de niveaux et profits
          </p>

        </div>

        <div class="messages-list">

          <TransitionGroup name="fade-slide">

            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message-bubble', msg.role]"
            >

              <div class="bubble-content">
                {{ msg.text }}
              </div>

            </div>

          </TransitionGroup>

          <div
            v-if="isLoading"
            class="message-bubble ai"
          >

            <div class="bubble-content timer-hint">
              Roger écrit...
            </div>

          </div>

        </div>

      </div>

    </main>

    <!-- INPUT -->
    <footer class="input-area">

      <div class="input-wrapper">

        <input
          v-model="userInput"
          type="text"
          placeholder="Écrivez ici..."
          @keyup.enter="sendMessage"
        />

        <button
          class="send-btn"
          :disabled="isLoading || !userInput.trim()"
          @click="sendMessage"
        >
          <i class="fi fi-rr-paper-plane"></i>
        </button>

      </div>

    </footer>

  </div>
</template>

<style scoped>
.ia-page {

  height: 100svh;

  display: flex;

  flex-direction: column;

  overflow: hidden;

  background: #f8f9fa;
}

/* APP BAR */
.app-bar {

  height: 65px;

  flex-shrink: 0;

  background: white;

  display: flex;

  align-items: center;

  padding: 0 15px;

  border-bottom: 1px solid #f1f1f1;

  z-index: 20;
}

.back-btn {

  width: 45px;

  height: 45px;

  border: 1px solid #eee;

  background: #f8f9fa;

  border-radius: 14px;

  display: flex;

  justify-content: center;

  align-items: center;
}

.app-bar-title {

  flex: 1;

  text-align: center;

  font-size: 17px;

  font-weight: 700;
}

.spacer {
  width: 45px;
}

/* CHAT */
.chat-wrapper {

  flex: 1;

  overflow-y: auto;

  -webkit-overflow-scrolling: touch;

  padding: 16px;
}

.chat-content {

  width: 100%;

  max-width: 500px;

  margin: 0 auto;

  min-height: 100%;
}

/* HEADER IA */
.header-content {

  text-align: center;

  margin-bottom: 24px;
}

.ai-main-icon {

  font-size: 42px;

  color: v-bind('AppColor.primary.base');
}

.subtitle {

  margin-top: 8px;

  font-size: 13px;

  color: #95a5a6;
}

/* MESSAGES */
.messages-list {

  display: flex;

  flex-direction: column;

  gap: 14px;

  padding-bottom: 10px;
}

.message-bubble {

  display: flex;

  width: 100%;
}

.user {
  justify-content: flex-end;
}

.ai {
  justify-content: flex-start;
}

.bubble-content {

  max-width: 82%;

  padding: 13px 16px;

  border-radius: 18px;

  font-size: 14px;

  line-height: 1.5;

  word-break: break-word;
}

.user .bubble-content {

  background: v-bind('AppColor.primary.base');

  color: white;

  border-bottom-right-radius: 4px;
}

.ai .bubble-content {

  background: white;

  color: #2d3436;

  border: 1px solid #ececec;

  border-bottom-left-radius: 4px;
}

/* INPUT */
.input-area {

  flex-shrink: 0;

  background: white;

  border-top: 1px solid #eee;

  padding:
    12px
    16px
    calc(env(safe-area-inset-bottom) + 12px);
}

.input-wrapper {

  max-width: 500px;

  margin: 0 auto;

  display: flex;

  gap: 10px;
}

input {

  flex: 1;

  height: 52px;

  border: 1px solid #e5e5e5;

  border-radius: 16px;

  padding: 0 16px;

  outline: none;

  font-size: 16px;

  background: #f9f9f9;
}

input:focus {

  border-color: v-bind('AppColor.primary.base');

  background: white;
}

.send-btn {

  width: 52px;

  height: 52px;

  border: none;

  border-radius: 16px;

  background: v-bind('AppColor.primary.base');

  color: white;

  display: flex;

  align-items: center;

  justify-content: center;
}

.send-btn:disabled {

  opacity: 0.6;

  background: #bdc3c7;
}

/* LOADING */
.timer-hint {

  font-size: 13px;

  color: #95a5a6;

  animation: fadePulse 1.5s infinite;
}

@keyframes fadePulse {

  0%, 100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

/* ANIMATIONS */
.fade-slide-enter-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {

  opacity: 0;

  transform: translateY(10px);
}

/* MOBILE */
@media (max-width: 600px) {

  .chat-wrapper {
    padding: 12px;
  }

  .bubble-content {

    max-width: 88%;

    font-size: 13px;
  }
}
</style>