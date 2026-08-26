# Wishlist API — Frontend Integration Guide

## Schema Overview

When a user adds a product to their wishlist, the backend creates a **Wishlist document** (one per user). Each item in the wishlist stores:

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | The **item ID** — use this to remove a specific item |
| `product` | Populated Object | The full product data (name, slug, price, etc.) |
| `priceAtTimeOfWishlisting` | Number | Price snapshot when the item was added |
| `addedAt` | Date | When it was wishlisted |

---

## API Endpoints

Base path: `/api/wishlist`  
All endpoints require the user to be **logged in** (cookie-based auth).

---

### `GET /api/wishlist/ids`

> **Call this once on login.** Returns only the array of wishlisted product IDs. Use this to drive heart-icon state across the entire app without extra requests.

**Response**
```json
{
  "success": true,
  "message": "Wishlisted product IDs fetched successfully",
  "payload": {
    "wishlistedIds": ["64a1b2c3...", "64d4e5f6..."]
  }
}
```

**Frontend usage**
```js
// On login / app load
const { wishlistedIds } = response.payload;
store.dispatch(setWishlistIds(wishlistedIds)); // Redux / Zustand / Context

// On any product card — no extra HTTP call needed
const isWishlisted = wishlistedIds.includes(product._id);
```

---

### `GET /api/wishlist/`

> Use this for the **Wishlist page**. Returns full wishlist with all product details populated.

**Response**
```json
{
  "success": true,
  "message": "Wishlist fetched successfully",
  "payload": {
    "wishlist": {
      "_id": "...",
      "user": "...",
      "items": [
        {
          "_id": "item_id_here",
          "product": {
            "_id": "64a1b2c3...",
            "name": "Classic White Tee",
            "slug": "classic-white-tee",
            "price": 499,
            "thumbnailImage": "https://...",
            "ratings": 4.3,
            "reviewCount": 120,
            "isActive": true
          },
          "priceAtTimeOfWishlisting": 499,
          "addedAt": "2026-08-26T10:00:00.000Z"
        }
      ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

> **Note:** If the user has no wishlist yet, `payload.wishlist` will be `null`.

---

### `POST /api/wishlist/add`

> Add a product to the wishlist.

**Request Body**
```json
{
  "productId": "64a1b2c3d4e5f6789..."
}
```

**Success Response** — `201`
```json
{
  "success": true,
  "message": "Product added to wishlist",
  "payload": { "wishlist": { ...fullWishlistObject } }
}
```

**Error Cases**
| Status | Reason |
|---|---|
| `404` | Product not found |
| `400` | Product is currently unavailable (inactive) |
| `409` | Product is already in your wishlist |

**Frontend usage**
```js
// After a successful add, also push the ID into local wishlistedIds state
store.dispatch(addWishlistId(productId));
```

---

### `DELETE /api/wishlist/remove`

> Remove a **single item** from the wishlist. Use the item's `_id` (not the product ID).

**Request Body**
```json
{
  "itemId": "item_id_from_wishlist_items_array"
}
```

**Success Response** — `200` — returns updated wishlist (populated)

**Error Cases**
| Status | Reason |
|---|---|
| `404` | Wishlist not found |
| `404` | Item not found in wishlist |

**Frontend usage**
```js
// After a successful remove, also remove from local wishlistedIds state
store.dispatch(removeWishlistId(productId));
```

---

### `DELETE /api/wishlist/clear`

> Remove **all items** from the wishlist.

**No request body needed.**

**Success Response** — `200`
```json
{
  "success": true,
  "message": "Wishlist cleared successfully",
  "payload": { "wishlist": { "items": [] } }
}
```

---

## Recommended Frontend State Flow

```
App starts / user logs in
        │
        ▼
GET /api/wishlist/ids  ──►  store wishlistedIds[] in global state
        │
        ▼
Product cards rendered
        │
        ├── isWishlisted = wishlistedIds.includes(product._id)   [no HTTP request]
        │
        ▼
User clicks heart icon
        │
        ├── if NOT wishlisted ──► POST /api/wishlist/add  ──► push ID to local state
        └── if wishlisted     ──► DELETE /api/wishlist/remove  ──► remove ID from local state
                                  (need itemId — get it from GET /api/wishlist/ on wishlist page)

Wishlist page loads
        │
        ▼
GET /api/wishlist/  ──►  render full product cards with item._id stored per card
```

---

## Price-Drop Indicator (Future)

Each item stores `priceAtTimeOfWishlisting`. You can use this to show a price-drop badge on the wishlist page:

```js
const hasPriceDropped = item.product.price < item.priceAtTimeOfWishlisting;
const savings = item.priceAtTimeOfWishlisting - item.product.price;

// Show: "Price dropped by ৳{savings}!" badge
```

---

## Quick Reference

| Action | Method | Endpoint | Body |
|---|---|---|---|
| Get heart-icon state (on login) | `GET` | `/api/wishlist/ids` | — |
| Get full wishlist (wishlist page) | `GET` | `/api/wishlist/` | — |
| Add to wishlist | `POST` | `/api/wishlist/add` | `{ productId }` |
| Remove one item | `DELETE` | `/api/wishlist/remove` | `{ itemId }` |
| Clear all | `DELETE` | `/api/wishlist/clear` | — |

---

## Verification Checklist

Run through these **after the frontend pages are built**, in order. One pass covers both frontend and backend.

### Wishlist Core

- [ ] **Add to wishlist** — click heart on a product → `POST /api/wishlist/add` fires → heart turns filled, item appears in wishlist page
- [ ] **Duplicate guard** — click heart on same product again (or call add directly) → `409 Already in wishlist` error, no duplicate item created
- [ ] **Get full wishlist** — navigate to Wishlist page → `GET /api/wishlist/` returns items with `name`, `price`, `thumbnailImage`, `slug`, `ratings` all populated
- [ ] **`priceAtTimeOfWishlisting`** — check the response; value should match the product's price at the time of adding
- [ ] **Get IDs (heart-icon state)** — on login/refresh → `GET /api/wishlist/ids` returns `{ wishlistedIds: ["..."] }` with only IDs, no product data
- [ ] **Heart icon pre-filled** — after login, previously wishlisted product cards should show a filled heart immediately (driven from `wishlistedIds` local state, no extra request)

### Remove & Clear

- [ ] **Remove single item** — click remove/heart on wishlist page → `DELETE /api/wishlist/remove` with `itemId` → item disappears, rest of wishlist intact
- [ ] **Clear all** — click "Clear wishlist" button → `DELETE /api/wishlist/clear` → wishlist page shows empty state, `items: []` in response

### Auth & User Isolation

- [ ] **Login/auth response unaffected** — login response and `GET /api/users/:id` no longer contain a `wishlist` field (removed from user schema)
- [ ] **User isolation** — User A's wishlist is not visible to User B (each request scoped to `req.user._id`)
- [ ] **Unauthenticated access blocked** — calling any `/api/wishlist/*` route without a cookie → `401 You are not logged in`

### Edge Cases

- [ ] **Empty wishlist** — new user with no wishlist → `GET /api/wishlist/` returns `payload.wishlist: null`, UI shows empty state without crashing
- [ ] **Inactive product** — try to wishlist a product that has been deactivated → `400 This product is currently unavailable`
- [ ] **Invalid IDs** — send a non-MongoId as `productId` or `itemId` → `422` validation error from `express-validator`
