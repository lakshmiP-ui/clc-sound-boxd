"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Plus, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/star-rating"

interface AlbumCardProps {
  id: string
  title: string
  artist: string
  coverUrl: string
  year: number
  rating?: number
  userRating?: number
  reviewCount?: number
  className?: string
}

export function AlbumCard({
  id,
  title,
  artist,
  coverUrl,
  year,
  rating,
  reviewCount = 0,
  className,
}: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isWatched, setIsWatched] = useState(false)

  return (
    <div
      className={cn("group relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/album/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
          <Image
            src={coverUrl}
            alt={`${title} by ${artist}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Overlay on hover */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />
          {/* Quick actions */}
          <div
            className={cn(
              "absolute bottom-3 left-3 right-3 flex items-center justify-between transition-all duration-200",
              isHovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            )}
          >
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsWatched(!isWatched)
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  isWatched
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                )}
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsLiked(!isLiked)
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  isLiked
                    ? "bg-red-500 text-white"
                    : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Album info */}
      <div className="mt-3 space-y-1">
        <Link href={`/album/${id}`}>
          <h3 className="line-clamp-1 text-sm font-medium text-foreground transition-colors hover:text-primary">
            {title}
          </h3>
        </Link>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {artist} • {year}
        </p>
        {rating !== undefined && (
          <div className="flex items-center gap-2">
            <StarRating rating={rating} size="sm" />
            {reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {reviewCount.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
