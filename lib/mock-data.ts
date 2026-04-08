import type { Restaurant, MenuItem } from './types'

export const restaurants: Restaurant[] = [
  {
    id: 'rest_1',
    name: 'Hainanese Delights',
    description: 'Authentic Singaporean hawker favourites, from silky chicken rice to fiery laksa.',
    cuisine: 'Singaporean',
    rating: 4.7,
    deliveryTime: '25-35 min',
    deliveryFee: 2.5,
    image: '/food/sg.jpg',
  },
  {
    id: 'rest_2',
    name: 'Tokyo Ramen House',
    description: 'Rich, slow-simmered broths and handmade noodles straight from Tokyo.',
    cuisine: 'Japanese',
    rating: 4.5,
    deliveryTime: '30-40 min',
    deliveryFee: 3.0,
    image: '/food/jp.jpg',
  },
  {
    id: 'rest_3',
    name: 'Spice Route',
    description: 'Bold North Indian flavours — tandoori, curries, and freshly baked naan.',
    cuisine: 'Indian',
    rating: 4.6,
    deliveryTime: '35-45 min',
    deliveryFee: 2.0,
    image: '/food/in.jpg',
  },
  {
    id: 'rest_4',
    name: 'The Burger Joint',
    description: 'Juicy smash burgers, loaded fries, and thick hand-spun milkshakes.',
    cuisine: 'Western',
    rating: 4.3,
    deliveryTime: '20-30 min',
    deliveryFee: 3.5,
    image: '/food/us.jpg',
  },
  {
    id: 'rest_5',
    name: 'Bangkok Street',
    description: 'Vibrant Thai street food — wok-fired noodles, fragrant curries, and more.',
    cuisine: 'Thai',
    rating: 4.4,
    deliveryTime: '30-40 min',
    deliveryFee: 2.5,
    image: '/food/th.jpg',
  },
]

