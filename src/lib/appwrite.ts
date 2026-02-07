import { Client, Account, Databases, ID, Query } from 'appwrite'

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '')

// Initialize Appwrite Services
export const account = new Account(client)
export const databases = new Databases(client)

// Database and Collection IDs
export const DATABASE_ID = 'movie-explorer-db'
export const FAVORITES_COLLECTION_ID = 'user-favorites'

// Auth Types
export interface User {
  $id: string
  email: string
  name: string
}

export interface Favorite {
  $id: string
  userId: string
  movieId: string
  movieTitle: string
  moviePoster?: string
  movieRating?: number
  createdAt: string
}

// Auth Functions
export const authService = {
  // Create new account
  async createAccount(email: string, password: string, name: string): Promise<User> {
    const newAccount = await account.create(ID.unique(), email, password, name)
    // Auto login after signup
    await this.login(email, password)
    return {
      $id: newAccount.$id,
      email: newAccount.email,
      name: newAccount.name
    }
  },

  // Login with email and password
  async login(email: string, password: string): Promise<void> {
    await account.createEmailPasswordSession(email, password)
  },

  // Send magic link
  async sendMagicLink(email: string): Promise<void> {
    const redirectUrl = `${window.location.origin}/`
    await account.createMagicURLToken(ID.unique(), email, redirectUrl)
  },

  // Verify magic link session
  async verifyMagicLink(userId: string, secret: string): Promise<void> {
    await account.createSession(userId, secret)
  },

  // Send password recovery email
  async forgotPassword(email: string): Promise<void> {
    const redirectUrl = `${window.location.origin}/reset-password`
    await account.createRecovery(email, redirectUrl)
  },

  // Reset password with recovery token
  async resetPassword(userId: string, secret: string, password: string): Promise<void> {
    await account.updateRecovery(userId, secret, password)
  },

  // Logout
  async logout(): Promise<void> {
    await account.deleteSession('current')
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await account.get()
      return {
        $id: user.$id,
        email: user.email,
        name: user.name
      }
    } catch {
      return null
    }
  }
}

// Favorites Functions
export const favoritesService = {
  // Get user's favorites
  async getFavorites(userId: string): Promise<Favorite[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FAVORITES_COLLECTION_ID,
        [Query.equal('userId', userId), Query.orderDesc('createdAt')]
      )
      return response.documents as unknown as Favorite[]
    } catch {
      console.error('Error fetching favorites')
      return []
    }
  },

  // Add movie to favorites
  async addFavorite(
    userId: string,
    movieId: string,
    movieTitle: string,
    moviePoster?: string,
    movieRating?: number
  ): Promise<Favorite | null> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        FAVORITES_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          movieId,
          movieTitle,
          moviePoster: moviePoster || '',
          movieRating: movieRating || 0,
          createdAt: new Date().toISOString()
        }
      )
      return doc as unknown as Favorite
    } catch {
      console.error('Error adding favorite')
      return null
    }
  },

  // Remove movie from favorites
  async removeFavorite(documentId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(DATABASE_ID, FAVORITES_COLLECTION_ID, documentId)
      return true
    } catch {
      console.error('Error removing favorite')
      return false
    }
  },

  // Check if movie is in favorites
  async isFavorite(userId: string, movieId: string): Promise<string | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FAVORITES_COLLECTION_ID,
        [Query.equal('userId', userId), Query.equal('movieId', movieId)]
      )
      return response.documents.length > 0 ? response.documents[0].$id : null
    } catch {
      return null
    }
  }
}

export { ID }
