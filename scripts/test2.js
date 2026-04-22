const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://spfcowwfwfrcwegsydrw.supabase.co',
  'sb_publishable_udKAhb3Fwh82G3nRancqBA_meDWlOaJ'
)

async function test() {
  console.log("Checking profiles table...")
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*')
  console.log("Profiles:", profiles?.length)
  if (pErr) console.error("Profiles Error:", pErr)
  
  const { data: albums, error: aErr } = await supabase.from('albums').select('id, title')
  console.log("Albums:", albums?.length)
  if (aErr) console.error("Albums Error:", aErr)
}
test()
