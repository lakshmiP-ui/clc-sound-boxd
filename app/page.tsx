import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AlbumCard } from "@/components/album-card"
import { ReviewCard } from "@/components/review-card"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

// Sample reviews for display (will be dynamic once users create reviews)
const sampleReviews = [
  {
    albumId: "1",
    albumTitle: "Blonde",
    albumArtist: "Frank Ocean",
    albumCover: "https://picsum.photos/seed/blonde/200/200",
    userId: "user1",
    userName: "MusicLover92",
    userAvatar: "https://picsum.photos/seed/user1/100/100",
    rating: 5,
    reviewText: "A masterpiece of introspection and vulnerability. Frank Ocean crafts an ethereal soundscape that perfectly captures the bittersweet nature of love and loss.",
    likes: 342,
    comments: 28,
    date: "2 hours ago",
  },
  {
    albumId: "3",
    albumTitle: "To Pimp a Butterfly",
    albumArtist: "Kendrick Lamar",
    albumCover: "https://picsum.photos/seed/butterfly/200/200",
    userId: "user2",
    userName: "JazzHead",
    userAvatar: "https://picsum.photos/seed/user2/100/100",
    rating: 4.5,
    reviewText: "A profound exploration of Black identity in America. The fusion of jazz, funk, and hip-hop creates something entirely new.",
    likes: 256,
    comments: 19,
    date: "5 hours ago",
  },
  {
    albumId: "4",
    albumTitle: "Currents",
    albumArtist: "Tame Impala",
    albumCover: "https://picsum.photos/seed/currents/200/200",
    userId: "user3",
    userName: "PsychRocker",
    userAvatar: "https://picsum.photos/seed/user3/100/100",
    rating: 4,
    reviewText: "Kevin Parker&apos;s most polished work. The production is immaculate, though some may miss the rawness of earlier releases.",
    likes: 189,
    comments: 12,
    date: "8 hours ago",
  },
]

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch albums from database
  const { data: albums } = await supabase
    .from("albums")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6)

  const popularAlbums = albums?.map((album) => ({
    id: album.id,
    title: album.title,
    artist: album.artist,
    coverUrl: album.cover_url || "https://picsum.photos/seed/default/400/400",
    year: album.year,
    rating: 4.5, // Default rating until we calculate from reviews
    reviewCount: 0,
  })) || []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection />

        {/* Popular Albums */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-foreground">
              Popular This Week
            </h2>
            <Link href="/albums" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularAlbums.map((album) => (
              <AlbumCard key={album.id} {...album} />
            ))}
          </div>
        </section>

        {/* Recent Reviews */}
        <section className="border-t border-border bg-card/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-foreground">
                Recent Reviews
              </h2>
              <Link href="/reviews" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sampleReviews.map((review, index) => (
                <ReviewCard key={index} {...review} />
              ))}
            </div>
          </div>
        </section>

        {/* Simple CTA */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)] text-foreground mb-3">
            Join Soundboxd today
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Track your listening history and connect with music lovers worldwide.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Create account
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
