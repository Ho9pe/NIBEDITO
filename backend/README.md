# Nibedito Backend — API Reference

Express + MongoDB API for the Nibedito store. This file documents the endpoints.

**Setup, environment variables, scripts and deployment live in the
[root README](../README.md)** — including the pre-production checklist. Nothing
here duplicates them, so they cannot drift apart.

Quick reminders that bite most often:

- Every route is mounted under `/api`. The bare root path returns 404 by design;
  use `GET /health` to check the server is up.
- `NODE_ENV` must be exactly `production` in a deployment or auth cookies go out
  `SameSite=Strict` and no browser will send them cross-site.
- `morgan` is required at runtime but sits in `devDependencies`, so install with
  dev dependencies included.

## Conventions

Responses share one envelope, from `controllers/responseController.js`:

```json
{ "success": true, "statusCode": 200, "message": "...", "payload": { } }
```

Errors use the same shape with `success: false` and no payload.

Authentication is a JWT in an httpOnly cookie — `accessToken`, 15 minutes,
refreshed from `refreshToken`, 7 days. No bearer tokens: the `token` field some
older notes mention is not returned in the body.

Field rules — password, name, phone — come from
`src/constants/validationRules.js`, mirrored in
`frontend/src/utils/validation.ts`. Change both together.

Logging goes through `src/helper/logger.js`. `debug` is silent unless
`NODE_ENV` is `development`; `info`, `warn` and `error` always print. Never log
credentials, tokens or reset links at any level.

## Implementation Overview

### Core Setup
- Express server with middleware configuration
- MongoDB database connection
- MVC architecture implementation
- Error handling middleware
- Rate limiting and security features
- CORS configuration

### Authentication System
- JWT-based authentication
- Cookie-based token management
- Password hashing using bcrypt
- Email verification system
- Password reset functionality

### User Management
- User registration with email/phone verification
- User profile management
- Profile picture upload using Cloudinary
- User banning system

### Admin System
- Admin authentication
- User management capabilities
- Admin role management (admin/superadmin)
- User banning/unbanning functionality

### Category Management
- Create new categories (Admin only)
- List all categories
- Get category by slug
- Update category details (Admin only)
- Delete category (Admin only)
- Category image upload using Cloudinary

### Product Management
- Create new products with variants (Admin only)
- List all products with pagination
- Get product by slug
- Update product details (Admin only)
- Delete product (Admin only)
- Multiple product images upload using Cloudinary
- Product variant management
- Stock management

### Cart Management
- Add items to cart
- View cart contents
- Update cart item quantities
- Remove items from cart
- Clear entire cart
- Stock validation
- Price calculations

## API Endpoints

### Health (`/health`)

Outside `/api`, and the only route there.

| Method | Endpoint | Description | Response | Access |
|--------|----------|-------------|----------|--------|
| GET | `/health` | Liveness probe. Always 200 while the process can serve requests; database state is reported in the body rather than as a failing status, so a transient outage does not make the host restart a healthy server. Set this as the platform's health check path. | `{ success, status, database: 'connected'\|'connecting'\|'disconnected'\|'disconnecting', uptime, environment, authCookieMode }` | Public |

`authCookieMode` is the fastest way to confirm a deployment has `NODE_ENV` set
correctly: it reads `SameSite=None; Secure (cross-site OK)` when it does.

### Auth Router (`/api/auth`)
| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| POST | `/api/auth/process-register` | Register new user | `{ name: string, email: string, password: string, phone: string, address: object }` | `{ statusCode: 201, message: string }` | Public |
| POST | `/api/auth/login` | User login | `{ emailOrPhone: string, password: string }` | `{ statusCode: 200, message: string, payload: { user: User } }` (tokens are set as httpOnly cookies) | Public |
| POST | `/api/auth/forgot-password` | Request password reset | `{ emailOrPhone: string }` | `{ statusCode: 200, message: string }` | Public |
| POST | `/api/auth/reset-password` | Reset password | `{ token: string, newPassword: string }` | `{ statusCode: 200, message: string }` | Public |
| POST | `/api/auth/logout` | Logout user | - | `{ statusCode: 200, message: string }` | User |
| GET | `/api/auth/refresh-token` | Refresh access token | - | `{ statusCode: 200, payload: { accessToken: string } }` (also set as a cookie) | User |
| POST | `/api/auth/activate-account` | Activate user account | `{ token: string }` | `{ statusCode: 200, message: string }` | User |
| POST | `/api/auth/verify-email` | Verify user email | `{ token: string }` | `{ statusCode: 200, message: string }` | User |
| POST | `/api/auth/resend-verification` | Resend verification email | `{ email: string }` | `{ statusCode: 200, message: string }` | User |

