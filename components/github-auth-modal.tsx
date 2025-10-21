"use client"

import { X, Github, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { githubService } from "@/lib/github"

interface GitHubAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthenticated: (token: string) => void
}

export function GitHubAuthModal({ isOpen, onClose, onAuthenticated }: GitHubAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('github-token')
    if (token) {
      githubService.setAccessToken(token)
      githubService.isAuthenticated().then(authenticated => {
        if (authenticated) {
          onAuthenticated(token)
        } else {
          localStorage.removeItem('github-token')
        }
      })
    }
  }, [onAuthenticated])

  const handleGitHubAuth = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Redirect to GitHub OAuth
      window.location.href = githubService.getAuthUrl()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate with GitHub')
      setIsLoading(false)
    }
  }

  const handleManualToken = () => {
    const token = prompt('Enter your GitHub Personal Access Token:')
    if (token) {
      setIsLoading(true)
      setError(null)
      
      githubService.setAccessToken(token)
      githubService.isAuthenticated().then(authenticated => {
        if (authenticated) {
          localStorage.setItem('github-token', token)
          onAuthenticated(token)
        } else {
          setError('Invalid token. Please check your token and try again.')
          setIsLoading(false)
        }
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Authentication
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To export your project to GitHub, you need to authenticate with your GitHub account.
          </p>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleGitHubAuth} 
              disabled={isLoading}
              className="w-full gap-2 bg-transparent"
              variant="outline"
            >
              <Github className="w-4 h-4" />
              {isLoading ? "Redirecting..." : "Sign in with GitHub"}
              <ExternalLink className="w-4 h-4" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button 
              onClick={handleManualToken} 
              disabled={isLoading}
              className="w-full gap-2 bg-transparent"
              variant="outline"
            >
              Use Personal Access Token
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>For Personal Access Token:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
              <li>Generate a new token with "repo" scope</li>
              <li>Copy and paste the token above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
