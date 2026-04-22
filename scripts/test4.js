const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://spfcowwfwfrcwegsydrw.supabase.co',
  'sb_publishable_udKAhb3Fwh82G3nRancqBA_meDWlOaJ'
)

async function test() {
  console.log("Checking all reviews...")
  const { data, error } = await supabase.from('reviews').select('*')
  console.log("Total reviews:", data?.length)
  if (data?.length > 0) {
    console.log("Sample review:", data[0])
  } else {
    console.log("STILL EMPTY")
  }
}
test()
