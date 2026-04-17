# Mama Fresh - Logistics & Impact Engine

The backend API and logistics engine for Mama Fresh, built with **Django** and **Django REST Framework (DRF)**. This service handles order processing, automated vendor rotation, batching logistics, and impact analytics.

## 🚀 Key Features

- **Automated Vendor Rotation**: Logic to split orders among multiple village vendors based on reliability scores and fair participation.
- **Logistics Batching**: Aggregates customer orders into town-based batches for efficient courier dispatch.
- **Referral System**: Handles code generation, validation, and KES 50 credit application.
- **Analytics Engine**: Real-time calculation of "Food Miles Saved," rural income, and individual farmer performance.
- **WhatsApp Integration**: Formats order and dispatch details for manual/semi-automated manager forwarding.

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.10+
- `pip`

### Installation
1. Navigate to the backend directory:
   ```bash
   cd mama-fresh-backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Database Setup:
   ```bash
   python manage.py migrate
   ```

### Seeding Data
To populate the database with initial products, packages, and coordinators:
```bash
python seed_all.py
```

### Running the Server
```bash
python manage.py runserver
```

## 📡 API Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/orders/` | POST | Place a customer order. |
| `/api/admin/analytics/` | GET | Fetch live impact and income metrics. |
| `/api/admin/batches/` | POST | Trigger the logistics batching engine. |
| `/api/config/` | GET | Fetch site-wide branding and mission data. |
| `/api/towns/` | GET | List available delivery zones and fees. |

---
*Built for the Acumen Academy Green RISE Fellowship 2026.*
