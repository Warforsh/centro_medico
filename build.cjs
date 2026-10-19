// Genera public/config.js a partir de variables de entorno (Netlify) o de .env (local)
const fs = require('fs');
if (fs.existsSync('.env')) {
  for (const l of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const { SUPABASE_URL, SUPABASE_ANON_KEY, CONSULTATION_FEE = '150' } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERROR: faltan SUPABASE_URL y/o SUPABASE_ANON_KEY');
  process.exit(1);
}
fs.writeFileSync('public/config.js',
  'window.APP_CONFIG=' + JSON.stringify({ SUPABASE_URL, SUPABASE_ANON_KEY, CONSULTATION_FEE: Number(CONSULTATION_FEE) }) + ';\n');
console.log('public/config.js generado');
