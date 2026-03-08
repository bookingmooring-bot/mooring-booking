import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envFile.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) {
        env[key.trim()] = rest.join('=').trim().replace(/"/g, '');
    }
});

const supabaseUrl = env['VITE_SUPABASE_URL'] || '';
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'] || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMoorings() {
    const { data, error } = await supabase.from('moorings').select('id, name, location, country, status');
    if (error) {
        console.error("Error fetching moorings:", error);
        return;
    }
    console.log(`Found ${data.length} moorings total.`);

    const active = data.filter((m: any) => m.status === 'active');
    console.log(`Active moorings: ${active.length}`);

    const potentiallyReal = data.filter((m: any) => !m.name.includes('Marina') && !m.name.includes('Mooring') && m.name !== 'Porto Montenegro' && !m.name.includes('Port') && !m.name.includes('Cala'));
    console.log("Potentially real moorings:");
    console.log(JSON.stringify(potentiallyReal, null, 2));

    console.log("All active moorings:");
    console.log(JSON.stringify(active.map((m: any) => ({ name: m.name, country: m.country, status: m.status })), null, 2));
}

checkMoorings();
