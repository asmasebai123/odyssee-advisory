const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const host = 'aws-0-eu-west-1.pooler.supabase.com'; // Ireland region
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

    // 1. Run supabase/schema.sql
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    console.log("Reading schema SQL from:", schemaPath);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log("Executing schema.sql...");
    await client.query(schemaSql);
    console.log("schema.sql executed successfully!");

    // 2. Run supabase/add-demandes-table.sql
    const demandesPath = path.join(__dirname, '..', 'supabase', 'add-demandes-table.sql');
    console.log("Reading demandes SQL from:", demandesPath);
    const demandesSql = fs.readFileSync(demandesPath, 'utf8');

    console.log("Executing add-demandes-table.sql...");
    await client.query(demandesSql);
    console.log("add-demandes-table.sql executed successfully! All tables, functions, and policies created.");

  } catch (err) {
    console.error("Error executing migration:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
