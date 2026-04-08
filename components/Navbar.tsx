'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const { itemCount } = useCart()

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-orange-600">
          FoodSG
        </Link>
        <Link
          href="/cart"
          className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 font-medium text-sm hover:bg-orange-100 transition"
        >
          Cart
          {itemCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-600 text-white text-xs font-bold">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}
