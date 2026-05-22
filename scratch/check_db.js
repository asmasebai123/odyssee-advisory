const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qecoamfqucciqmwqxwlw.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlY29hbWZxdWNjaXFtd3F4d2x3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEzMzE0NCwiZXhwIjoyMDk0NzA5MTQ0fQ.GksS9HzW3AJ3i_2qFrpRa779ngCaqHYBlRXPfbt23sk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log("Checking factures table schema in Supabase...");
  
  // Method 1: Try selecting a row and see what columns come back
  const { data: selectData, error: selectErr } = await supabase
    .from('factures')
    .select('*')
    .limit(1);

  if (selectErr) {
    console.error("Error doing select *:", selectErr);
  } else {
    console.log("Select * succeeded. Available columns on first row:", selectData.length > 0 ? Object.keys(selectData[0]) : "No rows found");
  }

  // Method 2: Query information_schema if possible via pg_rpc (if any exists) or check error message
  const { data: testInsert, error: insertErr } = await supabase
    .from('factures')
    .insert({
      dossier_id: "00000000-0000-0000-0000-000000000000", // invalid but let's check field error
      montant: 100,
      statut: "impayee"
    });
  
  console.log("Insert test error (expected FK violation or similar):", insertErr);
}

check();
