import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Menu } from 'lucide-react'
import Image from 'next/image'
import ScioLogo from './scio-logo.svg'

interface HomepageProps {
  onGetAccess: () => void;
  onSignIn: () => void;
}

const BackgroundAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles: { x: number; y: number; radius: number; angle: number; speed: number; color: string }[] = []

    const createParticles = () => {
      const particleCount = Math.floor(canvas.width * canvas.height / 3000)
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * Math.min(canvas.width, canvas.height) * 0.7,
          angle: Math.random() * Math.PI * 2,
          speed: 0.0002 + Math.random() * 0.0005,
          color: `hsl(${160 + Math.random() * 60}, 100%, ${70 + Math.random() * 30}%)`,
        })
      }
    }

    createParticles()

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 10, 20, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.angle -= particle.speed

        particle.x = canvas.width / 2 + Math.cos(particle.angle) * particle.radius
        particle.y = canvas.height / 2 + Math.sin(particle.angle) * particle.radius

        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(
          particle.x - Math.cos(particle.angle) * 20,
          particle.y - Math.sin(particle.angle) * 20
        )
        ctx.strokeStyle = particle.color
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      resizeCanvas()
      particles.length = 0
      createParticles()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas style={{filter: "brightness(.5)"}} ref={canvasRef} className="fixed inset-0 z-0" />
}

const GlassmorphicButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => (
  <button
    className={`
      px-4 py-2 text-sm sm:text-base font-semibold text-white
      bg-green-500 bg-opacity-20 backdrop-filter backdrop-blur-lg
      hover:bg-blue-500 hover:bg-opacity-20
      rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md
      transition-all duration-200 ease-in
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
)

export default function Homepage({ onGetAccess, onSignIn }: HomepageProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-x-hidden">
      <BackgroundAnimation />
      <header className="fixed top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-black bg-opacity-30 backdrop-filter backdrop-blur-lg">
        <div className="flex items-center space-x-4">
          <Image src={ScioLogo} alt="Scio Logo" width={32} height={32} />
          <span className="text-2xl font-bold">Scio</span>
        </div>
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            <li><Link href="#" className="hover:text-green-500 transition-colors duration-200">Features</Link></li>
            <li><Link href="#" className="hover:text-green-500 transition-colors duration-200">About</Link></li>
            <li><Link href="#" className="hover:text-green-500 transition-colors duration-200">Contact</Link></li>
          </ul>
        </nav>
        <div className="hidden md:flex space-x-2 sm:space-x-4">
          <GlassmorphicButton onClick={onGetAccess}>Start for free</GlassmorphicButton>
        </div>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50 backdrop-filter backdrop-blur-md md:hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Link href="#" className="text-xl" onClick={() => setMenuOpen(false)}>Features</Link>
            <Link href="#" className="text-xl" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="#" className="text-xl" onClick={() => setMenuOpen(false)}>Contact</Link>
            <GlassmorphicButton onClick={() => { onSignIn(); setMenuOpen(false); }}>Start for free</GlassmorphicButton>
          </div>
        </div>
      )}

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 mt-32 mb-32">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">AI-Powered Student Planner</h1>
        <p style={{
          backgroundColor: "rgb(19 42 67 / 50%)",
          borderRadius: "10px",
          padding: "15px 0",
        }} className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl">
          Sync your studies with Google Calendar and Tasks for effortless planning
        </p>
        <div className="flex space-x-4">
          <GlassmorphicButton className="text-base sm:text-lg" onClick={onGetAccess}>Get started</GlassmorphicButton>
          <a className="text-base sm:text-lg" href="#features">
            <GlassmorphicButton>Learn more</GlassmorphicButton>
          </a>
        </div>
      </main>

      <footer className="relative z-10 mt-auto p-4 flex flex-col sm:flex-row justify-between items-center bg-black bg-opacity-30 backdrop-filter backdrop-blur-lg">
        <p className="mb-2 sm:mb-0">Made with ❤️ from Nigeria</p>
        <p className="mb-2 sm:mb-0">Copyright © 2024 Scio. All rights reserved.</p>
        <div className="flex space-x-4">
          <Link href="https://github.com/maverickkamal" aria-label="GitHub"><Github className="w-6 h-6 hover:text-gray-300 transition-colors duration-200" /></Link>
          <Link href="https://x.com/maverickkama" aria-label="Twitter"><Twitter className="w-6 h-6 hover:text-gray-300 transition-colors duration-200" /></Link>
          <Link href="https://www.linkedin.com/in/musa-kamaludeen/" aria-label="LinkedIn"><Linkedin className="w-6 h-6 hover:text-gray-300 transition-colors duration-200" /></Link>
        </div>
      </footer>
    </div>
  )
}
