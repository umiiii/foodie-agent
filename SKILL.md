# Food Ordering Skill

Agent-driven food delivery. Browse real restaurants, select dishes, place orders, and pay — all via API.

## Prerequisites

Before starting, verify the agent wallet is ready:

```bash
"$HOME/.tempo/bin/tempo" wallet -t whoami
```

Expected: `ready: true` with a positive `balance.available`. If not ready:

1. Install: `curl -fsSL https://tempo.xyz/install | bash && "$HOME/.tempo/bin/tempoup"`
2. Login: `"$HOME/.tempo/bin/tempo" wallet login` (complete browser auth)
3. Fund if needed: `"$HOME/.tempo/bin/tempo" wallet fund`

**Do NOT proceed with ordering until the wallet shows `ready: true`.**

## Region Selection

Ask the user which region to order from. Only two regions are supported:

| Region | Base URL | Currency |
|--------|----------|----------|
| **SG** (Singapore) | `https://repo-wheat-theta-43.vercel.app` | SGD |
| **HK** (Hong Kong) | `https://repo-6riuigdr0-umiiiis-projects.vercel.app` | HKD |

Set `BASE_URL` accordingly for all subsequent API calls.

## Ordering Flow

### Step 1: Browse Restaurants

```
GET {BASE_URL}/api/restaurants
```

Returns `{ restaurants: Restaurant[] }`. Each restaurant has:
- `id` — vendor code (use this for all subsequent calls)
- `name`, `cuisine`, `rating`
- `deliveryFee`, `minimumOrderAmount`
- `isOpen` — only order from open restaurants
- `deliveryTime` — estimated delivery window

Filter restaurants based on user preferences (cuisine type, budget, etc.). Factor in `deliveryFee` and `minimumOrderAmount` when calculating budget.

### Step 2: View Menu

```
GET {BASE_URL}/api/restaurants/{id}
```

Returns `{ restaurant: Restaurant, menu: MenuItem[] }`. Each menu item has:
- `id` — format `{vendorCode}_{productId}` (use this to place orders)
- `name`, `description`, `price`, `category`
- `variations` — optional size/type options with different prices
- `toppings` — optional customization groups with `quantityMin`/`quantityMax`

When helping the user choose:
- Group items by `category` for readability
- Note items with variations (user may want a specific size)
- Calculate running total including delivery fee
- Respect the user's budget constraint

### Step 3: Place Order

```
POST {BASE_URL}/api/orders
Content-Type: application/json

{
  "restaurantId": "vendor_code",
  "items": [
    { "menuItemId": "vendorCode_productId", "quantity": 1 }
  ]
}
```

Returns `{ order: Order, payUrl: string }`. The order includes:
- `id` — order ID for payment and tracking
- `totalAmount` — final price to pay (includes delivery fee, scaled 0.001x for testing)
- `status` — starts as `"pending"`

**Validation rules:**
- All items must belong to the same restaurant
- `menuItemId` must be valid IDs from the menu response
- Quantity must be >= 1

### Step 4: Pay

Use the Tempo CLI to pay via HTTP 402:

```bash
"$HOME/.tempo/bin/tempo" request -t -X POST "{BASE_URL}/api/orders/{id}/pay"
```

On success returns: `{ success: true, message: "...", order: Order }` with `status: "paid"`.

**After payment succeeds, always show the order tracking URL to the user:**

```
Your order is confirmed! Track it here: {BASE_URL}/order/{id}
```

This allows the user to open the page in a browser and visually track order progress.

If payment fails:
- `E_PAYMENT` — insufficient balance or chain error; check `tempo wallet -t whoami`
- `E_NETWORK` — server config issue; retry or report

### Step 5: Track Order

```
GET {BASE_URL}/api/orders/{id}
```

Order status progresses automatically after payment:
- `pending` → `paid` (immediate) → `preparing` (~10s) → `delivering` (~30s) → `delivered` (~60s)

Poll every 10 seconds to report status updates to the user.

## Budget Calculation

When the user gives a budget, calculate like this:

```
available_for_food = budget - deliveryFee
```

Then select items where `sum(item.price * quantity) <= available_for_food`.

Note: Payment amounts are scaled to 0.001x of menu prices for testing. A $50 HKD order costs ~$0.05 USDC.e from the wallet.

## Error Handling

| HTTP Status | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | Proceed |
| 402 | Payment required | Tempo CLI handles this automatically |
| 404 | Not found | Restaurant or order doesn't exist |
| 400 | Bad request | Check item IDs and restaurant ID |

## Example Conversation

**User**: "Help me order some noodles in Hong Kong, budget HK$100"

**Agent flow**:
1. Check wallet: `tempo wallet -t whoami` → ready, $0.95 available
2. Set `BASE_URL` to HK endpoint
3. `GET /api/restaurants` → find noodle/Asian restaurants
4. Pick a restaurant, `GET /api/restaurants/{id}` → browse noodle items
5. Select items within HK$100 (minus delivery fee)
6. Present selection to user for confirmation
7. `POST /api/orders` → create order
8. `tempo request -t -X POST .../api/orders/{id}/pay` → pay
9. Poll `GET /api/orders/{id}` → report status updates

## OpenAPI Schema

Full API schema available at:
```
GET {BASE_URL}/api/openapi.json
```
