"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StarRating } from "@/components/star-rating"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Plus, Eye, Calendar, Clock, Disc } from "lucide-react"

// Mock album data - in production, fetch from Supabase
const albumData = {
  id: "1",
  title: "Blonde",
  artist: "Frank Ocean",
  coverUrl: "https://picsum.photos/seed/blonde/800/800",
  year: 2016,
  rating: 4.5,
  ratingCount: 45230,
  genres: ["R&B", "Art Pop"],
  runtime: "60:07",
  tracks: 17,
  tracklist: [
    { number: 1, title: "Nikes", duration: "5:14" },
    { number: 2, title: "Ivy", duration: "4:09" },
    { number: 3, title: "Pink + White", duration: "3:04" },
    { number: 4, title: "Solo", duration: "4:17" },
    { number: 5, title: "Self Control", duration: "4:09" },
    { number: 6, title: "Nights", duration: "5:07" },
    { number: 7, title: "White Ferrari", duration: "4:08" },
    { number: 8, title: "Seigfried", duration: "5:34" },
    { number: 9, title: "Godspeed", duration: "2:57" },
  ],
}

export default function AlbumPage() {
  const [userRating, setUserRating] = useState<number>(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isListened, setIsListened] = useState(false)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [review, setReview] = useState("")

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
                {albumData.genres.map((genre) => (
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
                <StarRating rating={userRating} size="lg" interactive onRate={setUserRating} />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant={isListened ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsListened(!isListened)}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  {isListened ? "Listened" : "Mark listened"}
                </Button>
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? "fill-current" : ""}`} />
                  Like
                </Button>
                <Button
                  variant={isInWatchlist ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsInWatchlist(!isInWatchlist)}
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
                {albumData.tracklist.map((track) => (
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
                ))}
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
                <Button className="w-full">Post Review</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
