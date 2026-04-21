const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://spfcowwfwfrcwegsydrw.supabase.co',
  'sb_publishable_udKAhb3Fwh82G3nRancqBA_meDWlOaJ'
)

const FAKE_USERS = [
  { email: 'alex.records@example.com', pass: 'p4ssw0rd123!', username: 'alexrecords', display: 'Alex W.' },
  { email: 'sarah.listens@example.com', pass: 'p4ssw0rd123!', username: 'sarahlistens', display: 'Sarah J.' },
  { email: 'vinyl.head@example.com', pass: 'p4ssw0rd123!', username: 'vinylhead', display: 'Marcus' },
  { email: 'indie.fan@example.com', pass: 'p4ssw0rd123!', username: 'indiefan', display: 'Chloe' },
  { email: 'classic.rocker@example.com', pass: 'p4ssw0rd123!', username: 'classicrocker', display: 'David R.' }
]

const FAKE_REVIEWS = [
  "Absolutely masterpiece. The production here is unmatched.",
  "Never gets old. A timeless classic that I keep coming back to.",
  "Starts off a bit slow but the second half is phenomenal.",
  "Not their best work, but still has a few great standout tracks.",
  "Changed my perspective entirely. Incredible lyricism.",
  "The instrumentation on this is brilliant. Highly recommended.",
  "Just a really fun and energetic album from start to finish."
]

async function seed() {
  console.log("Starting mock data seeding...")
  
  // 1. Fetch available albums
  const { data: albums } = await supabase.from('albums').select('id')
  if (!albums || albums.length === 0) {
    console.error("No albums found. Run seed.sql first.")
    return
  }
  console.log(`Found ${albums.length} albums to interact with.`)
  
  const createdUserIds = []

  // 2. Sign up users and insert reviews
  for (const u of FAKE_USERS) {
    console.log(`Signing up ${u.email}...`)
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: u.email,
      password: u.pass,
      options: {
        data: {
          username: u.username,
          display_name: u.display
        }
      }
    })
    
    if (authErr) {
      if (authErr.message.includes('already registered')) {
        console.log(`User ${u.email} already exists, attempting login...`)
        await supabase.auth.signInWithPassword({ email: u.email, password: u.pass })
      } else {
        console.error("Auth error:", authErr)
        continue
      }
    }
    
    // Auth state is now the new/logged-in user
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user.id
    createdUserIds.push(userId)
    
    // Wait for the trigger to insert into profiles
    await new Promise(r => setTimeout(r, 1000))

    // 3. Generate random interactions (likes, reviews) for this user
    // Pick 5-10 random albums
    const numInteractions = Math.floor(Math.random() * 6) + 5 // 5 to 10
    const shuffledAlbums = [...albums].sort(() => 0.5 - Math.random()).slice(0, numInteractions)
    
    for (const album of shuffledAlbums) {
      const isLiked = Math.random() > 0.3 // 70% chance to like
      const rating = isLiked ? (Math.floor(Math.random() * 3) + 3) : (Math.floor(Math.random() * 3) + 1) // 3-5 if liked, 1-3 if not
      
      const hasReview = Math.random() > 0.5
      const randomReview = hasReview ? FAKE_REVIEWS[Math.floor(Math.random() * FAKE_REVIEWS.length)] : null
      
      console.log(`  -> Inserting review for album ${album.id}`)
      await supabase.from('reviews').upsert({
        user_id: userId,
        album_id: album.id,
        liked: isLiked,
        rating: rating,
        review_text: randomReview,
        listened_at: new Date().toISOString()
      }, { onConflict: 'user_id, album_id'})
    }
  }

  // 4. Generate random follows between these users
  for (const followerId of createdUserIds) {
    // login again
    const u = FAKE_USERS[createdUserIds.indexOf(followerId)]
    await supabase.auth.signInWithPassword({ email: u.email, password: u.pass })
    
    // Pick random following
    const possibleFollows = createdUserIds.filter(id => id !== followerId)
    const numFollows = Math.floor(Math.random() * possibleFollows.length) + 1
    const shuffledFollows = [...possibleFollows].sort(() => 0.5 - Math.random()).slice(0, numFollows)
    
    for (const followingId of shuffledFollows) {
      await supabase.from('follows').upsert({
        follower_id: followerId,
        following_id: followingId
      })
    }
    console.log(`User ${u.username} followed ${shuffledFollows.length} users`)
  }

  console.log("Seeding complete!")
}

seed()
