import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Level } from '../../domain/entities/level'

export const useLevelStore = defineStore('level', () => {
  const levels = ref<Level[]>([])  
  const myLevels = ref<Level[]>([])    

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