"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from './firebase'
import { signInWithCustomToken } from 'firebase/auth'

export default function OAuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('OAuthCallback: Starting handleCallback')
      const searchParams = new URLSearchParams(window.location.search)
      const id_token = searchParams.get('id_token')
      const access_token = searchParams.get('access_token')
      const user_id = searchParams.get('user_id')

      console.log('OAuthCallback: Extracted tokens', { id_token, access_token, user_id })

      if (id_token && access_token && user_id) {
        try {
          console.log('OAuthCallback: Signing in with custom token')
          await signInWithCustomToken(auth, id_token)
          console.log('OAuthCallback: Signed in successfully')
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('user_id', user_id)
          console.log('OAuthCallback: Tokens stored in localStorage')
          router.push('/chat')
        } catch (error) {
          console.error('Error handling OAuth callback:', error)
          router.push('/signin')
        }
      } else {
        console.error('Missing required parameters in OAuth callback')
        router.push('/signin')
      }
    }

    handleCallback()
  }, [router])

  return <div>Processing authentication...</div>
}