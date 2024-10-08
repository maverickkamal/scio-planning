"use client"

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { auth } from './firebase'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const DynamicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles: { x: number; y: number; size: number; color: string; t: number }[] = []

    const createParticles = () => {
      const particleCount = Math.floor(canvas.width * canvas.height / 10000)
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          color: `hsl(${Math.random() * 60 + 180}, 100%, ${Math.random() * 30 + 60}%)`,
          t: Math.random() * Math.PI * 2
        })
      }
    }

    createParticles()

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 10, 20, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.t += 0.01
        const a = 100 * Math.sin(particle.t)
        const b = 100 * Math.sin(particle.t * 2)
        particle.x = canvas.width / 2 + a * Math.cos(particle.t) - b * Math.sin(particle.t)
        particle.y = canvas.height / 2 + a * Math.sin(particle.t) + b * Math.cos(particle.t)

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />
}

const GlassmorphicInput = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-white">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-2 bg-white bg-opacity-10 rounded-lg backdrop-filter backdrop-blur-lg border border-white border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200"
    />
  </div>
)

const GlassmorphicButton = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button
    className={`
      w-full py-2 px-4 bg-green-500 bg-opacity-20 hover:bg-blue-500 hover:bg-opacity-20
      backdrop-filter backdrop-blur-lg
      rounded-lg text-white font-semibold
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-green-400
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
)

interface SignupFormProps {
  onBack: () => void;
}

export default function SignupForm({ onBack }: SignupFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const user = userCredential.user

      // Send the user to the chat interface
      router.push('/chat')
    } catch (error) {
      console.error('Error during signup:', error)
      // Show error message to the user
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const response = await axios.get('https://scio-plan-backend.onrender.com/login');
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        console.error('No authorization URL received');
      }
    } catch (error) {
      console.error('Error during Google signup:', error);
      // Show error message to the user
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-900 to-black text-white">
      <DynamicBackground />
      <div className="absolute top-4 left-4 z-10">
        <button onClick={onBack} className="flex items-center text-white hover:text-green-400 transition-colors">
          <ArrowLeft className="mr-2" />
          Back
        </button>
      </div>
      <div className="z-10 w-full max-w-md p-10" style={{
        backgroundColor: "rgba(0, 0, 0, .2)",
        boxShadow: "0 0 50px -50px white",
        backdropFilter: "blur(5px)"
      }}>
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={handleGoogleSignup} className="w-full py-2 px-4 bg-white text-gray-800 rounded-lg hover:bg-green-500 transition-colors duration-200 flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              {/* Google icon paths */}
            </svg>
            Continue with Google
          </button>
        </div>
        <div className="mt-6 text-center text-xs text-gray-300">
          By continuing, you agree to our
          <Link href="/terms" className="text-green-400 hover:text-green-300 transition-colors duration-200 ml-1">
            Terms of Service
          </Link> and
          <Link href="/privacy" className="text-green-400 hover:text-green-300 transition-colors duration-200 ml-1">
            Privacy Policy
          </Link>.
        </div>
      </div>
    </div>
  )
}
