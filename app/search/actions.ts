'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function addAlbumFromITunes(albumData: {
  title: string
  artist: string
  cover_url: string
  year: number
  genre: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
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
      title: albumData.title,
      artist: albumData.artist,
      cover_url: albumData.cover_url,
      year: albumData.year,
      genre: albumData.genre,
    })
    .select('id')
    .single()
    
  if (error || !data) {
    console.error('Error adding album:', error)
    throw new Error('Failed to add album')
  }

  redirect(`/album/${data.id}`)
}
