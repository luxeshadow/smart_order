import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePachinkoGameStore = defineStore('pachinko-game', () => {
  const isPlaying = ref(false)
  const lastWinningIndex = ref<number | null>(null)

  function startGame() {
    isPlaying.value = true
    lastWinningIndex.value = null
  }

  function finishGame(winningIndex: number) {
    lastWinningIndex.value = winningIndex
    isPlaying.value = false
  }

  return { isPlaying, lastWinningIndex, startGame, finishGame }
})
