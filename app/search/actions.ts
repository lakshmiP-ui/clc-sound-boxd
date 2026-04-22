'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function addAlbumFromITunes(albumData: {
  title: string
  artist: string
  cover_url: string | null
  year: number | null
  genre: string | null
}) {
  console.log("SERVER ACTION CALLED: addAlbumFromITunes", albumData)
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log("User not logged in, redirecting to login")
    redirect('/auth/login')
  }
  console.log("User is logged in:", user.id)
  
  // Check if album already exists by case-insensitive title and artist
  const { data: existing } = await supabase
    .from('albums')
    .select('id')
    .ilike('title', albumData.title)
    .ilike('artist', albumData.artist)
    .limit(1)
    .maybeSingle()
    
  if (existing) {
    redirect(`/album/${existing.id}`)
  }

  // Insert new album
  const { data, error } = await supabase
    .from('albums')
    .insert({
      title: albumData.title || 'Unknown Title',
      artist: albumData.artist || 'Unknown Artist',
      cover_url: albumData.cover_url || null,
      year: albumData.year || null,
      genre: albumData.genre || null,
    })
    .select('id')
    .single()
    
  if (error || !data) {
    console.error('Error adding album to Supabase:', error)
    throw new Error('Failed to add album: ' + (error?.message || 'Unknown error'))
  }

  redirect(`/album/${data.id}`)
}
