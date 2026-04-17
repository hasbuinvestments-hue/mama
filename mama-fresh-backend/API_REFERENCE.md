# API Reference - Mama Fresh Logistics Engine

This document provides technical details for the Mama Fresh backend API. It is designed for developers building clients (Web, Mobile) or integrating third-party logistics tools.

## 🔑 Base Configuration
- **Base URL**: `http://localhost:8000`
- **Default Content-Type**: `application/json`
- **Authentication**: Coordinator endpoints require a valid Town + PIN combination.

---

## 🛍️ Consumer Endpoints

### 1. Place Order
Used by the storefront to submit a customer checkout.

- **URL**: `/api/orders/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "customerName": "Jane Doe",
    "phone": "254700000000",
    "location": "Upper Hill, Nairobi",
    "zone": "Nairobi",
    "is_express": false,
    "referral_code": "MAMA50",
    "cart": [
      { "id": "1", "name": "Tomatoes", "price": "150", "quantity": 2, "unit": "kg" },
      { "id": "pkg-1", "name": "Nyumbani Lite", "price": "3500", "quantity": 1 }
    ]
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "order_id": "CUS-8A2F9B10",
    "status": "SAVED",
    "carbon_saved": 4.2,
    "discount_applied": 50
  }
  ```

### 2. Order History
Retrieves recent orders based on the user's IP (anonymous tracking).

- **URL**: `/api/orders/history/`
- **Method**: `GET`

---

## 🚛 Logistics & Coordinator Endpoints

### 1. Coordinator Login
Validates a town coordinator's credentials.

- **URL**: `/api/coordinators/login/`
- **Method**: `POST`
- **Request Body**:
  ```json
  { "town": "Nairobi", "pin": "1234" }
  ```

### 2. Create Order Batch
Aggregates all `PENDING` orders into a new logistics batch.

- **URL**: `/api/admin/batches/`
- **Method**: `POST`
- **Logic**: Automatically splits product quantities among all active and verified vendors in the source town.

### 3. Batch Assignments
Retrieves the breakdown of which vendors need to provide which products for a specific batch.

- **URL**: `/api/admin/batches/{id}/assignments/`
- **Method**: `GET`
- **Response Example**:
  ```json
  {
    "batch": { "id": 12, "status": "OPEN", "is_express": false },
    "towns": [
      {
        "town": "Chuka",
        "coordinator": { "name": "John Doe", "whatsapp": "254711..." },
        "assignments": [
          { "vendor_name": "Mary Farmer", "product_name": "Sukuma", "quantity": "15.0", "unit": "kg" }
        ]
      }
    ]
  }
  ```

### 4. Rebalance Assignment
Redistributes a vendor's assigned quantity to other active vendors if the original vendor is absent.

- **URL**: `/api/admin/batches/{id}/rebalance/`
- **Method**: `POST`
- **Request Body**:
  ```json
  { "town": "Chuka", "product_name": "Sukuma" }
  ```

---

## 🌍 Impact & Configuration

### 1. Analytics
Live stats for the public Impact page and Admin dashboard.

- **URL**: `/api/admin/analytics/`
- **Method**: `GET`
- **Key Fields**:
    - `totalRuralIncome`: Total KES paid to farmers across all confirmed orders.
    - `foodMilesSaved`: Estimated kms saved by village-direct sourcing.
    - `farmerEarnings`: Array of top-performing farmers with order counts and income.

### 2. Site Configuration
Branding and impact override values.

- **URL**: `/api/config/`
- **Method**: `GET`

---

## 🧠 Logistics Logic Explained

### Vendor Rotation & Reliability
Mama Fresh uses a **Reliability Score** (0-100) to ensure high service standards:
- **Starting Score**: 100.
- **Deduction**: -10 points per resolved complaint.
- **Rotation**: The `assign_vendors_to_order` logic prioritizes vendors with higher scores and those who haven't been assigned recently (`last_assigned_at`).

### Carbon Savings Calculation
We use a flat-rate estimate of **4.2kg CO2 saved per order**. This is based on:
1.  Eliminating 3-4 middlemen logistics legs.
2.  Reducing cold-chain storage duration.
3.  Sourcing within a 50km radius of the Town Hub.

---
*Built for the Acumen Academy Green RISE Fellowship 2026.*
