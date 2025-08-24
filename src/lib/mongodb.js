// src/lib/mongodb.js
const { MongoClient } = require("mongodb");

let _client;
let _clientPromise;

/** Lazily create (and cache) a MongoClient connection promise. */
async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. In prod, set it in ECS Task env/secrets; " +
      "in dev, set it in .env.local. Also avoid DB work during `next build`."
    );
  }
  if (!_clientPromise) {
    _client = new MongoClient(uri);
    _clientPromise = _client.connect();
  }
  return _clientPromise;
}

/** Convenience: get a DB handle (defaults to 'my_app'). */
async function getDb(name = "my_app") {
  const client = await getMongoClient();
  return client.db(name);
}

/**
 * Default export: a *thenable* so existing code `await clientPromise` works.
 * `await` uses the presence of `.then` (thenable) to resolve lazily.
 */
const clientPromiseThenable = {
  then(onFulfilled, onRejected) {
    return getMongoClient().then(onFulfilled, onRejected);
  },
  catch(onRejected) {
    return getMongoClient().catch(onRejected);
  },
  finally(onFinally) {
    return getMongoClient().finally(onFinally);
  },
};

module.exports = clientPromiseThenable;          // default export (thenable)
module.exports.getMongoClient = getMongoClient;  // named helper
module.exports.getDb = getDb;                    // named helper