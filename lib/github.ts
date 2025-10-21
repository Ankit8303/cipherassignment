export interface GitHubFile {
  path: string
  content: string
  type: 'file'
}

export interface GitHubRepository {
  name: string
  description: string
  private: boolean
}

export class GitHubService {
  private accessToken: string | null = null

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null
  }

  setAccessToken(token: string) {
    this.accessToken = token
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.accessToken) return false
    
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  async createRepository(repo: GitHubRepository): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!this.accessToken) {
      return { success: false, error: 'No GitHub access token provided' }
    }

    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(repo)
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.message || 'Failed to create repository' }
      }

      const data = await response.json()
      return { success: true, url: data.html_url }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async uploadFiles(repoName: string, files: GitHubFile[]): Promise<{ success: boolean; error?: string }> {
    if (!this.accessToken) {
      return { success: false, error: 'No GitHub access token provided' }
    }

    try {
      // Upload each file
      for (const file of files) {
        const response = await fetch(`https://api.github.com/repos/${await this.getUsername()}/${repoName}/contents/${file.path}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${this.accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Add ${file.path}`,
            content: btoa(unescape(encodeURIComponent(file.content))),
            branch: 'main'
          })
        })

        if (!response.ok) {
          const error = await response.json()
          return { success: false, error: error.message || `Failed to upload ${file.path}` }
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private async getUsername(): Promise<string> {
    if (!this.accessToken) throw new Error('No access token')
    
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) throw new Error('Failed to get username')
    
    const user = await response.json()
    return user.login
  }

  getAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'your-client-id'
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/github/callback')
    const scope = 'repo'
    
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
  }
}

export const githubService = new GitHubService()
