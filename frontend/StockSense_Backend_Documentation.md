# StockSense — Backend Design Document

**System:** Modular Inventory Management System (IMS)
**Component:** Backend (Node.js + Express + MongoDB)
**Version:** 1.0

---

## 1. Overview

StockSense replaces manual registers, spreadsheets, and scattered tracking with a centralized, real-time inventory system. The backend exposes a REST API consumed by the frontend (web/mobile), and is responsible for authentication, product catalog management, stock movement (receipts, deliveries, transfers, adjustments), and reporting (dashboard KPIs).

**Target users:**
- **Inventory Managers** — manage incoming & outgoing stock, view reports, configure warehouses.
- **Warehouse Staff** — perform transfers, picking, shelving, and stock counts.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (access + refresh tokens) |
| OTP delivery | Email (Nodemailer) or SMS gateway |
| Validation | Joi / express-validator |
| File/Image handling | multer (if product images are added later) |
| Docs | This document + `StockSense_API_Documentation.md` |

Suggested folder structure:

```
src/
├── config/          # db connection, env, constants
├── models/          # Mongoose schemas
├── controllers/      # route handlers
├── routes/           # express routers
├── middlewares/       # auth, error handling, validation
├── services/          # business logic (stock math, ledger writes)
├── utils/             # helpers (OTP gen, SKU gen, pagination)
└── app.js / server.js
```

---

## 3. Core Modules

1. **Auth** — signup, login, OTP-based password reset, JWT session.
2. **Products** — CRUD, categories, unit of measure, reordering rules.
3. **Warehouses** — CRUD for warehouses/locations (racks, zones).
4. **Receipts** — incoming stock from suppliers.
5. **Delivery Orders** — outgoing stock to customers.
6. **Internal Transfers** — stock movement between locations (no net change).
7. **Stock Adjustments** — reconcile system stock vs. physical count.
8. **Stock Ledger** — immutable log of every stock-affecting event.
9. **Dashboard** — aggregated KPIs and filters.
10. **Profile** — view/update user profile, logout.

---

## 4. Database Schema (MongoDB Collections)

### 4.1 `users`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| name | String | |
| email | String | unique |
| passwordHash | String | bcrypt |
| role | String | `manager` \| `staff` |
| otp | { code: String, expiresAt: Date } | for password reset, cleared after use |
| createdAt / updatedAt | Date | |

### 4.2 `categories`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| name | String | unique |
| description | String | optional |

### 4.3 `products`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| name | String | |
| sku | String | unique, auto-generated or manual |
| category | ObjectId | ref `categories` |
| unitOfMeasure | String | e.g. kg, pcs, box |
| reorderPoint | Number | triggers low-stock alert |
| reorderQty | Number | suggested reorder quantity |
| isActive | Boolean | soft delete flag |
| createdAt / updatedAt | Date | |

### 4.4 `warehouses`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| name | String | |
| code | String | short code |
| locations | [String] | sub-locations / racks (or separate collection if granular tracking needed) |

### 4.5 `stock_levels`
Current on-hand quantity per product per location (the "live" snapshot table).
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| product | ObjectId | ref `products` |
| warehouse | ObjectId | ref `warehouses` |
| location | String | rack/zone within warehouse |
| quantity | Number | current stock |
| compound index | (product, warehouse, location) unique | prevents duplicate rows |

### 4.6 `receipts`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| receiptNo | String | auto-generated, unique |
| supplierName | String | (or ref `suppliers` if that collection is added) |
| warehouse | ObjectId | destination |
| lines | [{ product, expectedQty, receivedQty }] | |
| status | String | `draft` \| `waiting` \| `ready` \| `done` \| `canceled` |
| createdBy | ObjectId | ref `users` |
| validatedAt | Date | set when status → done (triggers stock +) |

### 4.7 `delivery_orders`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| deliveryNo | String | auto-generated, unique |
| customerName | String | |
| warehouse | ObjectId | source |
| lines | [{ product, orderedQty, pickedQty }] | |
| status | String | `draft` \| `waiting` \| `ready` \| `done` \| `canceled` |
| createdBy | ObjectId | |
| validatedAt | Date | set when status → done (triggers stock −) |

### 4.8 `internal_transfers`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| transferNo | String | |
| product | ObjectId | |
| quantity | Number | |
| fromWarehouse / fromLocation | ObjectId / String | |
| toWarehouse / toLocation | ObjectId / String | |
| status | String | `draft` \| `done` \| `canceled` |
| createdBy | ObjectId | |

### 4.9 `stock_adjustments`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| product | ObjectId | |
| warehouse / location | ObjectId / String | |
| systemQty | Number | recorded stock at time of count |
| countedQty | Number | physical count entered by user |
| difference | Number | countedQty − systemQty |
| reason | String | optional note (e.g. "damaged", "miscount") |
| createdBy | ObjectId | |
| createdAt | Date | |

### 4.10 `stock_ledger`
Append-only audit log — every event that changes `stock_levels` writes an entry here.
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| product | ObjectId | |
| warehouse / location | ObjectId / String | |
| change | Number | signed (+/−) |
| resultingQty | Number | stock after this event |
| sourceType | String | `receipt` \| `delivery` \| `transfer` \| `adjustment` |
| sourceId | ObjectId | id of the originating document |
| createdAt | Date | |

---

## 5. Business Logic Notes

- **Stock is never edited directly.** All changes to `stock_levels` happen through a single internal service function (e.g. `applyStockChange()`) that also writes a `stock_ledger` entry — this keeps the ledger authoritative and prevents drift.
- **Validation triggers movement.** Receipts/deliveries only affect stock when status transitions to `done` — not on creation. This mirrors the draft → waiting → ready → done flow from the spec.
- **Internal transfers** never change total stock, only location. Still logged for traceability.
- **Low stock alerts**: a scheduled job (or a computed field on read) compares `stock_levels.quantity` against `products.reorderPoint` per product/warehouse.
- **SKU generation**: auto-generate as `CAT-#### ` (category prefix + sequence) if the user doesn't supply one; enforce uniqueness at the DB level.

---

## 6. Non-Functional Considerations

- Use MongoDB transactions (multi-document) when a single action touches more than one collection (e.g. validating a receipt updates `receipts` **and** `stock_levels` **and** `stock_ledger`) to avoid partial writes.
- Index `stock_levels` on `(product, warehouse, location)` and `stock_ledger` on `(product, createdAt)` for dashboard queries.
- Rate-limit the OTP endpoint to prevent abuse.
- Store only `passwordHash`, never plaintext passwords; OTP codes should be short-lived (e.g. 10 min) and single-use.

See `StockSense_API_Documentation.md` for the full endpoint reference.
