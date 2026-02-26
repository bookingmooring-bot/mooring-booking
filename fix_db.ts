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

const supabase = createClient(supabaseUrl, supabaseKey);

const countries = [
    { code: "HR", name: "Croatia", flag: "🇭🇷" },
    { code: "GR", name: "Greece", flag: "🇬🇷" },
    { code: "IT", name: "Italy", flag: "🇮🇹" },
    { code: "ES", name: "Spain", flag: "🇪🇸" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "TR", name: "Turkey", flag: "🇹🇷" },
    { code: "AL", name: "Albania", flag: "🇦🇱" },
    { code: "MT", name: "Malta", flag: "🇲🇹" },
    { code: "SI", name: "Slovenia", flag: "🇸🇮" },
    { code: "ME", name: "Montenegro", flag: "🇲🇪" },
    { code: "CY", name: "Cyprus", flag: "🇨🇾" },
];

async function updateMoorings() {
    const { data, error } = await supabase.from('moorings').select('id, country');
    if (error) {
        console.error("Error fetching moorings:", error);
        return;
    }

    let updatedCount = 0;
    for (const mooring of data) {
        const countryObj = countries.find(c => c.code === mooring.country);
        if (countryObj) {
            console.log(`Updating mooring ${mooring.id} country from ${mooring.country} to ${countryObj.name} and flag to ${countryObj.flag}`);
            const { error: updateError } = await supabase
                .from('moorings')
                .update({ country: countryObj.name, country_flag: countryObj.flag })
                .eq('id', mooring.id);

            if (updateError) {
                console.error(`Failed to update mooring ${mooring.id}:`, updateError);
            } else {
                updatedCount++;
            }
        }
    }

    console.log(`Successfully updated ${updatedCount} moorings.`);
}

updateMoorings();
