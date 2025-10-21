"use client"

import { useEffect, useState } from 'react'
import { googleAuthService, AuthUser } from '@/lib/google-auth'
import { AuthModal } from './auth-modal'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = googleAuthService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setIsAuthenticated(true)
        setShowAuthModal(false)
      } else {
        setIsAuthenticated(false)
        setShowAuthModal(true)
      }
      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage changes (e.g., when user signs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cipher-studio-user') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleAuth = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser)
    setIsAuthenticated(true)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    googleAuthService.signOut()
    setUser(null)
    setIsAuthenticated(false)
    setShowAuthModal(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Welcome to CipherStudio</h1>
              <p className="text-muted-foreground">
                Please sign in to access your coding workspace and start building amazing projects.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">🚀 Create & Edit Projects</h3>
                  <p className="text-sm text-muted-foreground">
                    Build React applications with our powerful code editor
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">👀 Live Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    See your changes in real-time with our preview pane
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">📤 Export to GitHub</h3>
                  <p className="text-sm text-muted-foreground">
                    Deploy your projects directly to GitHub repositories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => {}} 
          onAuth={handleAuth}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* User info bar */}
      <div className="bg-card border-b border-border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.picture && (
              <img 
                src={user.picture} 
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-1 rounded border border-border hover:bg-muted"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="h-[calc(100vh-60px)]">
        {children}
      </div>
    </div>
  )
}
