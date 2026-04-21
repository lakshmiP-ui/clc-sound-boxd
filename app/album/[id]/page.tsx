"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StarRating } from "@/components/star-rating"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Plus, Eye, Calendar, Clock, Disc } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const [albumData, setAlbumData] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [userRating, setUserRating] = useState<number>(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isListened, setIsListened] = useState(false)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [review, setReview] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch album
      const { data: album } = await supabase.from('albums').select('*').eq('id', id).single()
      if (album) {
        setAlbumData({
           id: album.id,
           title: album.title,
           artist: album.artist,
           coverUrl: album.cover_url || "https://picsum.photos/seed/default/800/800",
           year: album.year,
           rating: 4.5,
           ratingCount: 0,
           genres: album.genre ? [album.genre] : ["Unknown"],
           runtime: "N/A",
           tracks: 10,
           tracklist: [] 
        })
      }

      if (user && album) {
        // Fetch review
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('album_id', id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (reviewData) {
          setIsLiked(reviewData.liked)
          setReview(reviewData.review_text || "")
          setUserRating(Number(reviewData.rating) || 0)
          if (reviewData.listened_at) setIsListened(true)
        }

        // Fetch watchlist
        const { data: listData } = await supabase
          .from('lists')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', 'Watchlist')
          .maybeSingle()

        if (listData) {
          const { data: listAlbum } = await supabase
            .from('list_albums')
            .select('*')
            .eq('list_id', listData.id)
            .eq('album_id', id)
            .maybeSingle()
          
          if (listAlbum) setIsInWatchlist(true)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [params, supabase])

  const upsertReview = async (updates: any) => {
    if (!user || !albumData) return
    const { data: existing } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('album_id', albumData.id)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('reviews')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      
      if (error) console.error("Error updating review:", error)
    } else {
      const { error } = await supabase
        .from('reviews')
        .insert({ user_id: user.id, album_id: albumData.id, ...updates })

      if (error) console.error("Error inserting review:", error)
    }
  }

  const handleLike = async () => {
    if (!user) return alert("Please sign in first")
    const newValue = !isLiked
    setIsLiked(newValue)
    await upsertReview({ liked: newValue })
  }

  const handleListen = async () => {
    if (!user) return alert("Please sign in first")
    const newValue = !isListened
    setIsListened(newValue)
    await upsertReview({ listened_at: newValue ? new Date().toISOString() : null })
  }

  const handleRating = async (rating: number) => {
    if (!user) return alert("Please sign in first")
    setUserRating(rating)
    await upsertReview({ rating })
  }

  const handleReviewSubmit = async () => {
    if (!user) return alert("Please sign in first")
    if (!review.trim()) return
    setIsPosting(true)
    await upsertReview({ review_text: review })
    setIsPosting(false)
    alert("Review posted!")
  }

  const handleWatchlist = async () => {
    if (!user) return alert("Please sign in first")
    const newValue = !isInWatchlist
    setIsInWatchlist(newValue)
    
    let { data: listData } = await supabase.from('lists').select('id').eq('user_id', user.id).eq('title', 'Watchlist').maybeSingle()
    if (!listData) {
      const { data: newList } = await supabase.from('lists').insert({ user_id: user.id, title: 'Watchlist', is_public: false }).select().single()
      listData = newList
    }
    if (!listData) return

    if (newValue) {
      await supabase.from('list_albums').insert({ list_id: listData.id, album_id: albumData.id, position: 1 })
    } else {
      await supabase.from('list_albums').delete().eq('list_id', listData.id).eq('album_id', albumData.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-muted-foreground animate-pulse">Loading...</main>
        <Footer />
      </div>
    )
  }

  if (!albumData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">Album not found</main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Album Header */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="relative h-64 w-64 md:h-72 md:w-72 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={albumData.coverUrl}
                  alt={albumData.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {albumData.genres.map((genre: string) => (
                  <span key={genre} className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-foreground">
                {albumData.title}
              </h1>
              <Link href="#" className="text-lg text-primary hover:underline block">
                {albumData.artist}
              </Link>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <StarRating rating={albumData.rating} size="md" />
                <span className="font-medium text-foreground">{albumData.rating.toFixed(1)}</span>
                <span>({albumData.ratingCount.toLocaleString()} ratings)</span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{albumData.year}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{albumData.runtime}</span>
                <span className="flex items-center gap-1"><Disc className="h-4 w-4" />{albumData.tracks} tracks</span>
              </div>

              {/* Your Rating */}
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-1">Your rating</p>
                <StarRating rating={userRating} size="lg" interactive onRate={handleRating} />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant={isListened ? "default" : "outline"}
                  size="sm"
                  onClick={handleListen}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  {isListened ? "Listened" : "Mark listened"}
                </Button>
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? "fill-current" : ""}`} />
                  Like
                </Button>
                <Button
                  variant={isInWatchlist ? "default" : "outline"}
                  size="sm"
                  onClick={handleWatchlist}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Watchlist
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Tracklist & Review */}
        <section className="container mx-auto px-4 py-8 border-t border-border">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tracklist */}
            <div>
              <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4">Tracklist</h2>
              <div className="rounded-lg border border-border overflow-hidden">
                {albumData.tracklist && albumData.tracklist.length > 0 ? (
                  albumData.tracklist.map((track: any) => (
                    <div
                      key={track.number}
                      className="flex items-center justify-between px-4 py-2.5 text-sm border-b border-border last:border-b-0 hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground w-5">{track.number}</span>
                        <span className="text-foreground">{track.title}</span>
                      </div>
                      <span className="text-muted-foreground">{track.duration}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-muted-foreground text-sm">Tracklist not available.</div>
                )}
              </div>
            </div>

            {/* Write Review */}
            <div>
              <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4">Write a Review</h2>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts on this album..."
                  className="min-h-32 resize-none"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
                <Button className="w-full" onClick={handleReviewSubmit} disabled={isPosting}>
                  {isPosting ? "Posting..." : "Post Review"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
