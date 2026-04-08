export async function GET() {
  const doc = {
    openapi: '3.1.0',
    info: {
      title: 'FoodSG Delivery API',
      version: '1.0.0',
      description:
        'Agent-driven food delivery API with MPP 402 payment. Browse restaurants, create orders, and pay via HTTP 402.',
    },
    servers: [{ url: '/' }],
    paths: {
      '/api/restaurants': {
        get: {
          summary: 'List all restaurants',
          operationId: 'listRestaurants',
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
          summary: 'Get restaurant detail and menu',
          operationId: 'getRestaurant',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'Restaurant with menu items',
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
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['restaurantId', 'items'],
                  properties: {
                    restaurantId: { type: 'string' },
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['menuItemId', 'quantity'],
                        properties: {
                          menuItemId: { type: 'string' },
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
            'This endpoint returns HTTP 402 with a Payment challenge. Use mppx client to auto-handle the 402 flow, or pay via the Tempo testnet.',
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
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            cuisine: { type: 'string' },
            rating: { type: 'number' },
            deliveryTime: { type: 'string' },
            deliveryFee: { type: 'number' },
            image: { type: 'string' },
          },
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            restaurantId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            image: { type: 'string' },
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
