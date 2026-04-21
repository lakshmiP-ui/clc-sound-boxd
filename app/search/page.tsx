import { createClient } from "@/lib/supabase/server"
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AlbumCard } from "@/components/album-card"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { q } = await searchParams
  const query = typeof q === 'string' ? q : ''
  const supabase = await createClient()

  let albums: any[] = []
  if (query) {
    const { data } = await supabase
      .from('albums')
      .select('*')
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
      .order('title', { ascending: true })
    if (data) albums = data
  }

  const albumList = albums.map((album) => ({
    id: album.id,
    title: album.title,
    artist: album.artist,
    coverUrl: album.cover_url || "https://picsum.photos/seed/default/400/400",
    year: album.year,
    rating: 0, 
    reviewCount: 0,
  }))

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-8 text-foreground">
          Search Results {query ? `for "${query}"` : ''}
        </h1>
        
        {query ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albumList.length > 0 ? (
              albumList.map((album) => (
                <AlbumCard key={album.id} {...album} />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">No albums found matching "{query}".</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Please enter a search term above to find albums or artists.</p>
        )}
      </main>
      <Footer />
    </div>
  )
}
