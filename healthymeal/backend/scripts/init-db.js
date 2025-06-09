const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.development' });

async function init() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('healthymeal');
  await db.createCollection('users');
  await db.createCollection('preferences');
  await db.createCollection('recipes');
  console.log('✅ Baza danych przygotowana');
  await client.close();
}
init();
