"use strict";
exports.__esModule = true;
exports.coll = exports.db = exports.client = void 0;
var _a = require("mongodb"), MongoClient = _a.MongoClient, ServerApiVersion = _a.ServerApiVersion;
var url = 'mongodb://127.0.0.1:27017'; //192.168.120.162
exports.client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});
exports.client.connect();
exports.db = exports.client.db('machines');
exports.coll = exports.db.collection('machines');
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
