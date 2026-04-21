const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  'https://spfcowwfwfrcwegsydrw.supabase.co',
  'sb_publishable_udKAhb3Fwh82G3nRancqBA_meDWlOaJ'
)

async function generate() {
  console.log("Fetching albums from database...")
  const { data: albums, error } = await supabase.from('albums').select('id, title, artist')
  
  if (error || !albums) {
    console.error("Error fetching albums:", error)
    return
  }
  
  console.log(`Found ${albums.length} albums. Finding covers...`)
  let sqlQueries = `-- Run this in your Supabase SQL Editor to apply real album covers\n\n`
  
  for (const album of albums) {
    try {
      const term = encodeURIComponent(`${album.title} ${album.artist}`)
      const res = await fetch(`https://itunes.apple.com/search?term=${term}&entity=album&limit=1`)
      const json = await res.json()
      
      if (json.results && json.results.length > 0) {
        // iTunes returns artworkUrl100, we can replace 100x100bb with 1000x1000bb for high-res
        const highResUrl = json.results[0].artworkUrl100.replace('100x100bb', '1000x1000bb')
        console.log(`Found cover for ${album.title}: ${highResUrl}`)
        
        // Escape single quotes for SQL
        const cleanUrl = highResUrl.replace(/'/g, "''")
        
        sqlQueries += `UPDATE public.albums SET cover_url = '${cleanUrl}' WHERE id = '${album.id}';\n`
      } else {
        console.log(`No cover found for ${album.title} by ${album.artist}`)
      }
    } catch (e) {
      console.log(`Failed to fetch for ${album.title}: ${e.message}`)
    }
  }
  
  fs.writeFileSync('scripts/update_covers.sql', sqlQueries)
  console.log("\nFinished! Generated 'scripts/update_covers.sql'")
}

generate()
