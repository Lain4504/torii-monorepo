'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Wishlist feature removed. Redirect to dashboard.
 */
export default function WishlistPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard')
  }, [router])
  return null
}
