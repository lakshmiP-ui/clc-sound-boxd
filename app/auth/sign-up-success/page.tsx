import Link from 'next/link'
import { Disc3, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-primary">
          <Disc3 className="h-8 w-8" />
          <span className="text-2xl font-bold font-[family-name:var(--font-display)]">Soundboxd</span>
        </Link>
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent you a confirmation link. Please check your email to verify your account.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    </div>
  )
}
