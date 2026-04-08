'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { MenuItem, Restaurant } from '@/lib/types'

interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
}

interface CartState {
  restaurantId: string | null
  restaurantName: string | null
  deliveryFee: number
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD_ITEM'; menuItem: MenuItem; restaurant: Restaurant }
  | { type: 'REMOVE_ITEM'; menuItemId: string }
  | { type: 'SET_QUANTITY'; menuItemId: string; quantity: number }
  | { type: 'CLEAR' }

const initialState: CartState = {
  restaurantId: null,
  restaurantName: null,
  deliveryFee: 0,
  items: [],
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // If switching restaurant, clear the cart first
      if (state.restaurantId && state.restaurantId !== action.restaurant.id) {
        return {
          restaurantId: action.restaurant.id,
          restaurantName: action.restaurant.name,
          deliveryFee: action.restaurant.deliveryFee,
          items: [
            {
              menuItemId: action.menuItem.id,
              name: action.menuItem.name,
              price: action.menuItem.price,
              quantity: 1,
            },
          ],
        }
      }

      const existing = state.items.find((i) => i.menuItemId === action.menuItem.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.menuItemId === action.menuItem.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        }
      }

      return {
        ...state,
        restaurantId: action.restaurant.id,
        restaurantName: action.restaurant.name,
        deliveryFee: action.restaurant.deliveryFee,
        items: [
          ...state.items,
          {
            menuItemId: action.menuItem.id,
            name: action.menuItem.name,
            price: action.menuItem.price,
            quantity: 1,
          },
        ],
      }
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.menuItemId !== action.menuItemId)
      if (items.length === 0) return initialState
      return { ...state, items }
    }
    case 'SET_QUANTITY': {
      if (action.quantity <= 0) {
        const items = state.items.filter((i) => i.menuItemId !== action.menuItemId)
        if (items.length === 0) return initialState
        return { ...state, items }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.menuItemId === action.menuItemId
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      }
    }
    case 'CLEAR':
      return initialState
  }
}

interface CartContextValue {
  state: CartState
  addItem: (menuItem: MenuItem, restaurant: Restaurant) => void
  removeItem: (menuItemId: string) => void
  setQuantity: (menuItemId: string, quantity: number) => void
  clear: () => void
  itemCount: number
  subtotal: number
  total: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const total = Math.round((subtotal + state.deliveryFee) * 100) / 100

  return (
    <CartContext
      value={{
        state,
        addItem: (menuItem, restaurant) =>
          dispatch({ type: 'ADD_ITEM', menuItem, restaurant }),
        removeItem: (menuItemId) =>
          dispatch({ type: 'REMOVE_ITEM', menuItemId }),
        setQuantity: (menuItemId, quantity) =>
          dispatch({ type: 'SET_QUANTITY', menuItemId, quantity }),
        clear: () => dispatch({ type: 'CLEAR' }),
        itemCount,
        subtotal,
        total,
      }}
    >
      {children}
    </CartContext>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
