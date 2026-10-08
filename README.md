# Nibedito E-commerce Platform

A full-stack gift and e-commerce store: product catalogue, cart, checkout,
orders, reviews, coupons and a full admin panel.

This file covers setup, configuration and everything outstanding before
production. Two companions go deeper without repeating any of it:

- [`backend/README.md`](./backend/README.md) — endpoint-by-endpoint API reference
- [`frontend/README.md`](./frontend/README.md) — app structure and the
  conventions to follow when changing the UI

## Demo Screenshots

![Home Page](./frontend/public/images/demo/demo_homepage.png)
![Admin Dashboard](./frontend/public/images/demo/demo_adminpanel.png)
![Product List](./frontend/public/images/demo/demo_productlist.png)
![Product Details](./frontend/public/images/demo/demo_product.png)

## Tech Stack

**Frontend** — Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS ·
Radix UI · TanStack Query · axios · framer-motion

**Backend** — Node.js · Express · MongoDB with Mongoose · JWT in httpOnly
cookies · bcryptjs · Cloudinary (image storage) · Nodemailer · PDFKit (invoices) ·
express-validator · express-rate-limit

## Features

**Storefront** — product catalogue with search, filtering and pagination ·
categories and subcategories · product detail pages with image galleries ·
cart · checkout with shipping rates and coupons · order history · PDF invoices,
downloadable from the orders page and emailed on checkout · product
reviews with images · wishlist

**Accounts** — registration with email activation · login · password reset ·
email change verification · profile and address management · security settings

**Admin** — dashboard · products · categories and subcategories · orders ·
users (view, ban, unban) · coupons · shipping rates · FAQs

---

# Running it locally

Two options. Docker is the least fiddly and is what the rest of this section
assumes.

## Option 1 — Docker (recommended)

Only Docker is required; you do not need Node, MongoDB or a mail server
installed on your machine.

```bash
docker compose up --build
```

That starts four containers: the frontend, the API, a MongoDB instance, and a
mail catcher. First run takes a few minutes while images build.

Nothing seeds itself — the containers only start the app, so the local database
comes up empty and with no accounts. One command fixes both:

```bash
docker compose run --rm api node scripts/seed-dev.js
```

That gives you the full catalogue — 16 products across 10 categories — the three
shipping regions, a superadmin for `/admin-login`, and one verified customer you
can shop as. Both accounts take their passwords from `backend/.env`
(`SUPER_ADMIN_PASSWORD` and `DEFAULT_USER_PASSWORD`) and the script prints which
address goes with which. Neither password is printed, and neither should be
pasted anywhere.

**The shipping regions matter.** Without them the region dropdown at checkout is
empty and every order is rejected with "Invalid shipping region", so an
otherwise well-stocked store cannot take a single order.

Re-running it is safe: it replaces the catalogue, the shipping rates and those
two accounts, and leaves every other account alone.

| Service | URL |
|---|---|
| Storefront | http://localhost:3000 |
| API health check | http://localhost:3001/health |
| Mailbox | http://localhost:8025 |
| MongoDB | `mongodb://localhost:27017/nibedito` |

**The mailbox matters.** Registration sends an activation email and the account
cannot be used until the link is opened. Nothing is sent to a real address
locally — every outgoing message is captured at http://localhost:8025, where you
can open the activation link.

Backend environment variables are read from `backend/.env`, which is mounted
into the container. Copy the template and fill it in before the first run:

```bash
cp backend/.env.example backend/.env
```

Stopping:

```bash
docker compose down
```

Add `-v` to also delete the local database volume:

```bash
docker compose down -v
```

### Rebuilding after changes

The containers run a production build, so code changes need a rebuild:

```bash
docker compose up --build
```

