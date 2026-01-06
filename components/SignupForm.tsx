'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from './ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, name)
      if (error) {
        setError(error)
      } else {
        setSuccess(true)
        // Redirect to home after successful signup (Supabase handles email confirmation)
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 2000)
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join thousands of Nigerian law students
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-green-800 dark:text-green-200 text-sm">
              Account created successfully! Redirecting...
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl border transition-all',
                'bg-white dark:bg-dark-800',
                'border-slate-300 dark:border-slate-600',
                'text-slate-900 dark:text-slate-100',
                'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
              placeholder="John Doe"
            />
          </div>

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
              autoComplete="new-password"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl border transition-all',
                'bg-white dark:bg-dark-800',
                'border-slate-300 dark:border-slate-600',
                'text-slate-900 dark:text-slate-100',
                'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
              placeholder="Create a password"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl border transition-all',
                'bg-white dark:bg-dark-800',
                'border-slate-300 dark:border-slate-600',
                'text-slate-900 dark:text-slate-100',
                'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
              placeholder="Confirm your password"
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
            disabled={success}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
