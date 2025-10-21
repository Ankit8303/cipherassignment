"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { googleAuthService } from '@/lib/google-auth'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage('Authentication was cancelled or failed')
          return
        }

        if (!code || !state) {
          setStatus('error')
          setMessage('Invalid authentication response')
          return
        }

        const result = await googleAuthService.handleCallback(code, state)

        if (result.success && result.user) {
          setStatus('success')
          setMessage('Successfully authenticated! Redirecting...')
          
          // Redirect to main app after a short delay
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage(result.error || 'Authentication failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred')
        console.error('Google OAuth callback error:', error)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
              <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Failed</h2>
              <p className="text-muted-foreground mb-4">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Return to App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we load the authentication page.</p>
          </div>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}
