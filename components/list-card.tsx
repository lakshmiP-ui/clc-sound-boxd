"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ListCardProps {
  id: string
  title: string
  description: string
  userId: string
  userName: string
  userAvatar: string
  albumCovers: string[]
  likes: number
  albumCount: number
}

export function ListCard({
  id,
  title,
  description,
  userId,
  userName,
  userAvatar,
  albumCovers,
  likes,
  albumCount,
}: ListCardProps) {
  return (
    <Link href={`/list/${id}`} className="group block">
      <div className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg">
        {/* Album Stack Preview */}
        <div className="relative mb-4 flex h-32 items-center justify-center">
          <div className="flex -space-x-8">
            {albumCovers.slice(0, 4).map((cover, index) => (
              <div
                key={index}
                className="relative h-24 w-24 overflow-hidden rounded-md border-2 border-card bg-secondary shadow-lg transition-transform group-hover:scale-105"
                style={{
                  transform: `rotate(${(index - 1.5) * 5}deg)`,
                  zIndex: 4 - index,
                }}
              >
                <Image
                  src={cover}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* List Info */}
        <div className="space-y-2">
          <h3 className="font-medium text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href={`/user/${userId}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="text-xs">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{userName}</span>
            </Link>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{albumCount} albums</span>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{likes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
