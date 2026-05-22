const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const host = 'aws-0-eu-west-1.pooler.supabase.com';
  console.log(`Connecting to Supabase pooler at ${host}...`);
  
  const client = new Client({
    host,
    port: 6543,
    user: 'postgres.qecoamfqucciqmwqxwlw',
    password: '2dILODaL847rCjno',
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected successfully to database!");

    const storagePath = path.join(__dirname, '..', 'supabase', 'storage-setup.sql');
    console.log("Reading storage SQL from:", storagePath);
    const storageSql = fs.readFileSync(storagePath, 'utf8');
    
    console.log("Executing storage-setup.sql...");
    await client.query(storageSql);
    console.log("storage-setup.sql executed successfully! Storage bucket and RLS policies created.");

  } catch (err) {
    console.error("Error executing storage migration:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
