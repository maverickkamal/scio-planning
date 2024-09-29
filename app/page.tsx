"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Homepage from './homepage'
import SignupForm from './signup-form'
import SigninForm from './signin-form'
import ChatPage from './chat/page'
import OAuthCallback from './oauth-callback'
import { AuthProvider } from './AuthContext'
import SigninPage from './signin/page'

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    if (pathname === '/signup') {
      setCurrentPage('signup')
    } else if (pathname === '/signin') {
      setCurrentPage('signin')
    } else if (pathname === '/chat') {
      setCurrentPage('chat')
    } else if (pathname === '/oauth-callback') {
      setCurrentPage('oauth-callback')
    } else {
      setCurrentPage('home')
    }
  }, [pathname])

  const handleGetAccess = () => {
    router.push('/signup')
  }

  const handleSignIn = () => {
    router.push('/signin')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Homepage onGetAccess={handleGetAccess} onSignIn={handleSignIn} />
      case 'signup':
        return <SignupForm onBack={() => router.push('/')} />
      case 'signin':
        return <SigninPage />
      case 'chat':
        return <ChatPage />
      case 'oauth-callback':
        return <OAuthCallback />
      default:
        return <Homepage onGetAccess={handleGetAccess} onSignIn={handleSignIn} />
    }
  }

  return (
    <AuthProvider>
      <div>
        {renderPage()}
      </div>
    </AuthProvider>
  )
}