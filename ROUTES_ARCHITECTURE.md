# Protected Routes Architecture - Visual Guide

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        APLIKASI KASIR - POS SYSTEM                          │
└──────────────────────────────────────────────────────────────────────────────┘

                            FRONTEND (React/Next.js)
                    ┌─────────────────────────────────────┐
                    │   Pages & Components                 │
                    ├─────────────────────────────────────┤
                    │ • Login Page                         │
                    │ • Register Page                      │
                    │ • POS Interface                      │
                    │ • Dashboard                          │
                    │ • Menu Management                    │
                    │ • Reports                            │
                    └─────────────────────────────────────┘
                                    ↕
                    ┌─────────────────────────────────────┐
                    │  NextAuth.js Session Management     │
                    │  (JWT Tokens + Cookies)             │
                    └─────────────────────────────────────┘
                                    ↕
        ┌───────────────────────────────────────────────────────────┐
        │              API LAYER - PROTECTED ROUTES                  │
        ├───────────────────────────────────────────────────────────┤
        │                                                            │
        │  🔓 PUBLIC ENDPOINTS (No Auth Required)                   │
        │  ├─ POST /api/auth/register     ← New user signup        │
        │  └─ POST /api/auth/[...nextauth] ← User login            │
        │                                                            │
        │  ✅ PROTECTED ENDPOINTS (Auth Required)                  │
        │  ├─ GET  /api/menu               ← Fetch menu items      │
        │  ├─ POST /api/menu               ← Create menu item      │
        │  ├─ GET  /api/orders             ← Fetch orders          │
        │  ├─ POST /api/orders             ← Create order          │
        │  ├─ POST /api/payments/create-intent ← Payment intent   │
        │  └─ GET  /api/reports/daily      ← Daily reports        │
        │                                                            │
        └───────────────────────────────────────────────────────────┘
                            │  All Protected Routes
                            │  Use requireAuth()
                            ↓
        ┌───────────────────────────────────────────────────────────┐
        │          AUTHENTICATION MIDDLEWARE LAYER                   │
        │          (src/lib/apiAuth.js)                             │
        ├───────────────────────────────────────────────────────────┤
        │                                                            │
        │  requireAuth(request, options)                            │
        │  ├─ Step 1: Get session from JWT token                   │
        │  ├─ Step 2: Check if user authenticated                  │
        │  │           ├─ If not → Return 401 Unauthorized        │
        │  │           └─ If yes → Continue                         │
        │  ├─ Step 3: Check role-based access (if required)        │
        │  │           ├─ If role mismatch → Return 403 Forbidden │
        │  │           └─ If valid role → Continue                │
        │  └─ Step 4: Return session with user info                │
        │                                                            │
        └───────────────────────────────────────────────────────────┘
                                    ↓
        ┌───────────────────────────────────────────────────────────┐
        │            BUSINESS LOGIC LAYER                            │
        │  (Database Queries, Calculations, etc.)                   │
        ├───────────────────────────────────────────────────────────┤
        │                                                            │
        │  Features:                                                │
        │  ├─ Filter by userId (data isolation)                    │
        │  ├─ Connect to MongoDB                                   │
        │  ├─ Check cache (Redis)                                  │
        │  ├─ Calculate totals/tax                                 │
        │  └─ Process payments (Stripe)                            │
        │                                                            │
        └───────────────────────────────────────────────────────────┘
                                    ↓
        ┌───────────────────────────────────────────────────────────┐
        │              DATABASE & CACHE LAYER                        │
        ├───────────────────────────────────────────────────────────┤
        │                                                            │
        │  MongoDB (Primary Data Store)      Redis (Cache Layer)    │
        │  ├─ Users Collection              ├─ Menu Cache          │
        │  ├─ Menu Items                    ├─ Order Cache         │
        │  ├─ Orders                        └─ Report Cache        │
        │  └─ Subscriptions                                         │
        │                                                            │
        └───────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Scenario 1: User Registration (No Auth Required)