### User Router (`/api/users`)
| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| GET | `/api/users/:id` | Get user profile | - | `{ statusCode: 200, message: string, payload: { user: User } }` | User |
| PUT | `/api/users/update/:id` | Update user info | `{ name?: string, email?: string, phone?: string, address?: object }` | `{ statusCode: 200, message: string, payload: { user: User } }` | User |
| PUT | `/api/users/profile/:id` | Update profile picture | `FormData: { profilePicture: File }` | `{ statusCode: 200, message: string, payload: { user: User } }` | User |
| POST | `/api/users/:id/addresses` | Add new address | `{ address: object }` | `{ statusCode: 201, message: string, payload: { address: Address } }` | User |
| PUT | `/api/users/:id/addresses/:addressId` | Update address | `{ address: object }` | `{ statusCode: 200, message: string, payload: { address: Address } }` | User |
| DELETE | `/api/users/:id/addresses/:addressId` | Delete address | - | `{ statusCode: 200, message: string }` | User |

### Admin Router (`/api/admin`)

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| POST | `/api/admin/login` | Admin login | `{ email: string, password: string }` | `{ statusCode: 200, message: string, payload: { admin: Admin } }` (tokens are set as httpOnly cookies) | Public |
| POST | `/api/admin/logout` | Admin logout | - | `{ statusCode: 200, message: string }` | Admin |
| POST | `/api/admin/create` | Create new admin | `{ name: string, email: string, password: string, phone: string, role: 'admin'|'superadmin' }` | `{ statusCode: 201, message: string }` | SuperAdmin |
| GET | `/api/admin/admins` | Get all admins | - | `{ statusCode: 200, message: string, payload: { admins: Admin[] } }` | SuperAdmin |
| DELETE | `/api/admin/admins/:id` | Delete admin | - | `{ statusCode: 200, message: string }` | SuperAdmin |
| GET | `/api/admin/users` | Get all users | - | `{ statusCode: 200, message: string, payload: { users: User[] } }` | Admin |
| GET | `/api/admin/users/:id` | Get user by ID | - | `{ statusCode: 200, message: string, payload: { user: User } }` | Admin |
| GET | `/api/admin/users/stats` | Get user statistics | - | `{ statusCode: 200, message: string, payload: { stats: object } }` | Admin |
| PUT | `/api/admin/users/:id` | Update user | `{ name?: string, email?: string, phone?: string, isBanned?: boolean }` | `{ statusCode: 200, message: string, payload: { user: User } }` | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | - | `{ statusCode: 200, message: string }` | Admin |
| PUT | `/api/admin/users/:id/ban` | Ban user | - | `{ statusCode: 200, message: string, payload: { user: User } }` | Admin |
| PUT | `/api/admin/users/:id/unban` | Unban user | - | `{ statusCode: 200, message: string, payload: { user: User } }` | Admin |

### Category Router (`/api/categories`)

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| POST | `/api/categories` | Create category | `{ name: string, description: string, image: File }` | `{ statusCode: 201, message: string, payload: { category: Category } }` | Admin |
| GET | `/api/categories` | Get all categories | - | `{ statusCode: 200, message: string, payload: { categories: Category[] } }` | Public |
| GET | `/api/categories/:slug` | Get category by slug | - | `{ statusCode: 200, message: string, payload: { category: Category } }` | Public |
| PUT | `/api/categories/:slug` | Update category | `{ name?: string, description?: string, image?: File }` | `{ statusCode: 200, message: string, payload: { category: Category } }` | Admin |
| DELETE | `/api/categories/:slug` | Delete category | - | `{ statusCode: 200, message: string }` | Admin |

