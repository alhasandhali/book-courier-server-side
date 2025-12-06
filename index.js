require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-1.dymuola.mongodb.net/?appName=Cluster-1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
});

async function run() {
  try {
    // await client.connect();
    console.log("Connected to MongoDB");

    // const db = client.db("plateShare_db");
    // const foodsCollection = db.collection("foods");
    // const userCollection = db.collection("user");
    // const requestedFoodCollection = db.collection("food_requests");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

// Get method
app.get("/", (req, res) => res.send("Server is running"));

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
