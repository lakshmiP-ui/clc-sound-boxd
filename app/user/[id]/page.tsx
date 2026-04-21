"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AlbumCard } from "@/components/album-card"
import { ReviewCard } from "@/components/review-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Disc, Star, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Removed local mock favoriteAlbums array

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

  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [favoriteAlbumsData, setFavoriteAlbumsData] = useState<any[]>([])
  const [userReviews, setUserReviews] = useState<any[]>([])
  const [albumsCount, setAlbumsCount] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params
      
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (profileData) {
        setProfile(profileData)

        // Check if current user is following this profile
        if (user && user.id !== id) {
           const { data: isFollowingData } = await supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', id).maybeSingle()
           if (isFollowingData) setIsFollowing(true)
        }

        // Fetch follower counts
        const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id)
        const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id)
        setFollowersCount(followers || 0)
        setFollowingCount(following || 0)

        // Fetch favorite albums (liked albums) joined with albums table
        const { data: likedAlbums } = await supabase.from('reviews').select('*, albums(*)').eq('user_id', id).eq('liked', true).limit(6)
        if (likedAlbums) {
          const mapped = likedAlbums.filter((r: any) => r.albums).map((r: any) => ({
            id: r.albums.id,
            title: r.albums.title,
            artist: r.albums.artist,
            coverUrl: r.albums.cover_url || "https://picsum.photos/seed/default/400/400",
            year: r.albums.year,
            rating: 5,
            reviewCount: 0
          }))
          setFavoriteAlbumsData(mapped)
          setAlbumsCount(mapped.length)
        }

        // Fetch written reviews
        const { data: writtenReviews } = await supabase
          .from('reviews')
          .select('*, albums(*)')
          .eq('user_id', id)
          .not('review_text', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10)

        if (writtenReviews) {
          const mapReviews = writtenReviews.filter((r: any) => r.albums).map((r: any) => ({
             albumId: r.albums.id,
             albumTitle: r.albums.title,
             albumArtist: r.albums.artist,
             albumCover: r.albums.cover_url || "https://picsum.photos/seed/default/400/400",
             userId: profileData.id,
             userName: profileData.display_name || profileData.username,
             userAvatar: profileData.avatar_url || `https://picsum.photos/seed/${profileData.id}/100/100`,
             rating: Number(r.rating) || 0,
             reviewText: r.review_text,
             likes: 0,
             comments: 0,
             date: new Date(r.created_at).toLocaleDateString()
          }))
          setUserReviews(mapReviews)
        }

        const { count: totalReviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', id)
        setReviewsCount(totalReviews || 0)
      }
      
      setLoading(false)
    }
    fetchData()
  }, [params, supabase])

  const handleFollow = async () => {
    if (!currentUser || !profile) return
    const newValue = !isFollowing
    setIsFollowing(newValue)
    if (newValue) {
      setFollowersCount(prev => prev + 1)
      await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: profile.id })
    } else {
      setFollowersCount(prev => Math.max(0, prev - 1))
      await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', profile.id)
    }
  }

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
                      onClick={handleFollow}
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
                <p className="text-lg font-semibold">{albumsCount}</p>
                <p className="text-xs text-muted-foreground">Liked Albums</p>
              </div>
              <div className="text-center">
                <Star className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-lg font-semibold">{reviewsCount}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-lg font-semibold">{followingCount}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-lg font-semibold">{followersCount}</p>
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
            {favoriteAlbumsData.length > 0 ? (
              favoriteAlbumsData.map((album) => (
                <AlbumCard key={album.id} {...album} />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">No favorite albums yet.</p>
            )}
          </div>
        </section>

        {/* Written Reviews */}
        <section className="container mx-auto px-4 py-8 border-t border-border">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4">
            Recent Reviews
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userReviews.length > 0 ? (
              userReviews.map((review, index) => (
                <ReviewCard key={index} {...review} />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">No reviews written yet.</p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
