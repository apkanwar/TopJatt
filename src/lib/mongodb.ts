import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI_LOCAL!;
const client = new MongoClient(uri);

declare global {
  // Prevent re-declaration errors in development
  var _mongoClientPromise: Promise<MongoClient>;
}

let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;