### Product Router (`/api/products`)

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| POST | `/api/products` | Create product | `{ name: string, description: string, price: number, category: ObjectId, shipping: boolean, variants: Array<Variant>, images: File[] }` | `{ statusCode: 201, message: string, payload: { product: Product } }` | Admin |
| GET | `/api/products` | Get all products | `query: { search?: string, page?: number, limit?: number, category?: string }` | `{ statusCode: 200, message: string, payload: { products: Product[], pagination: object, totalStats: object } }` | Public |
| GET | `/api/products/:slug` | Get product by slug | - | `{ statusCode: 200, message: string, payload: { product: Product } }` | Public |
| PUT | `/api/products/:slug` | Update product | `{ name?: string, description?: string, price?: number, category?: ObjectId, shipping?: boolean, variants?: Array<Variant>, images?: File[] }` | `{ statusCode: 200, message: string, payload: { product: Product } }` | Admin |
| DELETE | `/api/products/:slug` | Delete product | - | `{ statusCode: 200, message: string }` | Admin |

### Cart Router (`/api/cart`)

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| POST | `/api/cart/add-item` | Add item to cart | `{ productId: ObjectId, variantId: ObjectId, quantity: number }` | `{ statusCode: 200, message: string, payload: { cart: Cart } }` | User |
| GET | `/api/cart` | Get cart contents | - | `{ statusCode: 200, message: string, payload: { cart: Cart } }` | User |
| PUT | `/api/cart/update` | Update cart item | `{ itemId: ObjectId, quantity: number }` | `{ statusCode: 200, message: string, payload: { cart: Cart } }` | User |
| DELETE | `/api/cart/remove` | Remove item from cart | `{ itemId: ObjectId }` | `{ statusCode: 200, message: string, payload: { cart: Cart } }` | User |
| DELETE | `/api/cart/clear` | Clear entire cart | - | `{ statusCode: 200, message: string }` | User |

### Order Router (`/api/orders`)

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| POST | `/api/orders` | Create new order | `{ cartId: ObjectId, street: string, city: string, state: string, phone: string, email: string, paymentMethod: string, couponId?: ObjectId, shippingRegion: string }` | `{ statusCode: 201, message: string, payload: { newOrder: Order & { items: Array<{product, variant, quantity}>, payment: Payment, discountBreakdown: object } } }` | User |
| GET | `/api/orders` | Get all orders | `query: { status?: string, userId?: ObjectId }` | `{ statusCode: 200, message: string, payload: { orders: Array<Order & { user: {name, email}, items: Array<{product: {name, price}}> }> } }` | Admin |
| GET | `/api/orders/user-orders` | Get user's orders | - | `{ statusCode: 200, message: string, payload: { orders: Order[] } }` | User |
| GET | `/api/orders/:id` | Get order by ID | - | `{ statusCode: 200, message: string, payload: { order: Order } }` | User/Admin |
| PUT | `/api/orders/:id` | Update order status | `{ status: string }` | `{ statusCode: 200, message: string, payload: payload: { order: Order & { user: { name }, items: Array<{ product: { name } }> } } }` | Admin |
| DELETE | `/api/orders/:id` | Delete order | - | `{ statusCode: 200, message: string }` | Admin |

### Payment Router (`/api/payment`)
| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| POST | `/api/payment/process` | Process payment | `{ orderId: ObjectId, paymentMethod: string }` | `{ statusCode: 200, message: string, payload: { payment: Payment } }` | User |
| GET | `/api/payment` | Get all payments | - | `{ statusCode: 200, message: string, payload: { payments: Payment[] } }` | Admin |
| GET | `/api/payment/user-payments` | Get user payments | - | `{ statusCode: 200, message: string, payload: { payments: Payment[] } }` | User |
| GET | `/api/payment/:id` | Get payment by ID | - | `{ statusCode: 200, message: string, payload: { payment: Payment } }` | User/Admin |
| PUT | `/api/payment/:id` | Update payment status | `{ status: string }` | `{ statusCode: 200, message: string, payload: { payment: Payment } }` | Admin |
| PUT | `/api/payment/:id/cancel` | Cancel/refund payment | - | `{ statusCode: 200, message: string, payload: { payment: Payment } }` | Admin |

