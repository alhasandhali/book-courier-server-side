# 📖 BookCourier - The Ultimate Bookstore Ecosystem

![BookCourier Banner](home-page.png)

BookCourier is a state-of-the-art, full-stack bookstore platform that bridges the gap between readers, librarians, and administrators. It provides a seamless e-commerce experience combined with powerful management tools, real-time analytics, and a premium user interface. This repository contains the **Server-Side** implementation.

## 🔗 Project Links

- 🌐 **Live Application**: [https://book-courier.vercel.app/](https://book-courier.vercel.app/)
- 💻 **Client-Side Repository**: [https://github.com/alhasandhali/book-courier-client-side.git](https://github.com/alhasandhali/book-courier-client-side.git)
- 🖥️ **Server-Side Repository**: [https://github.com/alhasandhali/book-courier-server-side.git](https://github.com/alhasandhali/book-courier-server-side.git)

---

## 📋 Project Details

BookCourier is designed to be a comprehensive solution for modern book management and sales. It features a robust role-based system:

### 👤 User Roles
- **Readers (Users):** Browse books, manage wishlists, place orders, and provide reviews. High-performance search and filtering enhance the discovery process.
- **Librarians:** Responsible for catalog curation, stock management, and order processing. They can update return dates and monitor inventory levels.
- **Administrators:** Oversee the entire platform, including user management (promoting/demoting users) and system-wide performance analytics.

### 🌟 Key Features
- **Secure Authentication:** Integrated with Firebase Auth for seamless login and JWT-based session security.
- **Dynamic Inventory:** Real-time stock updates. Inventory is automatically decremented upon successful payment to prevent over-orders.
- **Advanced UI/UX:** Built with React 19, Tailwind CSS 4, and DaisyUI 5 for a premium, responsive experience.
- **Real-time Ratings:** A dynamic rating system that automatically recalculates average scores as users submit reviews.
- **Interactive Locations:** Leaflet map integration to show physical warehouse or library locations.
- **Financial Analytics:** Admin dashboard with real-time revenue tracking and order statistics.

---

## 🚀 Installation & Setup (Server-Side)

Follow these steps to set up the backend locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alhasandhali/book-courier-server-side.git
   cd book-courier-server-side
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   DB_USER=your_mongodb_username
   DB_PASS=your_mongodb_password
   FIREBASE_SERVICE_KEY=your_base64_encoded_service_account_json
   ```
   *(Note: The `FIREBASE_SERVICE_KEY` should be the base64 encoded string of your Firebase Service Account JSON file.)*

4. **Run the server:**
   - **Development Mode:** `npm run dev`
   - **Production Mode:** `npm start`

---

## 📁 Project Structure (Server-Side)

```text
book-courier-server-side/
├── index.js              # Main entry point with all API routes and logic
├── package.json          # Project dependencies and scripts
├── vercel.json           # Vercel deployment configuration
├── .env                  # Environment variables (not committed)
├── .gitignore            # Files to ignore in Git
├── home-page.png         # README banner image
└── encode.js             # Utility to encode Firebase service key to base64
```

---

## 📡 API Endpoints

| Category | Endpoint | Method | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Users** | `/users` | `GET` | Get all users | Admin |
| | `/user/email/:email` | `GET` | Get user by email | User/Admin |
| | `/user` | `POST` | Create new user profile | Public |
| | `/user/:id` | `PATCH` | Update user details | User/Admin |
| **Books** | `/books` | `GET` | Get books (supports search/filter/sort) | Public |
| | `/book/:id` | `GET` | Get detailed book info | Public |
| | `/book` | `POST` | Add new book | Librarian/Admin |
| | `/book/stock/:id` | `PATCH` | Update stock quantity | Librarian/Admin |
| **Orders** | `/orders` | `GET` | Retrieve orders | User/Admin |
| | `/order` | `POST` | Place a new order | User |
| | `/order/return-day/:id` | `PATCH` | Update return schedule | Librarian/Admin |
| **Payments**| `/payment` | `POST` | Process payment & update stock | User |
| **Stats** | `/admin/stats` | `GET` | System-wide statistics | Admin |
| **Reviews** | `/reviews` | `GET` | Get reviews by book ID | Public |
| | `/review` | `POST` | Post a review | User |

---

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Native Driver)
- **Authentication:** Firebase Admin SDK & Firebase Auth
- **Deployment:** Vercel

---

## 📄 License
Developed for the PHW BookCourier project. All rights reserved.