If you change `NEXT_PUBLIC_API_URL`, you **must** rebuild the frontend image
rather than restart it — see [Gotchas](#gotchas) below.

## Option 2 — Node directly

Requires Node.js 20+ and a MongoDB you can reach (local install or Atlas).

**Backend**

```bash
cd backend && npm install && npm run dev
```

Note `npm install`, not `npm ci --omit=dev`: `morgan` is required at runtime but
declared under `devDependencies`, so a production-only install produces a server
that will not boot.

**Frontend**, in a second terminal:

```bash
cd frontend && npm install && npm run dev
```

The frontend runs on port 3000 and the API on 3001.

Without Docker there is no mail catcher, so `SMTP_*` must point at a real SMTP
server or registration will fail — the account is deleted and the request
returns 500 if the activation email cannot be sent.

---

# Configuration

## `backend/.env`

| Variable | Purpose |
|---|---|
| `SERVER_PORT` | Port the API listens on (3001 locally) |
| `NODE_ENV` | `development` locally, `production` when deployed. See [Gotchas](#gotchas) |
| `CLIENT_URL` | Frontend origin. Used for CORS and for links inside emails. Exact match, no trailing slash |
| `MONGODB_ATLAS_URL` | MongoDB connection string |
| `JWT_ACCESS_KEY` | Signs access tokens (15 minute lifetime) |
| `JWT_REFRESH_KEY` | Signs refresh tokens (7 day lifetime) |
| `JWT_ACTIVATION_KEY` | Signs account-activation and password-reset links |
| `SMTP_EMAIL` | The From address. Providers that verify domains — Mailgun among them — refuse anything not on a domain you own |
| `SMTP_USER` | Optional. The relay login when it differs from the From address. Falls back to `SMTP_EMAIL`, which is the usual case on Mailgun |
| `SMTP_PASSWORD` | Relay password. On Mailgun this is the SMTP user's password, not the account API key |
| `SMTP_HOST` / `SMTP_PORT` | Optional. Defaults to `smtp.gmail.com` and `587`. Mailgun is `smtp.mailgun.org`. Compose points these at the local mail catcher |
| `STORE_NAME` | Optional, defaults to `Nibedito`. Display name on outgoing mail, and the header on invoice PDFs |
| `STORE_ADDRESS` / `STORE_EMAIL` / `STORE_PHONE` | Optional. Printed on invoice PDFs. Default to `Dhaka, Bangladesh`, `SMTP_EMAIL` and blank |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Product and profile image uploads |
| `DEFAULT_USER_PICTURE` | Fallback avatar URL |
| `DEFAULT_USER_PASSWORD` | Password for the seeded customer accounts, used by `seed-dev.js` and `seedTestUsers.js`. Must satisfy the password rule below — 8+ characters with an uppercase letter, a lowercase letter and a number — or those accounts are skipped |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` / `SUPER_ADMIN_PHONE` | Credentials for the admin account created by `seed-dev.js` and `createDefaultAdmin.js`. Phone is 11 digits, same as a customer |

## `frontend/.env.local`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL, including `/api` — e.g. `http://localhost:3001/api` |
| `NEXT_PUBLIC_CLOUDINARY_URL` | Cloudinary delivery base URL |
| `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` | Number used by the support widget |

Both files are gitignored. Never commit real credentials.

---

# Scripts

**Every path below is relative to `backend/`, not the repository root.** There is
no `scripts/` or `src/` directory at the top level — only `backend/`, `frontend/`
and the two markdown files — so `ls scripts` from where you cloned finds nothing.
These are also not npm scripts: `npm run` only knows `start`, `dev` and `test`,
and `npm run seed-dev` does not exist.

Two ways to run them. Through Docker, from the repository root — the container's
working directory is `/app`, which holds the contents of `backend/`, so the paths
in the table work unchanged:

```bash
docker compose run --rm api node scripts/seed-dev.js
```

Or directly, which means changing into `backend/` first:

```bash
cd backend && node scripts/seed-dev.js
```

The Docker form is the one to prefer. It supplies the environment from
`docker-compose.yml`, which points the database at the local `mongo` service —
several of these scripts delete documents, and two of them have no guard against
being aimed at a hosted cluster.

| Command (relative to `backend/`) | Effect |
|---|---|
| `node scripts/sync-catalogue.js` | Copies categories, subcategories and products from the cloud database into the local one, so development shows the same catalogue as the live site. Reads the cloud only; refuses to write into a hosted cluster. Accounts, carts and orders are never copied |
| `node scripts/check-smtp.js [email]` | Checks the mail server is reachable and the credentials work. Pass an address to send a test message |
| `node scripts/seed-dev.js` | The one to run on a fresh database. Seeds the full catalogue, the three shipping regions, the superadmin from `SUPER_ADMIN_*`, and one verified customer using `DEFAULT_USER_PASSWORD`. Replaces only those two accounts, never the whole collection. Refuses to run against a hosted cluster |
| `node src/scripts/createDefaultAdmin.js` | Creates the admin account from the `SUPER_ADMIN_*` variables. `seed-dev.js` already does this; reach for it only to reset the admin on its own. **Deletes every admin first, and has no hosted-cluster guard** — run it through `docker compose run` so compose points it at the local database |
| `node src/scripts/seed/seedCategories.js` | Seeds the nine-category tree. `seed-dev.js` already does this; run it alone to reset categories |
| `node src/scripts/seed/seedProducts.js` | Seeds the 13-product catalogue. **Requires the categories to exist first** — it links products to categories by name, and warns loudly about any it has to drop |
| `node src/scripts/seed/seedTestUsers.js` | Creates test user accounts |

The seed scripts delete existing documents in the collections they populate.
Only point them at a database you are willing to lose.

---

# Gotchas

Four things that cost real debugging time. Worth reading before you hit them.

### `NEXT_PUBLIC_*` is baked in at build time

Next.js inlines these into the client bundle when it builds; they are not read
at runtime. Setting `NEXT_PUBLIC_API_URL` as a container environment variable
does nothing. Changing it requires rebuilding the frontend image, and on a
hosting platform it means a fresh build (clear the build cache), not a restart.

### `NODE_ENV` decides whether cookies carry `Secure`

Auth cookies are `SameSite=Lax` in every environment. `NODE_ENV` controls one
thing: whether they also carry the `Secure` flag.

- **Locally** you want `development`. `Secure` cookies are rejected over plain
  http, so setting `production` here means the browser stores nothing and you
  cannot stay signed in.
- **Deployed**, `production` is required. https demands `Secure`, and without it
  the cookie travels in the clear.

`Lax` is sufficient because Nginx serves the frontend and the API from one
origin split by path, so the browser treats every API call as same-site. It is
also what keeps a form on another domain from making authenticated requests as
the signed-in user — there is no CSRF token in the app, so the cookie policy is
the whole defence. Do not switch these to `SameSite=None` without adding one.

`GET /health` reports which mode is active:

```json
{ "status": "ok", "database": "connected", "environment": "production",
  "authCookieMode": "SameSite=Lax; Secure" }
```

### `morgan` is a runtime dependency in the wrong section

`src/app.js` requires it on startup, but it sits under `devDependencies`. Any
production-only install produces a server that crashes with `MODULE_NOT_FOUND`.
Install with dev dependencies included until it is moved.

### Hosts block outbound SMTP — use port 2525

This is not a free-tier quirk; it is the default almost everywhere.
**DigitalOcean blocks outbound 25, 465 and 587 on every droplet**, reserved IPs
included. Render's free web services block the same three, and port 25 on every
plan. It is an anti-spam measure aimed at the IP range, not at your account, and
no amount of correct credentials gets around it.

Nothing reports it usefully. The connection simply times out, registration fails
at the point it tries to send the activation email, and the account is rolled
back — so a new customer sees an error and has no account to retry with.

**Use port 2525.** Mailgun accepts 25, 465, 587 and 2525; the last is not on
anyone's block list and carries the same STARTTLS traffic as 587. That single
change is what made mail work on this deployment.

Check which side is at fault:

```bash
docker compose run --rm -e SMTP_HOST=smtp.mailgun.org -e SMTP_PORT=2525 api node scripts/check-smtp.js you@example.com
```

`ETIMEDOUT` from a deployment while the same credentials succeed from a laptop
means the host is blocking the port, not that the credentials are wrong. The
script prints which stage failed, so a timeout at connect and a rejection at
authentication are told apart rather than both reading as "email is broken".

If 2525 is blocked too, send through the provider's HTTPS API instead — Mailgun,
Resend, SendGrid and Postmark all have one, all on port 443, which nothing
blocks. That means replacing nodemailer in `helper/email.js`, and it is the only
option immune to a host changing its mind.

### Field rules live in one file

`backend/src/constants/validationRules.js`, mirrored by exported constants in
`frontend/src/utils/validation.ts`. Change both together.

This is the mistake that has produced the most bugs here. Each rule used to be
written out separately in the validator, the schema, sometimes an inline check
in a controller, and again in the browser — and they drifted. The result is
always the same: the form accepts something, the API refuses it, and the person
gets two contradictory messages for one mistake, one under the field and a
differently worded one above the form.

Current rules:

| Field | Rule |
|---|---|
| Password | 8+ characters, with an uppercase letter, a lowercase letter and a number |
| Name | 3–30 characters |
| Phone | exactly 11 digits, stored beginning with 0 |

Admin accounts are a separate collection with their own password rule in
`adminModel.js` — stricter, and a fourth copy of a rule that belongs here. The
phone rule is no longer among them: `adminModel` imports `PHONE_PATTERN` from
this file, the same as `userModel`. It used to carry its own 10-digit copy,
which made a Bangladeshi number written the normal way valid for a customer and
invalid for an admin, and shipped a `SUPER_ADMIN_PHONE` in `.env.example` that
could not pass. The password rule is the one still to fold in.

---

# Before production

Known gaps, roughly in the order they would hurt. Nothing here blocks local
development or a demo, but the first two sections should be closed before the
site takes real customers.

## Blocking

- [x] **Email sends from the droplet.** DigitalOcean blocks outbound 25, 465 and
      587, which made registration and password reset fail — the account is
      rolled back when the activation email cannot be sent, so a new customer
      got an error and nothing to retry with. Mailgun on port **2525** goes
      through. Invoice sends were never allowed to fail an order, and the
      invoice stays downloadable from the orders page regardless. Moving
      `helper/email.js` to Mailgun's HTTPS API would make this immune to a host
      changing its mind; port 2525 is a workaround, not a guarantee.
- [ ] **Rotate the database password.** The old one appeared in startup logs
      before those were redacted, so treat it as public.
- [ ] **No automated tests anywhere.** `npm test` is still the placeholder that
      exits 1. Most bugs found so far were one-line mismatches between two
      copies of the same rule - exactly what a small API test suite around auth,
      validation and checkout would have caught.

## Half-built features

- [ ] **Phone verification.** `verificationStatus.phone` is stored and shown but
      nothing ever sets it. The UI says "coming soon".
- [ ] **Support widget is not a chatbot.** Typing a message opens WhatsApp; no
      reply arrives in the panel. Fine as a handoff, but it is not automated
      support.
- [ ] **Homepage is mostly static.** `CategoryGrid`, `HeroSection` and
      `Features` render `constants/dummyData.ts`, so the category grid shows
      eight invented categories that contradict the real ones in the navbar.
      Only the product strip reads the API.
- [ ] **Admin profile has three dead actions.** Edit, settings and quick-action
      navigation in `components/admin/dashboard/AdminProfile.tsx` are TODO stubs
      that do nothing when clicked.

## Security hardening

- [ ] **No `helmet`.** The API sets no security headers at all — no CSP, HSTS,
      `X-Content-Type-Options` or frame protection. One `app.use(helmet())` in
      `app.js` covers most of it.
- [ ] **Rate limiting is one global bucket**: 300 requests per minute per IP
      across every route. That allows 300 password guesses a minute against
      `/api/auth/login`. Auth endpoints want their own much tighter limiter.
- [ ] **No `compression`.** Responses are sent uncompressed; product listings
      are the obvious cost.

## Auth hardening

- [ ] **Refresh tokens are not rotated** and there is no reuse detection, so a
      stolen one is good for its full 7 days.
- [ ] **Logout does not revoke.** Cookies are cleared but the JWT stays valid
      until it expires.
- [ ] **`isBanned` is read from the token**, so a ban takes up to 15 minutes to
      take effect.
- [ ] **Users and admins share one cookie name and one signing key.** No
      privilege escalation - the admin lookup requires a matching Admin document
      - but the two sessions overwrite each other.

## Data and correctness

- [ ] **`ratings` has two shapes.** Older product documents hold an array where
      the schema now says Number. Needs a migration.
- [ ] **`averageRating` is redundant.** It is 0 on every product while `ratings`
      carries the real value. Pick one.
- [ ] **Mongoose validation messages reach the client** verbatim, so schema
      wording is user-facing.
- [ ] **A failed database connection does not stop the server.** It logs and
      carries on, so the API serves 500s instead of failing to start. The
      connection error listener is also registered after `connect`, so it is
      never attached if the first attempt throws.

## Cleanup

- [ ] **~30 lint warnings**, mostly `react-hooks/exhaustive-deps` on
      `fetchOrders` and `fetchReviews`. The usual cause of stale data after a
      refetch.
- [ ] **`dotenv` is bundled into the client.** It is in the frontend
      dependencies and something pulls it in; dead weight in the browser.
- [ ] **Decorative `absolute inset-0` overlays** need a positioned parent. Four
      pages had one resolving against the viewport, covering the page and
      swallowing clicks. Others may remain - the pattern to look for is an
      `absolute inset-0` sibling under a parent without `relative`.
- [ ] **`components/ui` holds unused shadcn scaffolding** pulled in wholesale.
      Worth pruning to what is actually used.

---

# Deployment

The two halves deploy as separate services from this one repository, each with
its own root directory.

| | Backend | Frontend |
|---|---|---|
| Root directory | `backend` | `frontend` |
| Build command | `npm ci --include=dev` | `npm ci --include=dev && npm run build` |
| Start command | `npm start` | `npm start` |
| Health check path | `/health` | — |

`--include=dev` is required for both: the frontend build needs TypeScript and
Tailwind, and the backend needs `morgan` at runtime.

Deploy the backend first so you know its URL, point the frontend's
`NEXT_PUBLIC_API_URL` at `https://<backend-host>/api` and build it, then set the
backend's `CLIENT_URL` to the frontend URL and redeploy. `CLIENT_URL` is matched
exactly by CORS, so no trailing slash.

Set `NODE_ENV=production` on the backend. See [Gotchas](#gotchas) for why this
one is not optional.

---

# Project structure

```
backend/
  src/
    constants/     shared rules, e.g. the password policy
    controllers/   request handlers
    models/        Mongoose schemas
    routers/       route definitions, all mounted under /api
    validators/    express-validator chains
    helper/        email, JWT helpers
    scripts/       seed and admin-creation scripts
    app.js         express app, middleware, /health
    server.js      entry point
frontend/
  src/
    app/           App Router pages, grouped (auth) (user) (admin)
    components/    UI, grouped by feature
    contexts/      auth, admin auth, cart
    services/      typed API clients
    types/         shared TypeScript types
    utils/         axios instance and interceptors, validation
docker-compose.yml
```

API routes are all mounted under `/api` — `/api/products`, `/api/auth`,
`/api/cart` and so on. The bare root path returns 404 by design; use `/health`
to check the server is up.
