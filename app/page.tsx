import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AlbumCard } from "@/components/album-card"
import { ReviewCard } from "@/components/review-card"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

// Removed static sampleReviews array

export default async function Home() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch albums from database
  const { data: albums } = await supabase
    .from("albums")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  const popularAlbums = albums?.map((album) => ({
    id: album.id,
    title: album.title,
    artist: album.artist,
    coverUrl: album.cover_url || "https://picsum.photos/seed/default/400/400",
    year: album.year,
    rating: 4.5, // Default rating until we calculate from reviews
    reviewCount: 0,
  })) || []

  // Fetch recent reviews with text
  const { data: recentReviewsData } = await supabase
    .from("reviews")
    .select("*, profiles(*), albums(*)")
    .not("review_text", "is", null)
    .order("created_at", { ascending: false })
    .limit(6)

  const recentReviews = recentReviewsData?.filter((r: any) => r.albums && r.profiles).map((r: any) => ({
    albumId: r.albums.id,
    albumTitle: r.albums.title,
    albumArtist: r.albums.artist,
    albumCover: r.albums.cover_url || "https://picsum.photos/seed/default/400/400",
    userId: r.profiles.id,
    userName: r.profiles.display_name || r.profiles.username || "User",
    userAvatar: r.profiles.avatar_url || `https://picsum.photos/seed/${r.profiles.id}/100/100`, // fallback avatar
    rating: Number(r.rating) || 0,
    reviewText: r.review_text,
    likes: 0,
    comments: 0,
    date: new Date(r.created_at).toLocaleDateString(),
  })) || []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection isLoggedIn={!!user} featuredAlbums={popularAlbums} />

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
              {recentReviews.length > 0 ? (
                recentReviews.map((review, index) => (
                  <ReviewCard key={index} {...review} />
                ))
              ) : (
                <p className="text-muted-foreground col-span-3 text-center py-8">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Simple CTA */}
        {!user && (
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
        )}
      </main>

      <Footer />
    </div>
  )
}
