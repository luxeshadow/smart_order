import { defineStore } from 'pinia'
import type { OrderItem } from '../../domain/entities/order_item'

export const useOrderStore = defineStore('orders', {
  state: () => ({
    items: [] as OrderItem[],
    loading: false
  }),
  actions: {
    setItems(newItems: OrderItem[]) {
      const currentIds = this.items.map(i => i.id).join(',')
      const newIds = newItems.map(i => i.id).join(',')
      
      if (currentIds !== newIds) {
        this.items = newItems
      }
    }
  }
})