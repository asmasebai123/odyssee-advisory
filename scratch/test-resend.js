const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

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

const resendApiKey = env.RESEND_API_KEY;
console.log('Resend API Key:', resendApiKey);

if (!resendApiKey) {
  console.error('Missing Resend API Key');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

async function runTest() {
  console.log('Sending test email to asma@gmail.com...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'Odyssée Advisory <no-reply@odyssee-advisory.com>',
      to: ['asma@gmail.com'],
      subject: 'Test Resend API Key',
      html: '<p>Ceci est un test de la clé API Resend depuis le script de diagnostic.</p>'
    });

    if (error) {
      console.error('Resend Error:', error);
    } else {
      console.log('Resend Success!', data);
    }
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

runTest();
