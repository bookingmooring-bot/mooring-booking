// Script to seed all moorings from moorings.ts into Supabase
// Run with: node scripts/seed-moorings.mjs

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://bblxawscmyzelinidkmb.supabase.co',
    // Using service_role key for seeding (bypasses RLS)
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTcwNDY3OSwiZXhwIjoyMDg3MjgwNjc5fQ.xe6MTsJ1TZabVNvCboUpfiSAEXRtYe9wbu29Ya1QBmM'
);

// Import the moorings data - we'll read and parse the TS file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mooringsFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'moorings.ts'), 'utf-8');

// Extract the array from the TS file
const arrayMatch = mooringsFile.match(/export const allMoorings.*?=\s*\[([\s\S]*?)\];/);
if (!arrayMatch) {
    console.error('Could not find allMoorings array');
    process.exit(1);
}

// Parse each mooring object
const mooringObjects = [];
const objectRegex = /\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
let match;

while ((match = objectRegex.exec(arrayMatch[1])) !== null) {
    const objStr = match[1];

    const getString = (key) => {
        const m = objStr.match(new RegExp(`${key}:\\s*"([^"]*)"`)) || objStr.match(new RegExp(`${key}:\\s*'([^']*)'`));
        return m ? m[1] : null;
    };

    const getNumber = (key) => {
        const m = objStr.match(new RegExp(`${key}:\\s*([\\d.]+)`));
        return m ? parseFloat(m[1]) : null;
    };

    const getBool = (key) => {
        const m = objStr.match(new RegExp(`${key}:\\s*(true|false)`));
        return m ? m[1] === 'true' : false;
    };

    const getArray = (key) => {
        const m = objStr.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`));
        if (!m) return [];
        return m[1].match(/"([^"]*)"/g)?.map(s => s.replace(/"/g, '')) || [];
    };

    const id = getString('id');
    if (!id) continue;

    mooringObjects.push({
        name: getString('name') || '',
        location: getString('location') || '',
        country: getString('country') || '',
        country_flag: getString('countryFlag') || '',
        description: getString('description') || '',
        lat: getNumber('lat') || 0,
        lng: getNumber('lng') || 0,
        price_per_night: getNumber('price') || 0,
        discount_percent: getNumber('discountPercent') || 0,
        wind_protection: getString('windProtection') || 'good',
        amenities: getArray('amenities'),
        image_urls: [getString('image')].filter(Boolean),
        is_last_minute: getBool('isLastMinute'),
        is_now4today: getBool('isNow4Today'),
        owner_name: getString('ownerName') || '',
        owner_phone: getString('ownerPhone') || '',
        rating: getNumber('rating') || 0,
        review_count: getNumber('reviewCount') || 0,
        status: 'active',
        owner_id: null,
    });
}

console.log(`Parsed ${mooringObjects.length} moorings. Starting insert...`);

// Insert in batches of 20
const BATCH_SIZE = 20;
let inserted = 0;

for (let i = 0; i < mooringObjects.length; i += BATCH_SIZE) {
    const batch = mooringObjects.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from('moorings').insert(batch).select('id');

    if (error) {
        console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
        console.error('First item in batch:', JSON.stringify(batch[0], null, 2));
    } else {
        inserted += data.length;
        console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${data.length} moorings (total: ${inserted})`);
    }
}

console.log(`\nDone! Total inserted: ${inserted} moorings.`);

// Verify
const { count } = await supabase.from('moorings').select('*', { count: 'exact', head: true });
console.log(`Verification: ${count} moorings in database.`);
