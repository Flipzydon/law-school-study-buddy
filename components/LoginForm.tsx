'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from './ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card variant="glass" padding="lg" className="w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Log in to access your study materials
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl border transition-all',
                'bg-white dark:bg-dark-800',
                'border-slate-300 dark:border-slate-600',
                'text-slate-900 dark:text-slate-100',
                'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl border transition-all',
                'bg-white dark:bg-dark-800',
                'border-slate-300 dark:border-slate-600',
                'text-slate-900 dark:text-slate-100',
                'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
              placeholder="Enter your password"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-6">
          <Button
            type="submit"
            variant="nigerian"
            size="lg"
            className="w-full"
            isLoading={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
