"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle } from "lucide-react"
import { StarRating } from "@/components/star-rating"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ReviewCardProps {
  albumId: string
  albumTitle: string
  albumArtist: string
  albumCover: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  reviewText: string
  likes: number
  comments: number
  date: string
}

export function ReviewCard({
  albumId,
  albumTitle,
  albumArtist,
  albumCover,
  userId,
  userName,
  userAvatar,
  rating,
  reviewText,
  likes,
  comments,
  date,
}: ReviewCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80">
      <div className="flex gap-4">
        {/* Album Cover */}
        <Link href={`/album/${albumId}`} className="shrink-0">
          <div className="relative h-20 w-20 overflow-hidden rounded-md bg-secondary">
            <Image
              src={albumCover}
              alt={albumTitle}
              fill
              className="object-cover"
            />
          </div>
        </Link>

        {/* Review Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/album/${albumId}`}
                className="block truncate font-medium text-foreground hover:text-primary"
              >
                {albumTitle}
              </Link>
              <p className="text-sm text-muted-foreground">{albumArtist}</p>
            </div>
            <StarRating rating={rating} size="sm" />
          </div>

          {/* Review Text */}
          <p className="mt-2 line-clamp-3 text-sm text-foreground/80">
            {reviewText}
          </p>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <Link
              href={`/user/${userId}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="text-xs">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{userName}</span>
              <span>•</span>
              <span>{date}</span>
            </Link>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
                <Heart className="h-4 w-4" />
                <span>{likes}</span>
              </button>
              <button className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
                <MessageCircle className="h-4 w-4" />
                <span>{comments}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
