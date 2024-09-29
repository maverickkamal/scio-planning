"use client"

import { useState, useEffect, useRef } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Calendar as CalendarIcon, Plus, Send, Paperclip, Copy, RotateCcw, Edit, Settings, LogOut, History, ListTodo, Loader2, Check, FileText, Film, Image as ImageIcon, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import Image from 'next/image'
import ScioLogo from './scio-logo.svg'
import axios from 'axios'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ReactMarkdown from 'react-markdown'
import { useAuth } from './AuthContext'
import { auth } from './firebase'
import { useRouter } from 'next/navigation'
import { signOut, updateProfile, updateEmail } from 'firebase/auth'
import DefaultProfilePic from './R.jpg'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ScheduleItem {
  type: string;
  task: string;
  start: string;
  end: string;
}

interface UploadedFile {
  name: string;
  type: string;
  url: string;
  file: File;
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
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles: { x: number; y: number; size: number; color: string; speed: number }[] = []

    const createParticles = () => {
      const particleCount = Math.floor(canvas.width * canvas.height / 10000)
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          color: `hsl(${Math.random() * 60 + 180}, 100%, ${Math.random() * 30 + 60}%)`,
          speed: 0.1 + Math.random() * 0.5
        })
      }
    }

    createParticles()

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 10, 20, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.y -= particle.speed
        if (particle.y < 0) {
          particle.y = canvas.height
        }

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

const GlassmorphicTextarea = ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full px-4 py-2 bg-white bg-opacity-10 rounded-lg backdrop-filter backdrop-blur-lg border border-white border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 resize-none"
  />
)
// eslint-disable-next-line @typescript-eslint/no-unused-vars


