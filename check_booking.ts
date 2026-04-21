import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bblxawscmyzelinidkmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDQ2NzksImV4cCI6MjA4NzI4MDY3OX0.be7RrEhVEutbQDJqT1pl_OICFmFdkNRq3jFRCItecNQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('bookings').insert({
        mooring_id: '32c40339-49d5-472c-9bf5-c0f5f7004f21',
        provider_id: '2e7a3f01-f1e1-4da7-8462-42015b24c9d6',
        check_in: '2026-05-01',
        check_out: '2026-05-02',
        guest_name: 'Test',
        guest_email: 'test@example.com',
        nights: 1,
        price_per_night: 10,
        total_price: 10,
        commission_amount: 1,
        booking_status: 'pending',
        payment_status: 'pending',
        confirmation_code: `MB-TEST123`,
    }).select().single();

    if (error) {
        console.log("Error inserting:", error);
    } else {
        console.log("Successfully inserted with provider_id!");
        console.log("Returned DB row:", data);
        await supabase.from('bookings').delete().eq('id', data.id);
    }
}

check();
