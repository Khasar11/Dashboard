
import { MongoClient, ServerApiVersion } from "mongodb";

const url = 'mongodb://127.0.0.1:27017'; //192.168.120.162

export const mongoClient = new MongoClient(url,  {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

mongoClient.connect()

export const db = mongoClient.db('machines')
export const coll = db.collection('machines')


