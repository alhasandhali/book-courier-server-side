# ⚙️ BookCourier - Robust Backend API (Server Side)

The BookCourier Server is a performant and secure backend system designed to power the BookCourier ecosystem. It leverages Node.js, Express, and MongoDB to handle complex data relationships, authentication, and role-based access control.

## 🌟 Core Functionalities

### 🔐 Security & Access Control
- **Firebase Token Verification**: Custom middleware validates incoming Bearer tokens using the **Firebase Admin SDK**, ensuring only authenticated users can access private resources.
- **Granular RBAC (Role-Based Access Control)**: 
  - `verifyAdmin`: Restricts sensitive endpoints (User management, Global stats) to administrators only.
  - `verifyLibrarian`: Grants book management permissions to librarians and admins.
  - **Shared Access**: Routes that both Librarians and Admins can manage.

### 📚 Resource Management (CRUD)
- **Books API**:
  - Advanced querying: Search by keyword, filter by category/status, and sort by price.
  - Ownership tracking: Books are linked to the librarian who added them.
- **Orders & Transactions**:
  - Secure order placement and status updates (Pending, Issued, Returned).
  - Payment tracking with aggregate revenue calculation.
- **User Ecosystem**:
  - Auto-registration of new users into the MongoDB database upon first login.
  - Patching user roles and profile information via secure endpoints.
- **Reviews & Personalization**:
  - Support for book reviews to build a community-driven platform.
  - Wishlist management for users to curate their interests.

### 📊 Business Intelligence & Aggregation
- **Admin Stats**: Real-time aggregation of:
  - Total Estimated Document Counts for Users, Books, and Orders.
  - Total Revenue calculated from transaction history.
- **Order Analytics**: Aggregates group counts by order status (e.g., how many books are currently "Issued").

## 🛠️ Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (NoSQL)
- **Authentication**: [Firebase Admin SDK](https://firebase.google.com/docs/admin)
- **Environment**: [Dotenv](https://www.npmjs.com/package/dotenv) for secure configuration.
- **Deployment**: Optimized for **Vercel** serverless functions.

## 📡 Essential Endpoints

| Resource | Methods | Key Endpoints | Access |
| :--- | :--- | :--- | :--- |
| **Users** | `GET`, `POST`, `PATCH`, `DELETE` | `/users`, `/user/email/:email` | Admin / Self |
| **Books** | `GET`, `POST`, `PATCH`, `DELETE` | `/books`, `/book/:id` | Public / Staff |
| **Orders** | `GET`, `POST`, `PATCH`, `DELETE` | `/orders`, `/order/:id` | Admin / Staff / User |
| **Payments**| `GET`, `POST`, `PATCH` | `/payments`, `/payment` | Staff / User |
| **Stats** | `GET` | `/admin/stats`, `/order-stats` | Admin |
| **Wishlist**| `GET`, `POST`, `DELETE` | `/wishlist`, `/wishlist/:id` | Private (Self) |

## 🚀 Setup & Deployment

1. **Environment Variables**: Create a `.env` file in the root:
   ```env
   PORT=5000
   DB_USER=your_mongodb_username
   DB_PASS=your_mongodb_password
   FIREBASE_SERVICE_KEY=your_base64_encoded_service_account_json
   ```
2. **Firebase Setup**:
   - Download your Service Account JSON from Firebase Console.
   - Use the `encode.js` utility (or `Buffer.from(JSON.stringify(key)).toString('base64')`) to convert it into a single-line string for your `.env`.
3. **Execution**:
   ```bash
   npm install
   npm run dev  # For development with nodemon
   npm start    # For production
   ```

---

Developed for scalability and performance.
