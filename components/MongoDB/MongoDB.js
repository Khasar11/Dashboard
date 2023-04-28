"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coll = exports.db = exports.mongoClient = void 0;
const mongodb_1 = require("mongodb");
const url = 'mongodb://127.0.0.1:27017'; //192.168.120.162
exports.mongoClient = new mongodb_1.MongoClient(url, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
exports.mongoClient.connect();
exports.db = exports.mongoClient.db('machines');
exports.coll = exports.db.collection('machines');
//# sourceMappingURL=MongoDB.js.map