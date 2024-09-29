"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ScioAIPlannerInterface from '../ScioAIPlannerInterface'
import { useAuth } from '../AuthContext'

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      console.log('ChatPage: No user_id, redirecting to signin')
      router.push('/signin')
    }
  }, [router])

  return <ScioAIPlannerInterface />
}