export default function ScioAIPlannerInterface() {
  const router = useRouter()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Array<{id: number, role: 'human' | 'assistant', content: string, files?: UploadedFile[]}>>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>('chat')
  const [inputText, setInputText] = useState('')
  const [logoSize, setLogoSize] = useState(32)
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
  const [sentFiles, setSentFiles] = useState<UploadedFile[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [profilePic, setProfilePic] = useState(DefaultProfilePic)
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
// eslint-disable-next-line @typescript-eslint/no-unused-vars


  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSidebarItemClick = (section: string) => {
    if (section === 'new') {
      setMessages([])
      setInputText('')
      setUploadedFiles([])
      setActiveSection('chat')
    } else {
      setActiveSection(section)
      setIsSidebarExpanded(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        file: file
      }))
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = async (content: string = inputText, files: UploadedFile[] = uploadedFiles, messageId?: number) => {
    if (!content.trim() && files.length === 0) return
    setIsLoading(true)

    let updatedMessages;
    if (messageId) {
      // Update existing message
      updatedMessages = messages.map(msg => 
        msg.id === messageId ? { ...msg, content, files } : msg
      )
      // Remove subsequent AI message if it exists
      const messageIndex = updatedMessages.findIndex(msg => msg.id === messageId)
      updatedMessages = updatedMessages.slice(0, messageIndex + 1)
    } else {
      // Create new message
      const newMessage = { id: Date.now(), role: 'human' as const, content, files }
      updatedMessages = [...messages, newMessage]
    }

    setMessages(updatedMessages)
    setInputText('')
    setSentFiles(files)
    setUploadedFiles([])

    try {
      const formData = new FormData()
      formData.append('message', content)
      formData.append('user_id', localStorage.getItem('user_id') || '')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      files.forEach((file, index) => {
        formData.append(`files`, file.file)
      })

      const response = await axios.post('http://localhost:8000/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('API response:', response.data)

      if (response.data && response.data.content) {
        const assistantMessage = { 
          id: Date.now(), 
          role: 'assistant' as const, 
          content: response.data.content
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data)
      }
      const errorMessage = { 
        id: Date.now(),
        role: 'assistant' as const, 
        content: "I'm sorry, but I encountered an error. Please try again."
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setSentFiles([])
    }
  }

  const fetchSchedule = async () => {
    try {
      const response = await axios.post('http://localhost:8000/get_schedule', null, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('Schedule response:', response.data)
      if (response.data && Array.isArray(response.data.schedule)) {
        setSchedule(response.data.schedule)
      } else {
        console.error('Invalid schedule data:', response.data)
        setSchedule([])
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data)
      }
      setSchedule([])
    }
  }

  useEffect(() => {
    console.log('Active section changed:', activeSection)
    if (activeSection === 'schedules') {
      fetchSchedule()
    }
  }, [activeSection])

  useEffect(() => {
    setLogoSize(isSidebarExpanded ? 48 : 32)
  }, [isSidebarExpanded])

  useEffect(() => {
    console.log('Current messages:', messages)
  }, [messages])

  useEffect(() => {
    console.log('Current schedule:', schedule)
  }, [schedule])

  useEffect(scrollToBottom, [messages])

  const handleCopyMessage = (content: string, id: number) => {
    navigator.clipboard.writeText(content)
    setCopiedMessageId(id)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  const handleRetryMessage = async () => {
    const lastUserMessageIndex = messages.findIndex(msg => msg.role === 'human')
    if (lastUserMessageIndex !== -1) {
      const lastUserMessage = messages[lastUserMessageIndex]
      // Remove only the last assistant message
      const updatedMessages = messages.slice(0, lastUserMessageIndex + 1)
      setMessages(updatedMessages)
      
      // Send the last user message to AI and update the response
      await handleSendMessage(lastUserMessage.content, lastUserMessage.files || [], lastUserMessage.id)
    }
  }

  const handleEditMessage = (id: number, content: string) => {
    const lastUserMessageIndex = [...messages].reverse().findIndex(msg => msg.role === 'human')
    if (messages[messages.length - 1 - lastUserMessageIndex].id !== id) {
      alert("You can only edit the most recent message.")
      return
    }
    setEditingMessageId(id)
    setEditedContent(content)
  }

  const handleSaveEdit = async (id: number) => {
    const editedMessageIndex = messages.findIndex(msg => msg.id === id)
    if (editedMessageIndex !== -1) {
      const updatedMessages = [...messages]
      updatedMessages[editedMessageIndex] = {
        ...updatedMessages[editedMessageIndex],
        content: editedContent
      }
      // Remove the subsequent AI message if it exists
      if (editedMessageIndex < messages.length - 1 && updatedMessages[editedMessageIndex + 1].role === 'assistant') {
        updatedMessages.splice(editedMessageIndex + 1, 1)
      }
      setMessages(updatedMessages)
      setEditingMessageId(null)
      setEditedContent('')
      
      // Send the edited message to AI and update the response
      await handleSendMessage(editedContent, [], id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_id')
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    if (!user && !localStorage.getItem('access_token')) {
      router.push('/signin')
    }
  }, [user, router])

  useEffect(() => {
    // Fetch user info
    const fetchUserInfo = async () => {
      const user = auth.currentUser
      if (user) {
        setUserName(user.displayName || '')
        setUserEmail(user.email || '')
      }
    }
    fetchUserInfo()
  }, [])

  const handleUpdateProfile = async (name: string, email: string) => {
    const user = auth.currentUser
    if (user) {
      try {
        await updateProfile(user, { displayName: name })
        if (email !== user.email) {
          await updateEmail(user, email)
        }
        setUserName(name)
        setUserEmail(email)
      } catch (error) {
        console.error('Error updating profile:', error)
      }
    }
  }

  return (
    <div className="flex h-screen text-white overflow-hidden bg-gradient-to-br from-teal-900 to-black">
      <aside className={`bg-black bg-opacity-30 backdrop-filter backdrop-blur-lg flex flex-col items-center py-4 transition-all duration-300 ${isSidebarExpanded ? 'w-64' : 'w-12'}`}
             onMouseEnter={() => setIsSidebarExpanded(true)}
             onMouseLeave={() => setIsSidebarExpanded(false)}>
        <div className="mb-6">
          <Image src={ScioLogo} alt="Scio Logo" width={logoSize} height={logoSize} className="transition-all duration-300" />
        </div>
        <div className="flex flex-col items-center space-y-4 flex-grow w-full">
          <Button variant="ghost" className={`w-full flex items-center justify-start px-3 ${activeSection === 'new' ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`}
                  onClick={() => handleSidebarItemClick('new')}>
            <Plus className="h-4 w-4 mr-2" />
            {isSidebarExpanded && <span>New Chat</span>}
          </Button>
          <Button variant="ghost" className={`w-full flex items-center justify-start px-3 ${activeSection === 'history' ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`}
                  onClick={() => {}}>
            <History className="h-4 w-4 mr-2" />
            {isSidebarExpanded && <span>Chat History</span>}
          </Button>
          <Button variant="ghost" className={`w-full flex items-center justify-start px-3 ${activeSection === 'schedules' ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`}
                  onClick={() => handleSidebarItemClick('schedules')}>
            <ListTodo className="h-4 w-4 mr-2" />
            {isSidebarExpanded && <span>Schedules</span>}
          </Button>
          <Button variant="ghost" className={`w-full flex items-center justify-start px-3 ${activeSection === 'calendar' ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`}
                  onClick={() => handleSidebarItemClick('calendar')}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            {isSidebarExpanded && <span>Calendar</span>}
          </Button>
        </div>
        <div className="flex flex-col items-center space-y-4 mt-auto w-full">
          <Button variant="ghost" className="w-full flex items-center justify-start px-3 hover:bg-zinc-800">
            <Image src={profilePic} alt="Profile" width={24} height={24} className="rounded-full mr-2" />
            {isSidebarExpanded && <span>{userName || userEmail || 'Profile'}</span>}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-start px-3 hover:bg-zinc-800">
                <Settings className="h-4 w-4 mr-2" />
                {isSidebarExpanded && <span>Settings</span>}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>User Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <Input id="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                </div>
                <Button onClick={() => handleUpdateProfile(userName, userEmail)}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" className="w-full flex items-center justify-start px-3 hover:bg-zinc-800" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            {isSidebarExpanded && <span>Logout</span>}
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="max-w-3xl mx-auto w-full">
            {activeSection === 'schedules' ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Schedule</h2>
                {schedule.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-zinc-800">
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Task</th>
                        <th className="p-2 text-left">Start</th>
                        <th className="p-2 text-left">End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((item, index) => (
                        <tr key={index} className="border-t border-zinc-700">
                          <td className="p-2">{item.type}</td>
                          <td className="p-2">{item.task}</td>
                          <td className="p-2">{new Date(item.start).toLocaleString()}</td>
                          <td className="p-2">{new Date(item.end).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No schedule items available.</p>
                )}
              </div>
            ) : activeSection === 'calendar' ? (
              <div className="mb-4">
                <Calendar className="rounded-md border" />
              </div>
            ) : (
              <>
                {messages.length === 0 ? (
                  <div className="relative flex flex-col items-center justify-center h-full">
                    <BackgroundAnimation />
                    <div className="z-10">
                      <Image src={ScioLogo} alt="Scio Logo" width={128} height={128} />
                      <p className="text-gray-400 mt-4">Start a new conversation</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div key={message.id} className={`flex ${message.role === 'human' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${message.role === 'human' ? 'text-right' : 'text-left'}`}>
                          <p className="text-sm text-gray-400 mb-1">{message.role === 'human' ? 'You' : 'Scio'}</p>
                          <div className="prose prose-invert max-w-none">
                            {editingMessageId === message.id ? (
                              <>
                                <GlassmorphicTextarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  className="mb-2"
                                />
                                <Button onClick={() => handleSaveEdit(message.id)}>Save</Button>
                              </>
                            ) : (
                              <>
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                {message.files && message.files.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {message.files.map((file, fileIndex) => (
                                      <div key={fileIndex} className="text-xs bg-zinc-800 rounded p-1">
                                        {file.name}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex justify-end mt-2 space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6"
                                    onClick={() => handleCopyMessage(message.content, message.id)}
                                  >
                                    {copiedMessageId === message.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{copiedMessageId === message.id ? 'Copied!' : 'Copy'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {message.role === 'human' && index === messages.length - 2 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6"
                                      onClick={() => handleEditMessage(message.id, message.content)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {message.role === 'assistant' && index === messages.length - 1 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6"
                                      onClick={handleRetryMessage}
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Retry</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {activeSection !== 'schedules' && activeSection !== 'calendar' && (
          <footer className="bg-black bg-opacity-30 backdrop-filter backdrop-blur-lg p-4 border-t border-zinc-800">
            <div className="max-w-3xl mx-auto w-full relative">
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      {file.type.startsWith('image/') ? (
                        <img src={file.url} alt={file.name} className="w-12 h-12 object-cover rounded" />
                      ) : file.type.startsWith('video/') ? (
                        <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center">
                          <Film className="h-6 w-6" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center">
                          <FileText className="h-6 w-6" />
                        </div>
                      )}
                      <button
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <GlassmorphicTextarea 
                placeholder="Ask Scio..." 
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute right-2 bottom-2 flex space-x-2">
                <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-zinc-800">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Paperclip className="h-4 w-4" />
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv"
                    onChange={handleFileUpload}
                    multiple
                  />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 hover:bg-zinc-800" 
                  disabled={(!inputText.trim() && uploadedFiles.length === 0) || isLoading}
                  onClick={() => handleSendMessage()}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {sentFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {sentFiles.map((file, index) => (
                  <div key={index} className="text-xs bg-zinc-800 rounded p-1">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </footer>
        )}
      </main>
    </div>
  )
}


