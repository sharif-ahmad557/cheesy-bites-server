const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// মিডলওয়্যার
app.use(cors());
app.use(express.json());

// কানেকশন স্ট্রিং
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ezpklr.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // সার্ভার কানেক্ট করা
    await client.connect();

    const database = client.db("cheesybites");
    const menuCollection = database.collection("menu");

    // ১. সব মেনু পাওয়ার API
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });

    // ২. নির্দিষ্ট একটি মেনু পাওয়ার API (নতুন যোগ করা হয়েছে)
    // ২. নির্দিষ্ট একটি মেনু পাওয়ার API (Safe Version)
    app.get("/menu/:id", async (req, res) => {
      try {
        const id = req.params.id;
        // আইডি ভ্যালিড কিনা চেক করা হচ্ছে
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: "Invalid ID format" });
        }

        const query = { _id: new ObjectId(id) };
        const result = await menuCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Server Error" });
      }
    });

    // ৩. মেনু অ্যাড করার API
    app.post("/menu", async (req, res) => {
      const item = req.body;
      const result = await menuCollection.insertOne(item);
      res.send(result);
    });

    // কানেকশন চেক
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Cheesy Bites server is running properly!");
});

app.listen(port, () => {
  console.log(`Cheesy Bites server started on port ${port}`);
});
