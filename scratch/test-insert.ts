import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("Supabase URL:", supabaseUrl);
console.log("Service Key is defined:", !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  try {
    // 1. Check existing auth users
    const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
    console.log("Auth users:", authUsers?.users?.map(u => ({ id: u.id, email: u.email })));
    if (authErr) console.error("Auth list error:", authErr);

    // 2. Check users table
    const { data: users, error: selectErr } = await supabase.from("users").select("*");
    console.log("Public users count:", users?.length, "Error:", selectErr);
    console.log("Public users data:", users);

    // 3. Try to insert one user manually to see what happens
    if (authUsers?.users && authUsers.users.length > 0) {
      const firstUser = authUsers.users[0];
      console.log("Attempting insert for user:", firstUser.email, "id:", firstUser.id);
      const { data: insertData, error: insErr } = await supabase.from("users").insert({
        id: firstUser.id,
        email: firstUser.email,
        nom: "TestNom",
        prenom: "TestPrenom",
        role: "client",
        telephone: "+33600000000",
        langue: "fr"
      }).select();
      console.log("Insert result:", insertData, "Error:", insErr);
    }
  } catch (e) {
    console.error("Execution error:", e);
  }
}

run();