```
┌──────────────────┐
│  New User        │
│  Fills Form      │
└────────┬─────────┘
         │ name, email, password, businessName
         ↓
┌──────────────────────────────────────────────────────┐
│ Frontend: POST /api/auth/register                    │
│ (🔓 PUBLIC - No session required)                   │
└────────┬─────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────┐
│ Backend: app/api/auth/register/route.js             │
│                                                      │
│ ✅ No auth check (public endpoint)                  │
│ ✅ Validate input (name, email, password)           │
│ ✅ Check if email already exists                    │
│ ✅ Hash password with bcryptjs                      │
│ ✅ Create user in MongoDB                           │
│ ✅ Return success response                          │
└────────┬─────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────┐
│ Response: 201 Created                               │
│ {                                                    │
│   success: true,                                    │
│   user: { id, name, email }                         │
│ }                                                    │
│                                                      │
│ ✅ User now registered and can login               │
└──────────────────────────────────────────────────────┘
```

---

### Scenario 2: User Login

```
┌──────────────────┐
│  Registered      │
│  User            │
└────────┬─────────┘
         │ email, password
         ↓
┌──────────────────────────────────────────────────────┐
│ Frontend: /login page (NextAuth form)               │
└────────┬─────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────┐
│ NextAuth: Credentials Provider                       │
│ (🔓 PUBLIC - No session required initially)         │
│                                                      │
│ ✅ Receives email & password                        │
│ ✅ Queries MongoDB for user by email                │
│ ✅ Compares password with bcrypt                    │
│ ✅ If valid → Creates JWT token                     │
│ ✅ If invalid → Returns auth error                  │
└────────┬─────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────┐
│ NextAuth: JWT Callback                              │
│                                                      │
│ ✅ Adds user.id to token                            │
│ ✅ Adds user.role to token                          │
│ ✅ Adds user.subscription to token                  │
│ ✅ Encodes token securely                           │
└────────┬─────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────┐
│ NextAuth: Session Callback                          │
│                                                      │
│ ✅ Creates session object from JWT                  │
│ ✅ Adds user data to session                        │
│ ✅ Sets session maxAge (30 days)                    │
└────────┬─────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────┐
│ Browser: Stores session token                       │
│                                                      │
│ Cookie Details:                                     │
│ • Name: next-auth.session-token                     │
│ • Type: httpOnly (secure, JS can't access)          │
│ • Duration: 30 days                                 │
│ • Sent with every request: YES                      │
│                                                      │
│ ✅ User now logged in                              │
└──────────────────────────────────────────────────────┘
```

---

### Scenario 3: Accessing Protected Route (Logged In)

```
┌──────────────────────────────┐
│  Logged-In User              │
│  Clicks "View Menu"          │
└────────┬─────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│ Frontend: fetch('/api/menu')                       │
│                                                    │
│ 🍪 Browser automatically includes:               │
│    Cookie: next-auth.session-token=xxxxx...      │
└────────┬───────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│ Backend: app/api/menu/route.js (GET)              │
│                                                    │
│ ✅ Handler receives request with cookies         │
└────────┬───────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│ Middleware: requireAuth(request)                   │
│ [NEW - src/lib/apiAuth.js]                        │
│                                                    │
│ 1️⃣  Call getServerSession(authOptions)           │
│ 2️⃣  Get JWT from cookie                          │
│ 3️⃣  Decode and validate JWT                      │
│ 4️⃣  Extract user info from token:                │
│      {                                             │
│        user: {                                     │
│          id: "user-123",                          │
│          email: "user@example.com",               │
│          name: "John Doe",                        │
│          role: "user",                            │
│          subscription: {...}                      │
│        }                                           │
│      }                                             │
│ 5️⃣  Check if role required (e.g., admin)        │
│ 6️⃣  Return session object if valid              │
└────────┬───────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│ Business Logic: Fetch Menu Items                   │
│                                                    │
│ ✅ Connect to MongoDB                             │
│ ✅ Query with userId filter (CRITICAL):          │
│      db.menu.find({                               │
│        userId: "user-123"  ← Only user's data!   │
│      })                                            │
│ ✅ Check Redis cache first (TTL 5 minutes)       │
│ ✅ If cache miss → query DB                      │
│ ✅ Store result in cache                         │
└────────┬───────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│ Response: 200 OK                                   │
│ [                                                  │
│   {                                                │
│     _id: "menu-1",                                │
│     userId: "user-123",                           │
│     name: "Espresso",                             │
│     price: 25000,                                 │
│     category: "Coffee",                           │
│     stock: 50                                     │
│   },                                              │
│   {...}                                           │
│ ]                                                  │
│                                                    │
│ ✅ Only this user's menu items                   │
└────────────────────────────────────────────────────┘
```

