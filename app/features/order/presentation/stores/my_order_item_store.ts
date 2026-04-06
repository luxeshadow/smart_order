import { defineStore } from 'pinia'
import type { OrderItem } from '../../domain/entities/order_item'

export const useOrderStore = defineStore('orders', {
  state: () => ({
    items: [] as OrderItem[],
    loading: false,
    currentIndex: 0
  }),
  actions: {
    setItems(newItems: OrderItem[]) {
        this.items = newItems;
    },
    setCurrentIndex(val: number) {
        this.currentIndex = val;
    }
  }
})