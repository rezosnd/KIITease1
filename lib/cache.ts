// Simple in-memory cache (use Redis in production)
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>()

  set(key: string, value: any, ttlSeconds = 300) {
    const expiry = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { value, expiry })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new MemoryCache()

// Cleanup expired entries every 5 minutes
if (typeof window === "undefined") {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000)
}

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:${userId}`,
  NOTES_LIST: (branch: string, year: number) => `notes:${branch}:${year}`,
  REVIEWS_LIST: (teacherId: string) => `reviews:${teacherId}`,
  TEACHERS_LIST: "teachers:all",
  REFERRAL_COUNT: (userId: string) => `referrals:${userId}`,
  ANALYTICS: (type: string) => `analytics:${type}`,
} as const