---

### Scenario 4: Accessing Protected Route (NOT Logged In)

```
┌──────────────────────────────┐
│  User (No Session)           │
│  Tries to fetch menu         │
└────────┬─────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│ Frontend: fetch('/api/menu')                       │
│                                                    │
│ ❌ No session cookie included                    │
└────────┬───────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│ Backend: app/api/menu/route.js (GET)              │
│                                                    │
│ ✅ Handler receives request                      │
└────────┬───────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│ Middleware: requireAuth(request)                   │
│                                                    │
│ 1️⃣  Call getServerSession(authOptions)           │
│ 2️⃣  Try to get JWT from cookie                   │
│ 3️⃣  ❌ No cookie found → session = null         │
│ 4️⃣  Check if (session) → FALSE                   │
│ 5️⃣  Return error response immediately            │
│      (Skip all business logic!)                    │
└────────┬───────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│ Response: 401 Unauthorized                         │
│ {                                                  │
│   "error": "Unauthorized: Please login to        │
│             access this resource"                  │
│ }                                                  │
│                                                    │
│ ✅ Business logic is NEVER executed              │
│ ✅ Database is NEVER queried                     │
│ ✅ User is protected from accessing data         │
└────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│ Frontend Receives 401                              │
│                                                    │
│ ✅ JavaScript catches error                       │
│ ✅ Redirects user to /login                      │
│ ✅ Displays "Please login" message                │
└────────────────────────────────────────────────────┘
```

---

## Role-Based Access Control (RBAC) Flow

```
User Roles in Database:
├─ "admin"      → Full system access, manage all users
├─ "user"       → Access own menu/orders only
└─ "developer"  → Same as admin (for testing)

Protected Route Example:
POST /api/admin/delete-user (admin-only)

Flow:
┌─────────────────────────────┐
│ requireAuth(request, {      │
│   requiredRoles: ["admin"]  │
│ })                          │
└────────┬────────────────────┘
         │
         ├─ Step 1: Validate session (same as before)
         │
         ├─ Step 2: Check requiredRoles
         │
         ├─ Step 3: Compare user.role to requiredRoles
         │
         └─ Step 4: Decide
              ├─ ✅ user.role = "admin"
              │   └─ PASS → Return session
              │
              ├─ ❌ user.role = "user"
              │   └─ FAIL → Return 403 Forbidden
              │
              └─ ❌ user.role = "premium"
                  └─ FAIL → Return 403 Forbidden
```

---

## Session Token Contents

```
JWT Token (Stored in httpOnly Cookie)
│
├─ Header
│  ├─ alg: "HS256"
│  └─ typ: "JWT"
│
├─ Payload
│  ├─ sub: "user-123"
│  ├─ email: "user@example.com"
│  ├─ name: "John Doe"
│  ├─ role: "user"
│  ├─ subscription: {
│  │   plan: "free",
│  │   status: "inactive"
│  │ }
│  ├─ iat: 1731551234 (issued at)
│  └─ exp: 1734229634 (expires in 30 days)
│
└─ Signature (Secret: NEXTAUTH_SECRET)
   └─ HMACSHA256(header.payload, secret)
```

---

## File Structure

