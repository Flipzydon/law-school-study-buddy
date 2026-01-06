import { SignupForm } from '@/components/SignupForm'
import { Logo } from '@/components/Logo'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-900 dark:to-dark-950 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/">
          <Logo variant="full" size="md" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <SignupForm />
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Nigerian Law School Study Buddy
      </footer>
    </div>
  )
}
