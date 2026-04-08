export async function GET() {
  const doc = {
    openapi: '3.1.0',
    info: {
      title: 'FoodSG Delivery API',
      version: '2.0.0',
      description: `Agent-driven food delivery API powered by real Foodpanda Singapore data with MPP 402 payment.

## Ordering Flow

1. **Discovery** — \`GET /api/restaurants\` to browse available restaurants
2. **Menu Browse** — \`GET /api/restaurants/{id}\` to view full menu with categories, variations, and customizations
3. **Cart Build** — \`POST /api/orders\` to create an order with selected items
4. **Checkout** — \`POST /api/orders/{id}/pay\` to pay (HTTP 402 MPP-gated)
5. **Track** — \`GET /api/orders/{id}\` to monitor order status

Data sourced from Foodpanda Singapore (Tanjong Pagar area). Restaurant listings always available; full menus require FOODPANDA_SESSION_TOKEN.`,
    },
    servers: [{ url: '/' }],
    paths: {
      '/api/restaurants': {
        get: {
          summary: 'List all restaurants',
          operationId: 'listRestaurants',
          description: 'Returns restaurants near Tanjong Pagar, Singapore from Foodpanda. Includes real-time availability, ratings, delivery fees, and estimated delivery times.',
          responses: {
            '200': {
              description: 'Array of restaurants',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RestaurantListResponse' },
                },
              },
            },
          },
        },
      },
      '/api/restaurants/{id}': {
        get: {
          summary: 'Get restaurant detail and full menu',
          operationId: 'getRestaurant',
          description: 'Returns restaurant details and complete menu with all categories, items, variations, and topping/customization options. Menu data requires FOODPANDA_SESSION_TOKEN env var.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Foodpanda vendor code (e.g., "cfuo")' },
          ],
          responses: {
            '200': {
              description: 'Restaurant with full menu',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RestaurantDetailResponse' },
                },
              },
            },
            '404': { description: 'Restaurant not found' },
          },
        },
      },
      '/api/orders': {
        post: {
          summary: 'Create a new order (pending payment)',
          operationId: 'createOrder',
          description: 'Creates an order from selected menu items. Returns the order with a payUrl for HTTP 402 payment.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['restaurantId', 'items'],
                  properties: {
                    restaurantId: { type: 'string', description: 'Foodpanda vendor code' },
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['menuItemId', 'quantity'],
                        properties: {
                          menuItemId: { type: 'string', description: 'Menu item ID in format {vendorCode}_{productId}' },
                          quantity: { type: 'integer', minimum: 1 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Order created with payUrl',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateOrderResponse' },
                },
              },
            },
          },
        },
      },
      '/api/orders/{id}': {
        get: {
          summary: 'Get order status',
          operationId: 'getOrder',
          description: 'Returns current order details and status. Poll this endpoint to track order progress through: pending → paid → preparing → delivering → delivered.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'Order details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/OrderResponse' },
                },
              },
            },
            '404': { description: 'Order not found' },
          },
        },
      },
      '/api/orders/{id}/pay': {
        post: {
          summary: 'Pay for an order (HTTP 402 MPP-gated)',
          operationId: 'payOrder',
          description:
            'This endpoint returns HTTP 402 with a payment challenge. Use mppx client to auto-handle the 402 flow, or pay via the Tempo testnet.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          'x-payment-info': {
            method: 'tempo',
            intent: 'charge',
            description: 'Dynamic amount based on order total (pathUSD on Tempo testnet)',
          },
          responses: {
            '200': {
              description: 'Payment confirmed, order updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PayOrderResponse' },
                },
              },
            },
            '402': {
              description: 'Payment required — includes WWW-Authenticate challenge header',
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Restaurant: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Foodpanda vendor code' },
            vendorCode: { type: 'string', description: 'Foodpanda vendor code' },
            name: { type: 'string' },
            description: { type: 'string' },
            cuisine: { type: 'string' },
            rating: { type: 'number' },
            deliveryTime: { type: 'string', example: '20-35 min' },
            deliveryFee: { type: 'number' },
            image: { type: 'string', format: 'uri' },
            heroImage: { type: 'string', format: 'uri' },
            minimumOrderAmount: { type: 'number' },
            isOpen: { type: 'boolean' },
          },
        },
        MenuItemVariation: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
          },
        },
        ToppingOption: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
          },
        },
        ToppingGroup: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            quantityMin: { type: 'integer' },
            quantityMax: { type: 'integer' },
            options: { type: 'array', items: { $ref: '#/components/schemas/ToppingOption' } },
          },
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Format: {vendorCode}_{productId}' },
            restaurantId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            image: { type: 'string', format: 'uri' },
            variations: { type: 'array', items: { $ref: '#/components/schemas/MenuItemVariation' } },
            toppings: { type: 'array', items: { $ref: '#/components/schemas/ToppingGroup' } },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            restaurantId: { type: 'string' },
            restaurantName: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'preparing', 'delivering', 'delivered'],
            },
            totalAmount: { type: 'number' },
            deliveryFee: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            paidAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            menuItemId: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            quantity: { type: 'integer' },
          },
        },
        RestaurantListResponse: {
          type: 'object',
          properties: {
            restaurants: { type: 'array', items: { $ref: '#/components/schemas/Restaurant' } },
          },
        },
        RestaurantDetailResponse: {
          type: 'object',
          properties: {
            restaurant: { $ref: '#/components/schemas/Restaurant' },
            menu: { type: 'array', items: { $ref: '#/components/schemas/MenuItem' } },
          },
        },
        CreateOrderResponse: {
          type: 'object',
          properties: {
            order: { $ref: '#/components/schemas/Order' },
            payUrl: { type: 'string' },
          },
        },
        OrderResponse: {
          type: 'object',
          properties: { order: { $ref: '#/components/schemas/Order' } },
        },
        PayOrderResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            order: { $ref: '#/components/schemas/Order' },
          },
        },
      },
    },
  }

  return Response.json(doc, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  })
}
