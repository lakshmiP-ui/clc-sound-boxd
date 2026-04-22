import { createClient } from "@/lib/supabase/server"
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AlbumCard } from "@/components/album-card"
import { ITunesAlbumCard } from "@/components/itunes-album-card"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { q } = await searchParams
  const query = typeof q === 'string' ? q : ''
  const supabase = await createClient()

  let localAlbums: any[] = []
  let itunesAlbums: any[] = []
  
  if (query) {
    // Fetch local albums
    const { data } = await supabase
      .from('albums')
      .select('*')
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
      .order('title', { ascending: true })
    if (data) localAlbums = data
    
    // Fetch from iTunes
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=15`)
      if (res.ok) {
        const json = await res.json()
        if (json.results) {
          const localKeys = new Set(localAlbums.map(a => `${a.title.toLowerCase()}-${a.artist.toLowerCase()}`))
          const seen = new Set()
          
          itunesAlbums = json.results
            .filter((item: any) => {
              const key = `${item.collectionName?.toLowerCase()}-${item.artistName?.toLowerCase()}`
              if (localKeys.has(key) || seen.has(key)) return false
              seen.add(key)
              return true
            })
            .map((item: any) => ({
              id: `itunes-${item.collectionId}`,
              title: item.collectionName,
              artist: item.artistName,
              coverUrl: item.artworkUrl100?.replace('100x100bb', '600x600bb'),
              year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 0,
              genre: item.primaryGenreName,
            }))
        }
      }
    } catch (e) {
      console.error("Failed to fetch from iTunes", e)
    }
  }

  const albumList = localAlbums.map((album) => ({
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
          <div className="space-y-12">
            {/* Local Results */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                On Soundboxd
                <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  {albumList.length}
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {albumList.length > 0 ? (
                  albumList.map((album) => (
                    <AlbumCard key={album.id} {...album} />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full">No local albums found.</p>
                )}
              </div>
            </div>

            {/* iTunes Results */}
            {itunesAlbums.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    From iTunes
                    <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                      {itunesAlbums.length}
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Click to add to Soundboxd
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {itunesAlbums.map((album) => (
                    <ITunesAlbumCard key={album.id} {...album} />
                  ))}
                </div>
              </div>
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
