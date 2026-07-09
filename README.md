# 🚀 GearUp — Rental Management Backend API

A production-ready REST API for an end-to-end gear & equipment rental platform. Built with **Express 5**, **TypeScript**, **Prisma ORM 7** (PostgreSQL), and **Stripe** for secure online payments.

> **Live API:** [https://gearup-backend-self.vercel.app](https://gearup-backend-self.vercel.app)
> **Base path:** `/api/v1`

---

## ✨ Features

- 🔐 **JWT Authentication** with HTTP-only cookies (access + refresh tokens) and role-based authorization (`ADMIN`, `PROVIDER`, `CUSTOMER`)
- 🛍️ **Catalog Management** — Categories, gear items, stock & availability tracking
- 📦 **Rental Order Lifecycle** — `PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED` (with `CANCELLED` & `LATE_RETURN` branches)
- 💳 **Stripe Checkout** — secure checkout sessions + verified webhook handling for `RENTAL` and `LATE_FEE` payments
- ⭐ **Reviews & Ratings** tied to rental orders and gear items
- 👮 **Admin Controls** — list users, suspend/activate accounts
- 🛡️ **Global Error Handling** — Prisma-aware (P2002, P2003, P2025, P1000, P1001) + standardized JSON responses
- 🧰 **Query Support** — pagination, filtering, search on list endpoints
- ☁️ **Vercel-ready** with a bundled Node runtime (`@vercel/node`)

---

## 🧱 Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Runtime      | Node.js + TypeScript (ESM)              |
| Framework    | Express `5.x`                           |
| Database     | PostgreSQL via Prisma ORM `7.x`         |
| Auth         | `jsonwebtoken` + `bcrypt` + cookies    |
| Payments     | Stripe (`stripe` SDK + webhooks)        |
| Validation   | `zod` (in services)                     |
| Bundler      | `tsup` → `dist/`                        |
| Hosting      | Vercel (`@vercel/node`)                 |

---

## 📂 Project Structure

```
src/
├── app.ts                # Express app (CORS, routes, error handlers)
├── server.ts             # Server bootstrap + Prisma connection
├── config/
│   └── config.ts         # Env-backed config object
├── lib/
│   ├── prisma.ts         # Prisma client (PostgreSQL adapter)
│   └── stripe.ts         # Stripe SDK client
├── middleware/
│   ├── auth.ts           # JWT verification + role-based guard
│   ├── globalErorHandler.ts  # Prisma-aware error normalizer
│   └── notfound.ts       # 404 fallback handler
├── utils/
│   ├── asyncHandler.ts   # Async wrapper to forward errors
│   ├── jwtutils.ts       # sign / verify helpers
│   └── sendResponse.ts   # Standard JSON response envelope
└── module/
    ├── auth/             # register, login, refresh, me
    │   ├── auth.controller.ts
    │   ├── auth.interface.ts
    │   ├── auth.router.ts
    │   └── auth.service.ts
    ├── admin/            # list users, update status
    │   ├── admin.controller.ts
    │   ├── admin.interface.ts
    │   ├── admin.router.ts
    │   └── admin.service.ts
    ├── category/         # CRUD categories (ADMIN)
    │   ├── category.controller.ts
    │   ├── category.interface.ts
    │   ├── category.router.ts
    │   └── category.service.ts
    ├── gear/             # CRUD gear items + filters
    │   ├── gear.controller.ts
    │   ├── gear.interface.ts
    │   ├── gear.router.ts
    │   └── gear.service.ts
    ├── rentalOrder/      # full order lifecycle
    │   ├── rentalOrder.controller.ts
    │   ├── rentalOrder.interface.ts
    │   ├── rentalOrder.router.ts
    │   └── rentalOrder.service.ts
    ├── payment/          # Stripe checkout + webhook + history
    │   ├── payment.controller.ts
    │   ├── payment.interface.ts
    │   ├── payment.router.ts
    │   ├── payment.service.ts
    │   └── payment.utils.ts
    └── review/           # per-gear-item reviews
        ├── review.controller.ts
        ├── review.router.ts
        └── review.service.ts

prisma/
├── migrations/           # Applied migration history
└── schema/               # Split Prisma schemas
    ├── schema.prisma     # generator + datasource
    ├── enums.prisma      # Role, status, payment enums
    ├── user.prisma       # User model
    ├── categories.prisma # categories model
    ├── gearItems.prisma  # gearItems model
    ├── rentalOrder.prisma       # RentalOrder model
    ├── rentalOrderItems.prisma  # line items model
    ├── payment.prisma    # payments model
    └── review.prisma     # review model
```

---

## 🌐 API Reference

All endpoints are prefixed with **`/api/v1`**. Authenticated routes require either:
- the `accessToken` cookie (auto-sent on same-origin), **or**
- an `Authorization: Bearer <token>` header.

> 🔑 Roles: `ADMIN` · `PROVIDER` · `CUSTOMER`

### 🔓 Auth — `/api/v1/auth`

| Method | Endpoint        | Auth          | Description |
|--------|-----------------|---------------|-------------|
| POST   | `/register`     | Public        | Register a new user |
| POST   | `/login`        | Public        | Login, sets `accessToken` & `refreshToken` cookies |
| POST   | `/refreshtoken` | Public (cookie) | Issue a new access token |
| GET    | `/me`           | Any role      | Get current user profile |

### 👮 Admin — `/api/v1/admin`

| Method | Endpoint                       | Auth   | Description |
|--------|--------------------------------|--------|-------------|
| GET    | `/getalluser`                  | ADMIN  | List users (paginated/filterable via query) |
| PATCH  | `/updateuser-status/:id`       | ADMIN  | Update user `activeStatus` (`ACTIVE` / `SUSPENDED`) |

### 🗂️ Categories — `/api/v1/category`

| Method | Endpoint                  | Auth  | Description |
|--------|---------------------------|-------|-------------|
| POST   | `/addcategory`            | ADMIN | Create a category |
| PUT    | `/updatecategory/:id`     | ADMIN | Update a category |
| DELETE | `/deletecategory/:id`     | ADMIN | Delete a category |
| GET    | `/`                       | Public| List categories (query filters supported) |
| GET    | `/:id`                    | Public| Get category by id |

### 🛍️ Gear Items — `/api/v1/gear`

| Method | Endpoint                          | Auth               | Description |
|--------|-----------------------------------|--------------------|-------------|
| POST   | `/:categoryId`                   | ADMIN, PROVIDER    | Add a gear item under a category |
| PUT    | `/:id`                            | ADMIN, PROVIDER    | Update a gear item |
| DELETE | `/:id`                            | ADMIN, PROVIDER    | Delete a gear item |
| GET    | `/:id`                            | Public             | Get gear by id |
| GET    | `/`                               | Public             | List gears (search/filter/paginate) |
| GET    | `/category/:categoryId`           | Public             | List gears by category |
| GET    | `/provider/:providerId`           | ADMIN, PROVIDER    | List gears by provider |

### 📦 Rental Orders — `/api/v1/rental-order`

| Method | Endpoint                          | Auth                            | Description |
|--------|-----------------------------------|---------------------------------|-------------|
| POST   | `/`                               | CUSTOMER, ADMIN                 | Create a rental order |
| GET    | `/`                               | Any role                        | List orders (scoped to role) |
| GET    | `/:rentalOrderId`                 | Any role                        | Get an order by id |
| DELETE | `/:rentalOrderId`                 | ADMIN                           | Delete an order |
| PATCH  | `/confirm/:rentalOrderId`         | ADMIN, PROVIDER                 | Confirm a placed order |
| PATCH  | `/pickup/:rentalOrderId`          | ADMIN, PROVIDER                 | Mark picked up |
| PATCH  | `/return/:rentalOrderId`          | ADMIN, PROVIDER                 | Mark returned (computes late fee) |
| PATCH  | `/cancel/:rentalOrderId`          | Any role                        | Cancel an order |
| GET    | `/orderStatus/:rentalOrderId`     | Any role                        | Get order status |

### 💳 Payments — `/api/v1/payment`

| Method | Endpoint           | Auth                | Description |
|--------|--------------------|---------------------|-------------|
| POST   | `/checkout`        | CUSTOMER, ADMIN     | Create a Stripe checkout session. Body: `{ rentalOrderId, paymentType: "RENTAL" \| "LATE_FEE" }` |
| POST   | `/webhook`         | Stripe (raw)        | Stripe webhook receiver (raw body, verified via `STRIPE_WEBHOOK_SECRET`) |
| GET    | `/payment-history` | CUSTOMER, ADMIN     | List payments (filterable) |

### ⭐ Reviews — `/api/v1/review`

| Method | Endpoint          | Auth                | Description |
|--------|-------------------|---------------------|-------------|
| POST   | `/`               | CUSTOMER, ADMIN     | Create review — body: `{ rentalOrderId, rating, comment }`, query: `gearitemId` |
| PATCH  | `/:reviewId`      | CUSTOMER, ADMIN     | Update review — body: `{ rating, comment }` |
| DELETE | `/:reviewId`      | CUSTOMER, ADMIN     | Delete review |
| GET    | `/:gearitemid`    | Public              | List reviews for a gear item |

---

## 🧾 Data Model (Prisma)

- **User** — `id, name, email, password, role (CUSTOMER|PROVIDER|ADMIN), activeStatus (ACTIVE|SUSPENDED)`
- **categories** — created by a User
- **gearItems** — owned by a Provider, linked to a Category; status: `AVAILABLE` | `UNAVAILABLE`
- **RentalOrder** — by Customer; status: `PLACED | CONFIRMED | PAID | PICKED_UP | RETURNED | LATE_RETURN | CANCELLED`
- **rentalOrderItems** — line items (quantity, daysRented, subtotal, discount, rentalPricePerDay)
- **payments** — Stripe checkout sessions; `paymentMethod: stripe|cash`, `paymentType: RENTAL|LATE_FEE`, `paymentStatus: PENDING|PAID|FAILED|CANCELLED`
- **review** — rating, comment, links RentalOrder + gearItem + Customer

---

## 📨 Standard Response Envelope

```json
{
  "success": true,
  "statuscode": 200,
  "message": "Gear fetched successfully",
  "data": { /* payload */ },
  "meta": { "page": 1, "limit": 10, "total": 42 }
}
```

Errors are normalized by `globalerrorhandler` with `Prisma`-aware mapping:

- `P2002` → `409 Conflict` — duplicate entry
- `P2003` → `400 Bad Request` — FK violation
- `P2025` → `404 Not Found` — record not found
- `P1000` → `401 Unauthorized` — DB auth failed
- `P1001` → `503 Service Unavailable` — DB unreachable

---

## ⚙️ Environment Variables

Create a `.env` in the project root:

```env
PORT=8000

# Postgres
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/gearup

# CORS
APP_URL=http://localhost:3000

# Auth
BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRODUCT_ID=prod_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> For local webhook testing:
> ```bash
> npm run stripe:webhook
> ```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **≥ 20**
- A PostgreSQL database (local or hosted)

### Install

```bash
git clone https://github.com/Rahad0Islam/gearup-rental-server.git
cd gearup-rental-server
npm install
```

### Configure

```bash
cp .env.example .env   # then fill in your values
```

### Database

```bash
npx prisma migrate dev
npx prisma generate
```

### Run

```bash
# Dev (hot reload)
npm run dev

# Production build
npm run build
npm start
```

The server starts on `PORT` (default `8000`) and connects Prisma before listening.

---

## 📦 Scripts

| Script                  | Purpose                                                  |
|-------------------------|----------------------------------------------------------|
| `npm run dev`           | Start dev server with `tsx watch`                        |
| `npm run build`         | Generate Prisma client + bundle with `tsup` to `dist/`   |
| `npm start`             | Run the built server: `node dist/server.js`              |
| `npm run stripe:webhook`| Forward Stripe webhooks to `localhost:8000`              |

---

## ☁️ Deployment (Vercel)

This repo ships with a `vercel.json` that targets `dist/server.js` via `@vercel/node`:

```json
{
  "version": 2,
  "builds": [{ "src": "dist/server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "dist/server.js" }]
}
```

Live URL: **[https://gearup-backend-self.vercel.app](https://gearup-backend-self.vercel.app)**

Set every env var from `.env` in **Vercel → Project → Settings → Environment Variables**, then push to trigger a build.

---

## 🧪 Smoke Test

```bash
curl https://gearup-backend-self.vercel.app/
# -> Hello World!

curl https://gearup-backend-self.vercel.app/api/v1/category
# -> { "success": true, "statuscode": 200, "message": "Categories fetched successfully", "data": [...] }
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/awesome`
3. Commit: `git commit -m "feat: add awesome"`
4. Push & open a PR

---

## 📄 License

Rahad © GearUp contributors