import Image from 'next/image'
import { Disc3, Plus } from 'lucide-react'
import { addAlbumFromITunes } from '@/app/search/actions'

interface ITunesAlbumCardProps {
  title: string
  artist: string
  coverUrl: string | null
  year: number | null
  genre: string | null
}

export function ITunesAlbumCard({ title, artist, coverUrl, year, genre }: ITunesAlbumCardProps) {
  const albumData = { title, artist, cover_url: coverUrl, year, genre }
  
  return (
    <form action={addAlbumFromITunes.bind(null, albumData)} className="group relative block aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all">
      <button type="submit" className="relative w-full h-full text-left focus:outline-none">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`${title} by ${artist}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4">
            <Disc3 className="h-12 w-12 mb-2" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-1 group-hover:text-primary transition-colors text-white" title={title}>
            {title}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-1">{artist}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
            <span>{year} • iTunes</span>
            <div className="flex items-center gap-1 text-primary bg-primary/20 px-2 py-1 rounded-full">
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </div>
          </div>
        </div>
      </button>
    </form>
  )
}
