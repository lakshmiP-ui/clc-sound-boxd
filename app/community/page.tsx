import { createClient } from "@/lib/supabase/server"
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function CommunityPage() {
  const supabase = await createClient()

  // Fetch profiles (newest first)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(24)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-2">Community</h1>
          <p className="text-muted-foreground mb-8">Discover and follow other music lovers.</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            {profiles?.map((profile: any) => (
              <Card key={profile.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-16 w-16 border bg-secondary">
                    <AvatarImage src={profile.avatar_url || `https://picsum.photos/seed/${profile.id}/100/100`} />
                    <AvatarFallback>{(profile.display_name || profile.username || 'U').charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link href={`/user/${profile.id}`} className="block truncate font-semibold hover:text-primary">
                      {profile.display_name || profile.username || 'User'}
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">
                      @{profile.username}
                    </p>
                  </div>
                  <Button variant="outline" asChild size="sm">
                    <Link href={`/user/${profile.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
