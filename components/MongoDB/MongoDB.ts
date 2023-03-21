
const { MongoClient, ServerApiVersion } = require("mongodb");

const url = 'mongodb://127.0.0.1:27017'; //192.168.120.162

export const client = new MongoClient(url,  {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}
);

client.connect()

export const db = client.db('machines')
export const coll = db.collection('machines')


/*
async function run() {
    try {
      // Connect the client to the server (optional starting in v4.7)
      console.log("MongoDB trying client.connect()");
      await client.connect();
      console.log("MongoDB connect");
      db = client.db('machines')
      coll = db.collection('machines')
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
      console.log("MongoDB close");
    }
  }
  run().catch(console.dir); */
