const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  try {
    console.log("Checking factures columns...");
    const { data, error } = await supabase
      .from("factures")
      .select("id, reference, libelle, date_emission, date_echeance")
      .limit(1);

    if (error) {
      console.error("Error reading columns:", error);
    } else {
      console.log("Success! Columns exist in PostgREST schema cache. Data sample:", data);
    }
  } catch (err) {
    console.error("Execution error:", err);
  }
}

check();
