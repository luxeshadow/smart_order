import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Level } from '../../domain/entities/level'

export const useLevelStore = defineStore('level', () => {
  const levels = ref<Level[]>([])

  function updateLevels(newLevels: Level[]) {
    if (JSON.stringify(levels.value) !== JSON.stringify(newLevels)) {
      levels.value = newLevels
    }
  }

  return {
    levels,
    updateLevels
  }
})