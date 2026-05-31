# Nongor Boutique Pro (Update)

This is a premium, high-fidelity UI-only prototype of the **Nongor Boutique** application. All interactions, dynamic behaviors, stores, and states are driven by mock data and browser `localStorage`.

---

> [!WARNING]
>
> ### 🔒 Mock Authentication & Security Disclaimer
>
> The admin login flow implemented inside this repository utilizes local browser state and `localStorage` (`nongor_admin_auth` and `nongor_orders` keys).
> This is a **UI-only mock authentication mechanism** meant for prototyping and visual demonstration purposes.
> **DO NOT** use this method for production security. Before launching to production, this must be integrated with a robust secure authentication backend (such as Supabase Auth or a secure OAuth provider) and server-side route guarding.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm, yarn, bun, or pnpm

### Installation

```bash
npm install
# or
bun install
```

### Running Locally

```bash
npm run dev
# or
bun run dev
```

### Production Build

```bash
npm run build
```

---

## 🛠️ Implemented Features

1. **Mock Admin Login Gate**
   - Public access to the Admin Panel from the customer-facing mobile menu has been removed.
   - An elegant, brand-aligned admin login page is accessible at `/admin/login`.
   - Credentials (Mock):
     - **Email:** `admin@nongor.com`
     - **Password:** `nongor2024`

2. **Functional Search & Filters**
   - The navbar search filters products or routes them straight to the shop page with a query parameter.
   - Added category, occasion, availability, and keyword filters to the shop page.
   - Sort products by price, name, or newest (using simulated `createdAt` dates).
   - "Clear Filters" button to reset all states easily.

3. **Checkout Validation & Order Flow**
   - Frontend validation for all billing/shipping details (Name, Phone, District, Upazila, Address, Payment Method).
   - Bangladeshi mobile format validation (`^(?:\+88|88)?(01[3-9]\d{8})$`).
   - Requiring Transaction ID (`TrxID`) for bKash, Nagad, and Rocket before order completion.
   - Saves client checkout-created orders directly into the shared `nongor_orders` localStorage key so they automatically show up on the Admin Dashboard and Admin Orders table.

4. **Product Stock Controls**
   - Product-level stock management.
   - Out-of-stock overlay on Product Cards, and disabled buttons/controls if a product's stock is exhausted.
   - Stock deduction limits on the Quantity picker in the product details page.

5. **Payment Approvals**
   - Inside the admin payment dashboard, approving a customer's bKash/Nagad/Rocket transaction automatically updates the `paymentStatus` to `Paid`.
   - If the order was in a `Pending` state, verifying and approving its payment will automatically promote it to `Confirmed`.
