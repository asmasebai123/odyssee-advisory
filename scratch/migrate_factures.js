const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    host: 'aws-0-eu-west-1.pooler.supabase.com',
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
    console.log("Connected to Supabase Postgres database.");
    
    console.log("Adding columns to factures table...");
    await client.query(`
      ALTER TABLE public.factures 
      ADD COLUMN IF NOT EXISTS reference text,
      ADD COLUMN IF NOT EXISTS libelle text,
      ADD COLUMN IF NOT EXISTS date_emission date,
      ADD COLUMN IF NOT EXISTS date_echeance date;
    `);
    
    console.log("Columns successfully added!");

    console.log("Backfilling existing records...");
    await client.query(`
      update public.factures
      set reference = 'FAC-' || upper(substr(replace(id::text, '-', ''), 1, 8))
      where reference is null;

      update public.factures
      set libelle = 'Honoraires de conseil'
      where libelle is null;

      update public.factures
      set date_emission = created_at::date
      where date_emission is null;

      update public.factures
      set date_echeance = (created_at + interval '14 days')::date
      where date_echeance is null;
    `);
    console.log("Backfill completed!");

    // Reload the schema cache to notify PostgREST immediately
    console.log("Reloading schema cache...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("Schema reload notification sent!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
