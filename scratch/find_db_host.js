const dns = require('dns').promises;

const projectRef = "qecoamfqucciqmwqxwlw";
const regions = [
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-central-1",
  "eu-central-2",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "sa-east-1",
  "ca-central-1"
];

async function check() {
  console.log("Probing DNS for pooler hosts...");
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    try {
      const addresses = await dns.resolve(host);
      console.log(`Resolved: ${host} ->`, addresses);
    } catch (err) {
      // ignore
    }
  }

  // Also check if we can resolve standard region-less pooler or other variants
  const variants = [
    `db.${projectRef}.supabase.co`,
    `${projectRef}.supabase.co`
  ];
  for (const v of variants) {
    try {
      const addresses = await dns.resolve(v);
      console.log(`Resolved variant: ${v} ->`, addresses);
    } catch (e) {}
  }
}

check();
