const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

if (!global._mongoClientPromise) {
  global._mongoClientPromise = client.connect();
}
let clientPromise = global._mongoClientPromise;

module.exports = clientPromise;