```
src/lib/
├── apiAuth.js ✨ NEW
│   └─ requireAuth() function
│       ├─ Validates session
│       ├─ Checks roles
│       └─ Returns standardized errors
│
├── mongodb.js
│   └─ Database connection pooling
│
└── redis.js
    └─ Cache helper functions

app/api/
├── auth/
│   ├── [...nextauth]/route.js (unchanged)
│   │   └─ NextAuth configuration
│   │
│   └── register/route.js (updated)
│       ├─ 🔓 PUBLIC endpoint
│       └─ Uses requireAuth? NO
│
├── menu/route.js (updated) ✨
│   ├─ GET: fetch menu
│   ├─ POST: create menu
│   └─ Both use requireAuth()
│
├── orders/route.js (updated) ✨
│   ├─ GET: fetch orders
│   ├─ POST: create order
│   └─ Both use requireAuth()
│
├── payments/
│   └── create-intent/route.js (updated) ✨
│       └─ Uses requireAuth()
│
└── reports/
    └── daily/route.js (updated) ✨
        └─ Uses requireAuth()
```

---

## Cache Invalidation Pattern

```
User Creates Menu Item:
┌──────────────────────────────┐
│ POST /api/menu               │
│ (Create new item)            │
└─────────────┬────────────────┘
              │
              ↓
        ┌──────────────────────┐
        │ Database Update      │
        │ (Item created)       │
        └──────────┬───────────┘
                   │
                   ↓
        ┌──────────────────────────────────────────┐
        │ Cache Invalidation                       │
        │                                          │
        │ invalidatePattern(                       │
        │   `menu:${userId}:*`                     │
        │ )                                        │
        │                                          │
        │ This removes ALL cached menu queries     │
        │ for this user:                           │
        │ • menu:user-123:all                     │
        │ • menu:user-123:beverages               │
        │ • menu:user-123:all:coffee              │
        │ • etc.                                   │
        └─────────────┬────────────────────────────┘
                      │
                      ↓
        ┌──────────────────────────────────────────┐
        │ Next API Call                            │
        │                                          │
        │ User refreshes menu page                │
        │ → Cache miss (invalidated)              │
        │ → Query fresh data from DB              │
        │ → Return latest items                   │
        │ → Cache new result                      │
        └──────────────────────────────────────────┘
```

---

## Error Response Examples

```
❌ 401 Unauthorized (No Session)
┌──────────────────────────────────────────────┐
│ {                                            │
│   "error": "Unauthorized: Please login to   │
│             access this resource"            │
│ }                                            │
│ HTTP Status: 401                             │
│                                              │
│ Cause: No valid session token               │
│ Fix: User must log in                       │
└──────────────────────────────────────────────┘

❌ 403 Forbidden (Insufficient Permissions)
┌──────────────────────────────────────────────┐
│ {                                            │
│   "error": "Forbidden: You do not have      │
│             permission to access this       │
│             resource",                       │
│   "requiredRoles": ["admin"],                │
│   "userRole": "user"                         │
│ }                                            │
│ HTTP Status: 403                             │
│                                              │
│ Cause: User doesn't have required role      │
│ Fix: Request must be made by admin user     │
└──────────────────────────────────────────────┘

❌ 500 Internal Server Error
┌──────────────────────────────────────────────┐
│ {                                            │
│   "error": "Internal server error:          │
│             Authentication failed"           │
│ }                                            │
│ HTTP Status: 500                             │
│                                              │
│ Cause: Unexpected error during auth        │
│ Fix: Check server logs & NEXTAUTH_SECRET   │
└──────────────────────────────────────────────┘
```

---

## Quick Reference

| Route | Method | Auth | Role Required | Purpose |
|-------|--------|------|---------------|---------|
| `/api/auth/register` | POST | 🔓 No | - | New user registration |
| `/api/auth/[...nextauth]` | GET/POST | 🔓 No | - | Login handler |
| `/api/menu` | GET | ✅ Yes | user | Fetch user's menu items |
| `/api/menu` | POST | ✅ Yes | user | Create menu item |
| `/api/orders` | GET | ✅ Yes | user | Fetch user's orders |
| `/api/orders` | POST | ✅ Yes | user | Create new order |
| `/api/payments/create-intent` | POST | ✅ Yes | user | Stripe payment intent |
| `/api/reports/daily` | GET | ✅ Yes | user | Daily sales report |

---

This diagram should help visualize how protected routes work in your system!
