import Link from 'next/link'
import { Disc3, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-primary">
          <Disc3 className="h-8 w-8" />
          <span className="text-2xl font-bold font-[family-name:var(--font-display)]">Soundboxd</span>
        </Link>
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Authentication Error</h1>
          <p className="text-muted-foreground">
            Something went wrong during authentication. Please try again.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Try again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
