import { create } from 'zustand'
import type { SyncedProduct } from './odoo/product-sync'

interface CartItem {
  product: SyncedProduct
  quantity: number
  sqFeet: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: SyncedProduct, sqFeet: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (product, sqFeet) => {
    const items = get().items
    const existingItem = items.find(item => item.product.id === product.id)
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.product.id === product.id
            ? { ...item, sqFeet: item.sqFeet + sqFeet }
            : item
        ),
      })
    } else {
      set({ items: [...items, { product, quantity: 1, sqFeet }] })
    }
  },
  
  removeItem: (productId) => {
    set({ items: get().items.filter(item => item.product.id !== productId) })
  },
  
  updateQuantity: (productId, quantity) => {
    set({
      items: get().items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    })
  },
  
  clearCart: () => {
    set({ items: [] })
  },
  
  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.product.pricePerSqFt * item.sqFeet,
      0
    )
  },
  
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0)
  },
}))