### Coupon Router (`/api/coupon`)
| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| POST | `/api/coupon` | Create new coupon | `{ code: string, productDiscountType: string, productDiscountValue: number, shippingDiscountType: string, shippingDiscountValue: number, expiryDate: Date, minOrderAmount: number, maxDiscount: number, usageLimit: number }` | `{ statusCode: 201, message: string, payload: { newCoupon: Coupon } }` | Admin |
| GET | `/api/coupon` | Get all coupons | - | `{ statusCode: 200, message: string, payload: { coupons: Coupon[] } }` | Public |
| GET | `/api/coupon/:couponId` | Get coupon by ID | - | `{ statusCode: 200, message: string, payload: { coupon: Coupon } }` | Public |
| POST | `/api/coupon/apply` | Apply coupon to order | `{ userId: ObjectId, couponCode: string, totalPrice: number, shippingRegion: string }` | `{ statusCode: 200, message: string, payload: { discountInfo: object } }` | User |
| DELETE | `/api/coupon/:couponId` | Delete coupon | - | `{ statusCode: 200, message: string, payload: { coupon: Coupon } }` | Admin |

### Shipping Router (`/api/shipping`)

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| GET | `/api/shipping/rates` | Get all shipping rates | - | `{ statusCode: 200, message: string, payload: { rates: ShippingRate[] } }` | Public |
| POST | `/api/shipping/rates` | Create shipping rate | `{ region: string, cost: number, description: string }` | `{ statusCode: 201, message: string, payload: { newRate: ShippingRate } }` | Admin |
| POST | `/api/shipping/rates/initialize` | Initialize default rates | - | `{ statusCode: 201, message: string, payload: { rates: ShippingRate[] } }` | Admin |
| PUT | `/api/shipping/rates/:rateId` | Update shipping rate | `{ cost?: number, description?: string }` | `{ statusCode: 200, message: string, payload: { updatedRate: ShippingRate } }` | Admin |
| DELETE | `/api/shipping/rates/:rateId` | Delete shipping rate | - | `{ statusCode: 200, message: string, payload: { deletedRate: ShippingRate } }` | Admin |

### Subcategory Router (`/api/subcategories`)

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| POST | `/api/subcategories` | Create subcategory | `FormData: { name, description?, category: ObjectId, image?: File }` | `{ statusCode: 201, payload: { subcategory: Subcategory } }` | Admin |
| GET | `/api/subcategories` | List all subcategories | - | `{ statusCode: 200, payload: { subcategories: Subcategory[] } }` | Public |
| GET | `/api/subcategories/:slug` | Get subcategory by slug | - | `{ statusCode: 200, payload: { subcategory: Subcategory } }` | Public |
| GET | `/api/subcategories/category/:categoryId` | List subcategories of a category | - | `{ statusCode: 200, payload: { subcategories: Subcategory[] } }` | Public |
| PUT | `/api/subcategories/:slug` | Update subcategory | `FormData: { name?, description?, category?, image?: File }` | `{ statusCode: 200, payload: { subcategory: Subcategory } }` | Admin |
| DELETE | `/api/subcategories/:slug` | Delete subcategory | - | `{ statusCode: 200, message: string }` | Admin |
| POST | `/api/subcategories/recalculate-counts` | Recompute cached product counts | - | `{ statusCode: 200, message: string }` | Admin |

