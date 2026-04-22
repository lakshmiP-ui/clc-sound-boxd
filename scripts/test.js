const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://spfcowwfwfrcwegsydrw.supabase.co',
  'sb_publishable_udKAhb3Fwh82G3nRancqBA_meDWlOaJ'
)

async function test() {
  console.log("Checking reviews table...")
  const { data, error } = await supabase.from('reviews').select('*')
  console.log("Reviews:", data)
  console.log("Error:", error)
}
test()
