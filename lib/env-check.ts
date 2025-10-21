export function checkGoogleOAuthConfig(): { isConfigured: boolean; message: string } {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  
  if (!clientId || clientId === 'your-google-client-id') {
    return {
      isConfigured: false,
      message: 'Google OAuth is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.'
    }
  }
  
  if (!clientId.includes('.')) {
    return {
      isConfigured: false,
      message: 'Invalid Google OAuth Client ID format.'
    }
  }
  
  return {
    isConfigured: true,
    message: 'Google OAuth is properly configured.'
  }
}

export function getGoogleOAuthSetupInstructions(): string[] {
  return [
    '1. Go to Google Cloud Console (https://console.cloud.google.com/)',
    '2. Create a new project or select an existing one',
    '3. Enable the Google+ API',
    '4. Go to Credentials and create OAuth 2.0 Client ID',
    '5. Set Application type to "Web application"',
    '6. Add authorized redirect URI: http://localhost:3000/auth/google/callback',
    '7. Copy the Client ID and add it to your .env.local file',
    '8. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here',
    '9. Restart your development server'
  ]
}

