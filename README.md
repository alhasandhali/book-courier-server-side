# ⚙️ BookCourier - Server Side API

The **BookCourier Server** is the robust backend backbone of the BookCourier ecosystem. Built with **Node.js, Express, and MongoDB**, it manages the complex data flow between users, librarians, and administrators, ensuring secure and efficient operations for borrowing, buying, and managing books.

## 🚀 Live API Base URL
**Production**: `https://bookcourier-server-side-cg1i69qjl-al-hasan-dhalis-projects.vercel.app` (Example)
> *Note: This API is meant to be consumed by the BookCourier Client Application.*

## 🌟 Key Features

### 🔐 Security & Authentication
- **Firebase Integration**: Validates **Firebase ID Tokens** via middleware to authenticate users securely.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full access to user management, system statistics, and content moderation.
  - **Librarian**: Access to book inventory management and order processing.
  - **User**: Protected access to personal orders, payments, and wishlists.
- **Environment Security**: Sensitive credentials (DB URI, Firebase Keys) manage via environment variables.

### 📚 Inventory & Stock Management
- **Dynamic Stock Updates**:
  - **Automated Stock Decrement**: Book stock is *automatically* reduced server-side immediately upon successful payment validation to prevent overselling.
  - **Manual Adjustments**: Librarians can manually update stock levels for inventory corrections.
- **Rich Querying**: API supports searching, filtering (by category/status), and sorting (by price) for the book catalog.

### 💳 Transactions & Orders
- **Payment Processing**: Secure endpoint (`/payment`) that records transactions and triggers stock updates atomically.
- **Order Lifecycle**: Tracks orders from "Pending" to "Paid" to "Returned".
- **Revenue tracking**: Aggregates total revenue for administrative insights.

### 📊 Analytics & BI
- **Admin Dashboard Data**: Provides real-time counts of users, books, orders, and total revenue.
- **Order Statistics**: Aggregates orders by status to visualize performance (e.g., number of active vs. returned orders).

---

## 🛠️ Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Native Driver)
- **Auth**: [Firebase Admin SDK](https://firebase.google.com/docs/admin)
- **Deployment**: Vercel (Serverless)

---

## 📡 API Endpoints Overview

| Category | Endpoint | Method(s) | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/jwt` | `POST` | (Handled via Firebase on Client) | Public |
| **Users** | `/users` | `GET` | Get all users | Admin |
| | `/user/:email` | `GET` | Get user details | Self/Admin |
| **Books** | `/books` | `GET` | Get all books (with query params) | Public |
| | `/book` | `POST` | Add a new book | Librarian |
| | `/book/:id` | `PATCH` | Update book details | Librarian |
| | `/book/stock/:id`| `PATCH` | Update specific stock count | Librarian |
| **Orders** | `/orders` | `GET` | Get all orders | Admin |
| | `/order` | `POST` | Create an order | User |
| **Payment**| `/payment` | `POST` | Process payment & update stock | User |
| **Stats** | `/admin/stats` | `GET` | System-wide statistics | Admin |

---

## ⚙️ Local Development Setup

clone the repository and navigate to the server directory.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory with the following credentials:
```env
PORT=5000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
FIREBASE_SERVICE_KEY=your_base64_encoded_service_account_json
```
> **Tip**: Use `node encode.js` (if available) to generate the base64 string for your Firebase service account JSON.

### 3. Run the Server
```bash
# Development Mode (with nodemon)
npm run dev

# Production Mode
npm start
```

---

## 📦 Deployment
This project is configured for **Vercel** deployment.
- Ensure `vercel.json` is configured correctly.
- Add environment variables in the Vercel Project Settings.
- Push to main/master to trigger deployment.