export const menuItems: MenuItem[] = [
  // ── Hainanese Delights ──
  { id: 'item_1_1', restaurantId: 'rest_1', name: 'Hainanese Chicken Rice', description: 'Poached chicken with fragrant rice, chili & ginger sauce', price: 5.5, category: 'Mains', image: '' },
  { id: 'item_1_2', restaurantId: 'rest_1', name: 'Laksa', description: 'Spicy coconut curry noodle soup with prawns', price: 6.5, category: 'Mains', image: '' },
  { id: 'item_1_3', restaurantId: 'rest_1', name: 'Char Kway Teow', description: 'Stir-fried flat rice noodles with cockles and Chinese sausage', price: 6.0, category: 'Mains', image: '' },
  { id: 'item_1_4', restaurantId: 'rest_1', name: 'Nasi Lemak', description: 'Coconut rice with sambal, fried chicken, egg, and ikan bilis', price: 5.0, category: 'Mains', image: '' },
  { id: 'item_1_5', restaurantId: 'rest_1', name: 'Kaya Toast Set', description: 'Toasted bread with kaya jam, soft-boiled eggs, and kopi', price: 3.5, category: 'Snacks', image: '' },
  { id: 'item_1_6', restaurantId: 'rest_1', name: 'Chili Crab', description: 'Whole crab in sweet-spicy tomato chili sauce with mantou', price: 28.0, category: 'Specials', image: '' },

  // ── Tokyo Ramen House ──
  { id: 'item_2_1', restaurantId: 'rest_2', name: 'Tonkotsu Ramen', description: 'Rich pork bone broth with chashu, ajitama egg, and nori', price: 14.0, category: 'Ramen', image: '' },
  { id: 'item_2_2', restaurantId: 'rest_2', name: 'Gyoza (6 pcs)', description: 'Pan-fried pork and cabbage dumplings', price: 7.0, category: 'Sides', image: '' },
  { id: 'item_2_3', restaurantId: 'rest_2', name: 'Katsu Curry Rice', description: 'Crispy chicken cutlet with Japanese curry and steamed rice', price: 13.0, category: 'Mains', image: '' },
  { id: 'item_2_4', restaurantId: 'rest_2', name: 'Salmon Sashimi (8 pcs)', description: 'Fresh Atlantic salmon slices', price: 12.0, category: 'Sashimi', image: '' },
  { id: 'item_2_5', restaurantId: 'rest_2', name: 'Edamame', description: 'Steamed soybeans with sea salt', price: 4.5, category: 'Sides', image: '' },

  // ── Spice Route ──
  { id: 'item_3_1', restaurantId: 'rest_3', name: 'Butter Chicken', description: 'Tender chicken in creamy tomato-butter sauce', price: 13.5, category: 'Curries', image: '' },
  { id: 'item_3_2', restaurantId: 'rest_3', name: 'Garlic Naan', description: 'Freshly baked naan brushed with garlic butter', price: 3.5, category: 'Breads', image: '' },
  { id: 'item_3_3', restaurantId: 'rest_3', name: 'Chicken Biryani', description: 'Fragrant basmati rice layered with spiced chicken', price: 14.0, category: 'Rice', image: '' },
  { id: 'item_3_4', restaurantId: 'rest_3', name: 'Palak Paneer', description: 'Cottage cheese cubes in a creamy spinach gravy', price: 12.0, category: 'Curries', image: '' },
  { id: 'item_3_5', restaurantId: 'rest_3', name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes and peas', price: 5.0, category: 'Snacks', image: '' },
  { id: 'item_3_6', restaurantId: 'rest_3', name: 'Mango Lassi', description: 'Sweet yogurt drink blended with Alphonso mango', price: 4.5, category: 'Drinks', image: '' },

  // ── The Burger Joint ──
  { id: 'item_4_1', restaurantId: 'rest_4', name: 'Classic Smash Burger', description: 'Double beef patty, American cheese, pickles, special sauce', price: 12.5, category: 'Burgers', image: '' },
  { id: 'item_4_2', restaurantId: 'rest_4', name: 'Loaded Cheese Fries', description: 'Crispy fries topped with cheddar sauce and bacon bits', price: 7.5, category: 'Sides', image: '' },
  { id: 'item_4_3', restaurantId: 'rest_4', name: 'Caesar Salad', description: 'Romaine lettuce, croutons, parmesan, house caesar dressing', price: 8.0, category: 'Salads', image: '' },
  { id: 'item_4_4', restaurantId: 'rest_4', name: 'BBQ Chicken Wings (8 pcs)', description: 'Smoky BBQ glazed wings with ranch dip', price: 10.0, category: 'Sides', image: '' },
  { id: 'item_4_5', restaurantId: 'rest_4', name: 'Chocolate Milkshake', description: 'Thick hand-spun milkshake with Belgian chocolate', price: 6.5, category: 'Drinks', image: '' },

  // ── Bangkok Street ──
  { id: 'item_5_1', restaurantId: 'rest_5', name: 'Pad Thai', description: 'Stir-fried rice noodles with prawns, peanuts, and lime', price: 11.0, category: 'Noodles', image: '' },
  { id: 'item_5_2', restaurantId: 'rest_5', name: 'Green Curry with Rice', description: 'Aromatic green curry with Thai basil and jasmine rice', price: 12.5, category: 'Curries', image: '' },
  { id: 'item_5_3', restaurantId: 'rest_5', name: 'Tom Yum Goong', description: 'Hot and sour prawn soup with lemongrass and galangal', price: 9.0, category: 'Soups', image: '' },
  { id: 'item_5_4', restaurantId: 'rest_5', name: 'Mango Sticky Rice', description: 'Sweet glutinous rice with fresh mango and coconut cream', price: 6.0, category: 'Desserts', image: '' },
  { id: 'item_5_5', restaurantId: 'rest_5', name: 'Thai Iced Tea', description: 'Strong Thai tea with condensed milk over ice', price: 4.0, category: 'Drinks', image: '' },
]

export function getAllRestaurants(): Restaurant[] {
  return restaurants
}

export function getRestaurant(id: string): Restaurant | undefined {
  return restaurants.find((r) => r.id === id)
}

export function getMenuItems(restaurantId: string): MenuItem[] {
  return menuItems.filter((item) => item.restaurantId === restaurantId)
}

export function getMenuItem(id: string): MenuItem | undefined {
  return menuItems.find((item) => item.id === id)
}
