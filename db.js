import dotenv from 'dotenv';
import pkg from 'pg';
const { Client } = pkg;

dotenv.config({ path: './.env' })

const client = new Client({
  connectionString: process.env.SUPABASE_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('✅ Connected to Supabase (Postgres)!'))
  .catch(err => console.error('❌ DB connection error:', err));

export default client;


// import dotenv from 'dotenv';
// import pkg from 'pg';
// const { Client } = pkg;

// dotenv.config({ path: './.env' })

// const client = new Client({
//   connectionString: process.env.COCKROACH_URI,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// client.connect()
//   .then(() => console.log('✅ Connected to CockroachDB!'))
//   .catch(err => console.error('❌ DB connection error:', err));

// export default client;