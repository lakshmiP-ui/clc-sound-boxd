import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

// Removed local invalid string-ID mocks

export function HeroSection({ 
  isLoggedIn, 
  featuredAlbums = [] 
}: { 
  isLoggedIn?: boolean;
  featuredAlbums?: any[];
}) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] text-foreground leading-tight text-balance">
              Track albums you&apos;ve listened to.
              <br />
              <span className="text-primary">Save those you want to hear.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-lg mx-auto lg:mx-0">
              Rate, review, and discover music with a community of passionate listeners.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
              {!isLoggedIn && (
                <Button size="lg" asChild>
                  <Link href="/auth/sign-up">Create account</Link>
                </Button>
              )}
              <Button size="lg" variant={isLoggedIn ? "default" : "outline"} asChild>
                <Link href="/albums">Browse albums</Link>
              </Button>
            </div>
          </div>

          {/* Album Grid */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="grid grid-cols-5 gap-2">
              {featuredAlbums.map((album, i) => (
                <Link
                  key={album.id}
                  href={`/album/${album.id}`}
                  className="aspect-square relative rounded-md overflow-hidden group"
                  style={{ transform: `rotate(${((i % 5) - 2) * 3}deg)` }}
                >
                  <Image
                    src={album.coverUrl || album.cover}
                    alt={album.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
