const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const emailToSearch = 'contact@holdingaurore.com';
  console.log('Searching for email in public.users:', emailToSearch);
  const { data: dbUsers, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('email', emailToSearch);

  if (dbError) {
    console.error('DB search error:', dbError);
  } else {
    console.log('DB Users found:', dbUsers);
  }

  console.log('\nSearching for email in auth.users...');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Auth search error:', authError);
  } else {
    const foundAuth = authUsers.users.filter(u => u.email === emailToSearch);
    console.log('Auth Users found:', foundAuth.map(u => ({ id: u.id, email: u.email, user_metadata: u.user_metadata })));
  }

  console.log('\nAll auth users:');
  console.log(authUsers.users.map(u => ({ id: u.id, email: u.email })));
}

run();
