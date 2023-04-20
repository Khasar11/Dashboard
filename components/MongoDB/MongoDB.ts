
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
