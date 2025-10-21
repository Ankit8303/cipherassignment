"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Loader2, Mail, Lock, Eye, EyeOff, User, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { googleAuthService, AuthUser } from "@/lib/google-auth"
import { checkGoogleOAuthConfig, getGoogleOAuthSetupInstructions } from "@/lib/env-check"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuth: (user: AuthUser) => void
}

export function AuthModal({ isOpen, onClose, onAuth }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showOAuthSetup, setShowOAuthSetup] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const user = googleAuthService.getCurrentUser()
    if (user) {
      onAuth(user)
    }
  }, [onAuth])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setError("")
    
    try {
      const result = isSignUp 
        ? await googleAuthService.signUpWithEmail(email, password, name)
        : await googleAuthService.signInWithEmail(email, password)

      if (result.success && result.user) {
        onAuth(result.user)
        setEmail("")
        setPassword("")
        setName("")
        onClose()
      } else {
        setError(result.error || "Authentication failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    const config = checkGoogleOAuthConfig()
    if (!config.isConfigured) {
      setShowOAuthSetup(true)
      return
    }
    
    const authUrl = googleAuthService.getAuthUrl()
    if (!authUrl) {
      setError('Google OAuth is not configured. Please use email authentication or contact support.')
      return
    }
    window.location.href = authUrl
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{isSignUp ? "Create Account" : "Sign In"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Google OAuth Button */}
          <Button 
            onClick={handleGoogleAuth}
            variant="outline" 
            className="w-full gap-2 bg-transparent"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            <ExternalLink className="w-4 h-4" />
          </Button>

          {/* OAuth Setup Instructions Modal */}
          {showOAuthSetup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Google OAuth Setup Required</h3>
                  <button 
                    onClick={() => setShowOAuthSetup(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To enable Google OAuth authentication, you need to configure your Google Cloud Console project.
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Setup Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {getGoogleOAuthSetupInstructions().map((instruction, index) => (
                        <li key={index} className="text-muted-foreground">{instruction}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="p-3 bg-muted rounded border">
                    <p className="text-sm font-medium mb-1">Environment Variable:</p>
                    <code className="text-xs bg-background px-2 py-1 rounded">
                      NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
                    </code>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowOAuthSetup(false)}
                      className="flex-1"
                    >
                      Got it, I'll set it up
                    </Button>
                    <Button 
                      onClick={() => setShowOAuthSetup(false)}
                      variant="outline"
                      className="flex-1 bg-transparent"
                    >
                      Use Email Instead
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded text-sm"
                    placeholder="Enter your full name"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Email *</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Password *</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded text-sm"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
