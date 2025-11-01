const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json())

const uri = "mongodb+srv://smartdbUser:jP8IcvO4cGnoC2Ui@cluster0.unwug6n.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Smart Server is Running')
})

async function run() {
  try {
    await client.connect();

    const db = client.db('smart_db')
    const productsCollection = db.collection('products');
    const bidsCollection = db.collection('bids')
    const usersCollection = db.collection('users')

// users api

    app.post('/users', async (req, res) => {
      const newUser = req.body;

      const email = req.body.email;
      const query = { email: email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        res.send({message:"user already exists.Do not need to insert"})
      }
      else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    })

// products api

    app.get('/products', async (req, res) => {
      // const projectsFields = { title: 1, price_min: 1, price_max: 1, image: 1 }
      // const cursor = productsCollection.find().sort({ price_min: 1 }).limit(5).project(projectsFields);

      console.log(req.query)

      let query = {};

      const email = req.query.email;
      if (email) {
        query.email = email;
      }

      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/latest-products',async(req,res)=>{
      const cursor = productsCollection.find().sort({created_at: -1}).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })


    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      // const query = { _id: new ObjectId(id) }
      const query = { _id: id }
      
      const result = await productsCollection.findOne(query)
      res.send(result)
    })

   


    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    })

    app.patch('/products/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: new ObjectId(id) }
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
        }
      }

      const result = await productsCollection.updateOne(query, update)

      res.send(result)
    })

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.deleteOne(query)
      res.send(result)
    })

    // bids related api
    app.get('/bids', async (req, res) => {

      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/products/bids/:productId',async(req,res)=>{
      const productId = req.params.productId;
      const query = {product:productId}
      const cursor = bidsCollection.find(query).sort({bids_price:-1})
      const result = await cursor.toArray()
    })

    app.post('/bids', async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    })


    await client.db("admin").command({ ping: 1 });


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  finally {

  }
}

run().catch(console.dir)

app.listen(port, () => {
  console.log(`Smart server is running on Port:${port}`)
})
