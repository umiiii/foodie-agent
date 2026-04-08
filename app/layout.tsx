import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'FoodSG - Agent-Driven Food Delivery',
  description: 'Order food from local restaurants, powered by real Foodpanda data and MPP 402 payments.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <CartProvider>
          <Navbar />
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  )
}
