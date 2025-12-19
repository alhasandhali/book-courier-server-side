require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
var admin = require("firebase-admin");
const port = process.env.PORT || 5000;

if (process.env.FIREBASE_SERVICE_KEY) {
  const decoded = Buffer.from(
    process.env.FIREBASE_SERVICE_KEY,
    "base64"
  ).toString("utf8");
  const serviceAccount = JSON.parse(decoded);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.warn("Warning: FIREBASE_SERVICE_KEY not found.");
}

// middleware
app.use(cors());
app.use(express.json());

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const userInfo = await admin.auth().verifyIdToken(idToken);
    req.token_email = userInfo.email;
    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    return res.status(401).send({ message: "Unauthorized: Invalid token" });
  }
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-1.dymuola.mongodb.net/?appName=Cluster-1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("bookcourier");
    const usersCollection = db.collection("users");
    const booksCollection = db.collection("books");
    const ordersCollection = db.collection("orders");
    const paymentsCollection = db.collection("payments");
    const reviewsCollection = db.collection("reviews");
    const wishlistsCollection = db.collection("wishlists");

    // --- Middlewares ---
    const verifyAdmin = async (req, res, next) => {
      const email = req.token_email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role === "admin") {
        next();
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    };

    const verifyLibrarian = async (req, res, next) => {
      const email = req.token_email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role === "librarian" || user?.role === "admin") {
        next();
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    };

    // --- Users Routes ---

    // Get all users (Admin only)
    app.get("/users", verifyFirebaseToken, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Get user by email
    app.get("/user/email/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }
        res.send(user);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Post user
    app.post("/user", async (req, res) => {
      try {
        const newUser = req.body;
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Update user
    app.patch("/user/:id", verifyFirebaseToken, async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: req.body,
        };
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Delete user
    app.delete("/user/:id", verifyFirebaseToken, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // --- Books Routes ---

    // Get all books (Public: supports search, category, sort, status)
    app.get("/books", async (req, res) => {
      try {
        const { category, sort, search, status } = req.query;
        let query = {};

        if (category) query.category = category;
        if (status) query.status = status;
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } },
          ];
        }

        let cursor = booksCollection.find(query);
        if (sort) {
          const sortOrder = sort === "asc" ? 1 : -1;
          cursor = cursor.sort({ price: sortOrder });
        }
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Get single book
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

    // Post book (Librarian/Admin)
    app.post(
      "/book",
      verifyFirebaseToken,
      verifyLibrarian,
      async (req, res) => {
        try {
          const newBook = req.body;
          // Basic validation
          if (!newBook.title || !newBook.author || !newBook.price) {
            return res.status(400).send({ message: "Missing required fields" });
          }
          newBook.createdAt = new Date();
          const result = await booksCollection.insertOne(newBook);
          res.send(result);
        } catch (err) {
          res.status(500).send({ error: err.message });
        }
      }
    );

    // Update Book (Librarian/Admin)
    app.patch(
      "/book/:id",
      verifyFirebaseToken,
      verifyLibrarian,
      async (req, res) => {
        try {
          const { id } = req.params;
          const updateData = req.body;
          const filter = { _id: new ObjectId(id) };
          const updateDoc = { $set: updateData };
          const result = await booksCollection.updateOne(filter, updateDoc);
          res.send(result);
        } catch (err) {
          res.status(500).send({ error: err.message });
        }
      }
    );

    // Delete book (Admin only)
    app.delete(
      "/book/:id",
      verifyFirebaseToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await booksCollection.deleteOne(query);
        res.send(result);
      }
    );

    // --- Orders Routes ---

    // Get all orders
    app.get("/orders", verifyFirebaseToken, async (req, res) => {
      const { email } = req.query;
      let query = {};
      if (email) {
        query.email = email;
      }
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    // Post Order
    app.post("/order", verifyFirebaseToken, async (req, res) => {
      try {
        const newOrder = req.body;
        newOrder.createdAt = new Date();
        const result = await ordersCollection.insertOne(newOrder);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Update order
    app.patch("/order/:id", verifyFirebaseToken, async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: req.body,
        };
        const result = await ordersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Delete order (Admin only)
    app.delete(
      "/order/:id",
      verifyFirebaseToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await ordersCollection.deleteOne(query);
          res.send(result);
        } catch (err) {
          res.status(500).send({ error: err.message });
        }
      }
    );

    // --- Stats Routes ---

    // Get Admin Stats
    app.get(
      "/admin/stats",
      verifyFirebaseToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const users = await usersCollection.estimatedDocumentCount();
          const books = await booksCollection.estimatedDocumentCount();
          const orders = await ordersCollection.estimatedDocumentCount();

          // Calculate revenue (simple aggregation)
          const payments = await paymentsCollection.find().toArray();
          const revenue = payments.reduce(
            (total, payment) => total + (payment.price || 0),
            0
          );

          res.send({
            users,
            books,
            orders,
            revenue,
          });
        } catch (err) {
          res.status(500).send({ error: err.message });
        }
      }
    );

    // Get Order Stats (Aggregate by status)
    app.get(
      "/order-stats",
      verifyFirebaseToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const result = await ordersCollection
            .aggregate([
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  status: "$_id",
                  count: 1,
                },
              },
            ])
            .toArray();
          res.send(result);
        } catch (err) {
          res.status(500).send({ error: err.message });
        }
      }
    );

    // --- Payments Routes ---

    // Get all payments (or by email)
    app.get("/payments", verifyFirebaseToken, async (req, res) => {
      const { email } = req.query;
      let query = {};
      if (email) {
        query.email = email;
      }
      const result = await paymentsCollection.find(query).toArray();
      res.send(result);
    });

    // Post Payment
    app.post("/payment", verifyFirebaseToken, async (req, res) => {
      try {
        const newPayment = req.body;
        newPayment.createdAt = new Date();
        const result = await paymentsCollection.insertOne(newPayment);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Update payment
    app.patch("/payment/:id", verifyFirebaseToken, async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: req.body,
        };
        const result = await paymentsCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Delete payment
    app.delete("/payment/:id", verifyFirebaseToken, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await paymentsCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // --- Reviews Routes ---

    // Get reviews (by book_id)
    app.get("/reviews", async (req, res) => {
      const { book_id } = req.query;
      let query = {};
      if (book_id) {
        query.book_id = book_id; // Assuming you store book_id in review
      }
      const result = await reviewsCollection.find(query).toArray();
      res.send(result);
    });

    // Post Review
    app.post("/review", verifyFirebaseToken, async (req, res) => {
      try {
        const newReview = req.body;
        newReview.createdAt = new Date();
        const result = await reviewsCollection.insertOne(newReview);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Update review
    app.patch("/review/:id", verifyFirebaseToken, async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: req.body,
        };
        const result = await reviewsCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Delete review
    app.delete("/review/:id", verifyFirebaseToken, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await reviewsCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // --- Wishlist Routes ---

    // Get wishlist (by user email)
    app.get("/wishlist", verifyFirebaseToken, async (req, res) => {
      const { email } = req.query;
      let query = {};
      if (email) {
        query.email = email;
      }
      const result = await wishlistsCollection.find(query).toArray();
      res.send(result);
    });

    // Add to wishlist
    app.post("/wishlist", verifyFirebaseToken, async (req, res) => {
      try {
        const item = req.body;
        // Optional: Check duplicates
        const exists = await wishlistsCollection.findOne({
          email: item.email,
          book_id: item.book_id,
        });
        if (exists) {
          return res.send({ message: "Already in wishlist" });
        }
        const result = await wishlistsCollection.insertOne(item);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Update wishlist
    app.patch("/wishlist/:id", verifyFirebaseToken, async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: req.body,
        };
        const result = await wishlistsCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Remove from wishlist
    app.delete("/wishlist/:id", verifyFirebaseToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistsCollection.deleteOne(query);
      res.send(result);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

app.get("/", (req, res) => res.send("BookCourier Server is running"));

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

module.exports = app;
