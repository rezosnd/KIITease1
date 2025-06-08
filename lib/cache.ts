// Simple in-memory cache for development. Switch to Redis or similar for production!
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>()

  /**
   * Set a value in the cache with an optional TTL (in seconds, default 300).
   */
  set(key: string, value: any, ttlSeconds = 300) {
    const expiry = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { value, expiry })
  }

  /**
   * Get a value from the cache. Returns null if not found or expired.
   */
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  /**
   * Delete a value from the cache.
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear the entire cache.
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clean up all expired entries.
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new MemoryCache()

// Automatically clean up expired cache entries every 5 minutes (server-side only)
if (typeof window === "undefined") {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000)
}

// Common cache keys, helps prevent typos and enables autocomplete
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:${userId}`,
  NOTES_LIST: (branch: string, year: number) => `notes:${branch}:${year}`,
  REVIEWS_LIST: (teacherId: string) => `reviews:${teacherId}`,
  TEACHERS_LIST: "teachers:all",
  REFERRAL_COUNT: (userId: string) => `referrals:${userId}`,
  ANALYTICS: (type: string) => `analytics:${type}`,
} as const
