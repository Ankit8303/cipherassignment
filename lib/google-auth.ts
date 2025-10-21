export interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
  verified_email: boolean
}

export interface AuthUser {
  id: string
  email: string
  name: string
  picture?: string
  provider: 'google' | 'email'
  isVerified: boolean
}

export class GoogleAuthService {
  private clientId: string
  private redirectUri: string

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id'
    this.redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/auth/google/callback` : ''
  }

  getAuthUrl(): string {
    if (typeof window === 'undefined') return ''
    
    // Check if client ID is properly configured
    if (!this.clientId || this.clientId === 'your-google-client-id') {
      console.error('Google OAuth not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.')
      return ''
    }
    
    const scope = 'openid email profile'
    const responseType = 'code'
    const state = this.generateState()
    
    // Store state for verification
    localStorage.setItem('google-oauth-state', state)
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope,
      response_type: responseType,
      state,
      access_type: 'offline',
      prompt: 'consent'
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  async handleCallback(code: string, state: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // Verify state
      const storedState = localStorage.getItem('google-oauth-state')
      if (!storedState || storedState !== state) {
        return { success: false, error: 'Invalid state parameter' }
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('/api/auth/google/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, redirect_uri: this.redirectUri })
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json()
        return { success: false, error: error.message || 'Failed to exchange code for tokens' }
      }

      const { access_token } = await tokenResponse.json()

      // Get user info from Google
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`)
      
      if (!userResponse.ok) {
        return { success: false, error: 'Failed to get user information' }
      }

      const googleUser: GoogleUser = await userResponse.json()

      // Convert to our user format
      const user: AuthUser = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        provider: 'google',
        isVerified: googleUser.verified_email
      }

      // Store user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cipher-studio-user', JSON.stringify(user))
        localStorage.removeItem('google-oauth-state')
      }

      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      }
    }
  }

  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // For demo purposes, we'll use a simple validation
      // In production, this would connect to your backend
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' }
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' }
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' }
      }

      // Create user object
      const user: AuthUser = {
        id: `email_${Date.now()}`,
        email,
        name: email.split('@')[0],
        provider: 'email',
        isVerified: false
      }

      // Store user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cipher-studio-user', JSON.stringify(user))
      }

      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    }
  }

  async signUpWithEmail(email: string, password: string, name: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // Validation
      if (!email || !password || !name) {
        return { success: false, error: 'All fields are required' }
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' }
      }

      if (name.length < 2) {
        return { success: false, error: 'Name must be at least 2 characters' }
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' }
      }

      // Check if user already exists (simple check)
      const existingUsers = this.getStoredUsers()
      if (existingUsers.find(u => u.email === email)) {
        return { success: false, error: 'User with this email already exists' }
      }

      // Create user object
      const user: AuthUser = {
        id: `email_${Date.now()}`,
        email,
        name,
        provider: 'email',
        isVerified: false
      }

      // Store user
      const users = [...existingUsers, user]
      if (typeof window !== 'undefined') {
        localStorage.setItem('cipher-studio-users', JSON.stringify(users))
        localStorage.setItem('cipher-studio-user', JSON.stringify(user))
      }

      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }
    }
  }

  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null
    
    try {
      const userStr = localStorage.getItem('cipher-studio-user')
      if (!userStr) return null
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    const user = this.getCurrentUser()
    return user !== null
  }

  signOut(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('cipher-studio-user')
    localStorage.removeItem('google-oauth-state')
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private getStoredUsers(): AuthUser[] {
    if (typeof window === 'undefined') return []
    
    try {
      const usersStr = localStorage.getItem('cipher-studio-users')
      return usersStr ? JSON.parse(usersStr) : []
    } catch {
      return []
    }
  }
}

export const googleAuthService = new GoogleAuthService()
