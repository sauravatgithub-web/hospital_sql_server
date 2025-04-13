// db.js
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://dark:AvZQ-PXbOTE3crgozm2Trw@smooth-centaur-5760.jxf.gcp-asia-southeast1.cockroachlabs.cloud:26257/azuremed?sslmode=verify-full',
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('✅ Connected to CockroachDB!'))
  .catch(err => console.error('❌ DB connection error:', err));

// module.exports = client;
export default client;