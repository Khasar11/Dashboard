"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coll = exports.db = exports.client = void 0;
const { MongoClient, ServerApiVersion } = require("mongodb");
const url = 'mongodb://127.0.0.1:27017'; //192.168.120.162
exports.client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
exports.client.connect();
exports.db = exports.client.db('machines');
exports.coll = exports.db.collection('machines');
//# sourceMappingURL=MongoDB.js.map