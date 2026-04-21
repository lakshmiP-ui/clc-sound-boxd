"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating?: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRate?: (rating: number) => void
  showHalf?: boolean
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRate,
  showHalf = true,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const gapClasses = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5",
  }

  const displayRating = hoverRating !== null ? hoverRating : rating

  const handleClick = (index: number, isHalf: boolean) => {
    if (!interactive || !onRate) return
    const newRating = isHalf && showHalf ? index + 0.5 : index + 1
    onRate(newRating)
  }

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (!interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const isHalf = x < rect.width / 2
    setHoverRating(isHalf && showHalf ? index + 0.5 : index + 1)
  }

  return (
    <div className={cn("flex items-center", gapClasses[size])}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = displayRating >= index + 1
        const halfFilled = displayRating > index && displayRating < index + 1

        return (
          <button
            key={index}
            type="button"
            className={cn(
              "relative",
              interactive && "cursor-pointer transition-transform hover:scale-110",
              !interactive && "cursor-default"
            )}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onMouseLeave={() => setHoverRating(null)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const isHalf = x < rect.width / 2
              handleClick(index, isHalf)
            }}
            disabled={!interactive}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                filled || halfFilled ? "fill-primary text-primary" : "fill-transparent text-muted-foreground/40"
              )}
            />
            {halfFilled && (
              <Star
                className={cn(
                  sizeClasses[size],
                  "absolute left-0 top-0 fill-primary text-primary"
                )}
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
