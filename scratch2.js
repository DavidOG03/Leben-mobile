import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ldstjclfnwyqjeotlqoa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkc3RqY2xmbnd5cWplb3RscW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDUzODIsImV4cCI6MjA5MTE4MTM4Mn0.vPbCX5XJ73slJdbPG4ZZ6w-uJYtbgKhF8_qlvs4BW5k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'test@example.com', // Let's create a test user or just try to sign up
    password: 'password123'
  });
  
  let token = authData?.session?.access_token;
  let refreshToken = authData?.session?.refresh_token;

  if (!token) {
    const { data: signUpData } = await supabase.auth.signUp({
      email: 'test-api-ai-' + Date.now() + '@example.com',
      password: 'password123'
    });
    token = signUpData?.session?.access_token;
    refreshToken = signUpData?.session?.refresh_token;
  }
  
  console.log("Token acquired:", !!token);

  if (token) {
    const res1 = await fetch('https://leben-os.vercel.app/api/ai/brief', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ forceRefresh: false })
    });
    console.log('Test 1 (Auth Header):', res1.status, await res1.text());

    const res2 = await fetch('https://leben-os.vercel.app/api/ai/brief', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-ldstjclfnwyqjeotlqoa-auth-token=${encodeURIComponent(JSON.stringify(["token", "refreshToken"]))}`.replace('"token"', `"${token}"`).replace('"refreshToken"', `"${refreshToken}"`)
      },
      body: JSON.stringify({ forceRefresh: false })
    });
    console.log('Test 2 (Cookie Header):', res2.status, await res2.text());
  }
}

main().catch(console.error);
