require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI. Copy server/.env.example to server/.env and fill it in.");
  process.exit(1);
}

const client = new MongoClient(uri);
let db;

async function connect() {
  if (db) return db;
  await client.connect();
  db = client.db(process.env.DB_NAME || "jobnest");
  console.log(`Connected to MongoDB database "${db.databaseName}"`);
  return db;
}

module.exports = { connect, client };
