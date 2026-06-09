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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing keys in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTest() {
  const testEmail = `test_client_${Date.now()}@example.com`;
  const prenom = 'Test';
  const nom = 'Client';
  const telephone = '+33 6 12 34 56 78';
  const langue = 'fr';
  const titre = 'Test Projet';
  const type_service = 'Acquisition Immobilière - Dubaï';
  const montant = 100000;
  const statut = 'demande';

  console.log('Testing full registration pipeline for:', testEmail);

  let userId = '';
  try {
    // 1. Create Auth User
    console.log('1. Creating Auth User...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'password123!',
      email_confirm: true,
      user_metadata: { role: 'client', prenom, nom }
    });

    if (authError) {
      throw new Error('Auth Error: ' + authError.message);
    }
    userId = authData.user.id;
    console.log('Auth user created with ID:', userId);

    // 2. Insert into public.users
    console.log('2. Inserting profile into public.users...');
    const { error: dbError } = await supabase.from('users').insert({
      id: userId,
      email: testEmail,
      nom,
      prenom,
      role: 'client',
      telephone,
      langue
    });

    if (dbError) {
      throw new Error('Database Error (users): ' + dbError.message);
    }
    console.log('Profile created in public.users');

    // 3. Insert dossier
    console.log('3. Inserting dossier...');
    const { data: newDossier, error: dosErr } = await supabase
      .from('dossiers')
      .insert({
        client_id: userId,
        titre,
        type_service,
        montant,
        statut
      })
      .select()
      .single();

    if (dosErr) {
      throw new Error('Database Error (dossiers): ' + dosErr.message);
    }
    console.log('Dossier created with ID:', newDossier.id);

    // 4. Insert document
    console.log('4. Inserting document...');
    const { error: docErr } = await supabase.from('documents').insert({
      dossier_id: newDossier.id,
      nom: "Passeport ou pièce d'identité",
      url: "",
      signe: false,
      type: "juridique"
    });

    if (docErr) {
      throw new Error('Database Error (documents): ' + docErr.message);
    }
    console.log('Document request created successfully.');

    console.log('=== TEST PASSED SUCCESSFULLY ===');

    // Cleanup
    console.log('Cleaning up test data...');
    // Cascading deletes will clean dossiers and documents due to foreign key references on delete cascade
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Error deleting test user during cleanup:', deleteError);
    } else {
      console.log('Cleanup completed successfully.');
    }

  } catch (err) {
    console.error('=== TEST FAILED ===');
    console.error(err.message);
    if (userId) {
      console.log('Cleaning up user after failure...');
      await supabase.auth.admin.deleteUser(userId).catch(e => console.error('Cleanup error:', e));
    }
  }
}

runTest();
