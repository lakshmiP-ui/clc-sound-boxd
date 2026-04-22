const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://spfcowwfwfrcwegsydrw.supabase.co',
  'sb_publishable_udKAhb3Fwh82G3nRancqBA_meDWlOaJ'
)

async function test() {
  const { data: p } = await supabase.from('profiles').select('id').limit(1)
  const { data: a } = await supabase.from('albums').select('id').limit(1)
  
  if (p.length && a.length) {
    const user_id = p[0].id
    const album_id = a[0].id
    console.log(`Testing insert for user ${user_id} and album ${album_id}`)
    
    // We cannot insert unless we bypass RLS, BUT since we are using anon key, it will fail: "new row violates row-level security policy"
    // So we can only test this if we use the service_role key or we sign in as the user.
    // Let's create a temporary user, sign in, and try.
    
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: 'test' + Date.now() + '@example.com',
      password: 'password123'
    })
    
    if (authErr) {
      console.log('Signup error:', authErr)
      return
    }
    
    const newUserId = authData.user.id
    console.log('Created auth user:', newUserId)
    
    // Wait for trigger to create profile
    await new Promise(r => setTimeout(r, 1000))
    
    const { error: insErr } = await supabase.from('reviews').insert({
      user_id: newUserId,
      album_id: album_id,
      liked: true
    })
    
    console.log('Insert error:', insErr)
  }
}
test()