### Review Router (`/api/reviews`)

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| POST | `/api/reviews` | Create a review | `FormData: { product: ObjectId, order: ObjectId, rating: number, comment: string, images?: File[] }` | `{ statusCode: 201, payload: { review: Review } }` | User |
| GET | `/api/reviews` | List all reviews with filters | `query: { rating?, product?, page?, limit? }` | `{ statusCode: 200, payload: { reviews: Review[], pagination } }` | Admin |
| GET | `/api/reviews/product/:productId` | Reviews for a product | `query: { page?, limit? }` | `{ statusCode: 200, payload: { reviews: Review[], pagination } }` | Public |
| GET | `/api/reviews/product/:productId/stats` | Rating breakdown for a product | - | `{ statusCode: 200, payload: { stats } }` | Public |
| GET | `/api/reviews/user` | Reviews written by the signed-in user | - | `{ statusCode: 200, payload: { reviews: Review[] } }` | User |
| GET | `/api/reviews/pending/user` | Delivered items the user has not reviewed | - | `{ statusCode: 200, payload: { products: PendingReview[] } }` | User |
| GET | `/api/reviews/:id` | Get a review | - | `{ statusCode: 200, payload: { review: Review } }` | Public |
| POST | `/api/reviews/:id/images` | Add images to a review | `FormData: { images: File[] }` | `{ statusCode: 200, payload: { review: Review } }` | User |
| DELETE | `/api/reviews/:id/images` | Remove images from a review | `{ images: string[] }` | `{ statusCode: 200, payload: { review: Review } }` | User |
| POST | `/api/reviews/:id/helpful` | Mark a review helpful | - | `{ statusCode: 200, payload: { review: Review } }` | User |
| DELETE | `/api/reviews/:id` | Delete a review | - | `{ statusCode: 200, message: string }` | User |

### FAQ Router (`/api/faqs`)

Also the source for the support widget's FAQ tab.

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|--------------|----------|--------|
| GET | `/api/faqs` | List all FAQs | - | `{ statusCode: 200, payload: { faqs: Faq[] } }` | Public |
| GET | `/api/faqs/:id` | Get one FAQ | - | `{ statusCode: 200, payload: { faq: Faq } }` | Public |
| POST | `/api/faqs` | Create an FAQ | `{ question: string, answer: string }` | `{ statusCode: 201, payload: { faq: Faq } }` | Admin |
| PUT | `/api/faqs/:id` | Update an FAQ | `{ question?: string, answer?: string }` | `{ statusCode: 200, payload: { faq: Faq } }` | Admin |
| DELETE | `/api/faqs/:id` | Delete an FAQ | - | `{ statusCode: 200, message: string }` | Admin |

## Implementation References
- Server Setup: `src/app.js`
- Shared field rules: `src/constants/validationRules.js`
- Logger: `src/helper/logger.js`

- User Routes: `src/routers/userRouter.js`
- Admin Routes: `src/routers/adminRouter.js`
- Auth Routes: `src/routers/authRouter.js`
- Category Routes: `src/routers/categoryRouter.js`
- Product Routes: `src/routers/productRouter.js`
- Cart Routes: `src/routers/cartRouter.js`
- Order Routes: `src/routers/orderRouter.js`
- Payment Routes: `src/routers/paymentRouter.js`
- Coupon Routes: `src/routers/couponRouter.js`
- Shipping Routes: `src/routers/shippingRouter.js`
- Subcategory Routes: `src/routers/subcategoryRouter.js`
- Review Routes: `src/routers/reviewRouter.js`
- FAQ Routes: `src/routers/faqRouter.js`

- User Controller: `src/controllers/userController.js`
- Admin Controller: `src/controllers/adminController.js`
- Auth Controller: `src/controllers/authController.js`
- Category Controller: `src/controllers/categoryController.js`
- Product Controller: `src/controllers/productController.js`
- Cart Controller: `src/controllers/cartController.js`
- Order Controller: `src/controllers/orderController.js`
- Payment Controller: `src/controllers/paymentController.js`
- Coupon Controller: `src/controllers/couponController.js`
- Shipping Controller: `src/controllers/shippingController.js`
- Subcategory Controller: `src/controllers/subcategoryController.js`
- Review Controller: `src/controllers/reviewController.js`
- FAQ Controller: `src/controllers/faqController.js`

