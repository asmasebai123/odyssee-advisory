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

async function run() {
  try {
    const { data: users, error: uErr } = await supabase.from("users").select("*");
    console.log("Users:", users);

    const { data: dossiers, error: dErr } = await supabase.from("dossiers").select("*");
    console.log("Dossiers:", dossiers);

    const { data: documents, error: docErr } = await supabase.from("documents").select("*");
    console.log("Documents:", documents);
  } catch (err) {
    console.error("Err:", err);
  }
}

run();
