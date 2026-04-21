import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bblxawscmyzelinidkmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDQ2NzksImV4cCI6MjA4NzI4MDY3OX0.be7RrEhVEutbQDJqT1pl_OICFmFdkNRq3jFRCItecNQ'
);

async function main() {
  // Try sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'hermark0m@gmail.com',
    password: 'Milana.1234!',
  });

  if (error) {
    console.log('❌ Sign in error:', error.message);
    console.log('Error status:', error.status);
    console.log('Full error:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Sign in SUCCESS');
    console.log('User ID:', data.user?.id);
  }

  // Check if user exists by trying sign up again
  const { data: d2, error: e2 } = await supabase.auth.signUp({
    email: 'hermark0m@gmail.com',
    password: 'Milana.1234!',
  });
  
  if (e2) {
    console.log('\nSign up retry error:', e2.message);
  } else {
    console.log('\nSign up retry result:');
    console.log('User ID:', d2.user?.id);
    console.log('Confirmed:', d2.user?.email_confirmed_at);
    console.log('Identities:', d2.user?.identities?.length);
  }
}

main();
