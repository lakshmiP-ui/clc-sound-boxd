'use client'

import Link from 'next/link'
import { Disc3, Search, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary shrink-0">
            <Disc3 className="h-6 w-6" />
            <span className="text-lg font-bold font-[family-name:var(--font-display)]">Soundboxd</span>
          </Link>

          {/* Search */}
          <div className="hidden sm:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search albums, artists..."
                className="pl-9 bg-secondary border-0 h-9"
              />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {loading ? (
              <div className="h-8 w-16 bg-secondary animate-pulse rounded-md" />
            ) : user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="h-8 px-3">
                  <Link href={`/user/${user.id}`}>
                    <User className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 px-3">
                  <LogOut className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="h-8">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild className="h-8">
                  <Link href="/auth/sign-up">Join</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
