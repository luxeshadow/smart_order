import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Level } from '../../domain/entities/level'

export const useLevelStore = defineStore('level', () => {
  const levels = ref<Level[]>([])      // Tous les niveaux dispo
  const myLevels = ref<Level[]>([])    // Niveaux activés par l'user

  function updateLevels(newLevels: Level[]) {
    if (JSON.stringify(levels.value) !== JSON.stringify(newLevels)) {
      levels.value = newLevels
    }
  }

  function updateMyLevels(newLevels: Level[]) {
    if (JSON.stringify(myLevels.value) !== JSON.stringify(newLevels)) {
      myLevels.value = newLevels
    }
  }

  return {
    levels,
    myLevels,
    updateLevels,
    updateMyLevels
  }
})