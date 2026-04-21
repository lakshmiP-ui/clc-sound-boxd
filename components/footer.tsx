import Link from "next/link"
import { Disc3 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Disc3 className="h-5 w-5" />
            <span className="font-semibold font-[family-name:var(--font-display)]">Soundboxd</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            © 2026 Soundboxd
          </p>
        </div>
      </div>
    </footer>
  )
}
