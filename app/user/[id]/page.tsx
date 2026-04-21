"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AlbumCard } from "@/components/album-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Disc, Star, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Mock data for favorites - in production, fetch from Supabase
const favoriteAlbums = [
  {
    id: "1",
    title: "Blonde",
    artist: "Frank Ocean",
    coverUrl: "https://picsum.photos/seed/blonde/400/400",
    year: 2016,
    rating: 5,
    reviewCount: 45230,
  },
  {
    id: "2",
    title: "In Rainbows",
    artist: "Radiohead",
    coverUrl: "https://picsum.photos/seed/rainbows/400/400",
    year: 2007,
    rating: 4.5,
    reviewCount: 38920,
  },
  {
    id: "3",
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    coverUrl: "https://picsum.photos/seed/butterfly/400/400",
    year: 2015,
    rating: 5,
    reviewCount: 52180,
  },
  {
    id: "4",
    title: "Currents",
    artist: "Tame Impala",
    coverUrl: "https://picsum.photos/seed/currents/400/400",
    year: 2015,
    rating: 4.5,
    reviewCount: 34560,
  },
]

interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }
      
      setLoading(false)
    }
    fetchData()
  }, [params, supabase])

  const isOwnProfile = currentUser?.id === profile?.id

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">User not found</h1>
            <Link href="/" className="text-primary hover:underline">Go home</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Profile Header */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || 'User'} />
                <AvatarFallback className="text-2xl">
                  {(profile.display_name || profile.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
                    {profile.display_name || profile.username || 'User'}
                  </h1>
                  {!isOwnProfile && (
                    <Button
                      size="sm"
                      variant={isFollowing ? "outline" : "default"}
                      onClick={() => setIsFollowing(!isFollowing)}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Button size="sm" variant="outline">Edit profile</Button>
                  )}
                </div>
                
                {profile.username && (
                  <p className="text-muted-foreground mb-2">@{profile.username}</p>
                )}
                
                {profile.bio && (
                  <p className="text-foreground/80 mb-3 max-w-lg">{profile.bio}</p>
                )}

                <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 max-w-md">
              <div className="text-center">
                <Disc className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-lg font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Albums</p>
              </div>
              <div className="text-center">
                <Star className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-lg font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-lg font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-lg font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Favorite Albums */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4">
            Favorite Albums
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favoriteAlbums.map((album) => (
              <AlbumCard key={album.id} {...album} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
