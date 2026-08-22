# Nibedito Frontend

Next.js storefront and admin portal for the Nibedito store.

**Setup, environment variables and deployment live in the
[root README](../README.md)**, along with the pre-production checklist. Nothing
here repeats them, so the two cannot drift apart. API endpoints are documented
in [`backend/README.md`](../backend/README.md).

## Tech Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS** with Radix UI primitives
- axios for API calls, with a shared instance that handles token refresh
- React Context for auth, admin auth and cart
- TanStack Query, framer-motion, react-hot-toast

## Layout

```
src/
  app/            App Router pages, grouped by audience
    (auth)/       login, register, activation, password reset
    (user)/       dashboard, orders, reviews, profile, security, cart, checkout
    (admin)/      admin portal, its own layout and 404
    products/     catalogue and product detail
    categories/   category browsing
  components/     grouped by feature; components/ui holds shadcn primitives
  contexts/       AuthContext, AdminAuthContext, CartContext
  services/       typed API clients, one per resource
  types/          shared types, mirroring the API payloads
  utils/          axios instance, validation, phone, logger, image helpers
```

Route groups in brackets do not appear in URLs. `(user)/layout.tsx` renders the
account sidebar and owns the signed-out redirect for the account pages; cart and
checkout live in that group but render without the sidebar.

## Things worth knowing before changing code

**`NEXT_PUBLIC_*` is inlined at build time.** Setting one as a runtime
environment variable does nothing. Changing `NEXT_PUBLIC_API_URL` needs a
rebuild, not a restart.

**Field rules are mirrored, not shared.** `utils/validation.ts` exports the
password, name and phone rules; `backend/src/constants/validationRules.js` holds
the same values. They are not imported across the boundary, so changing one
without the other is the single most common source of bugs here — it produces a
form that accepts input the API then rejects, with two contradictory messages.

**Phone numbers** are stored as 11 digits beginning with 0. Entry fields carry
no country-code prefix; `utils/phone.ts` builds the `+880` form for display.

**Logging** goes through `utils/logger.ts`. `logger.debug` is silent outside
development, and `next.config.ts` additionally strips bare `console.log` from
production builds. Message strings still ship in the bundle, so keep secrets out
of them at every level.

**Errors** render through `components/common/Error.tsx` (imported as
`ErrorMessage` — importing it as `Error` shadows the global and breaks
`instanceof Error`). The axios interceptor deliberately raises no toast: forms
show their own message, and doing both produced duplicates.

**Decorative `absolute inset-0` overlays need a positioned parent.** Without
`relative` on the parent they resolve against the viewport, cover the page and
swallow every click. Add `pointer-events-none` to any purely decorative layer.

## Current State

Built and working: catalogue with search, filtering, sorting and pagination ·
categories and subcategories · product detail with image zoom and variants ·
cart · checkout with shipping regions and coupons · order history · reviews with
images · profile and multiple addresses · email verification and password reset
· full admin portal for products, categories, orders, users, coupons, shipping
and FAQs.

Not finished — see the pre-production checklist in the root README for the full
list with context:

- **Wishlist** has no page. The nav entries are deliberately left in place and
  currently 404.
- **Homepage is largely static.** `CategoryGrid`, `HeroSection` and `Features`
  render `constants/dummyData.ts`, so the category grid contradicts the real
  categories in the navbar. Only the product strip reads the API.
- **Support widget is not a chatbot.** It answers from the FAQ list and hands
  conversations to WhatsApp.
- **Admin profile** has three unimplemented actions (edit, settings, quick
  actions).
- **No tests**, and around 30 lint warnings, mostly `exhaustive-deps`.
