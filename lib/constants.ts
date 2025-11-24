import { Globe, Sparkles, Zap, Video, Youtube, Upload, Music } from "lucide-react"

const LOADING_STATES = [
    { text: "Validating URL" },
    { text: "Fetching source data" },
    { text: "Transcribing (if video)" },
    { text: "Generating copy" },
    { text: "Creating image prompts" },
  ]
  
  const VOICE_OPTIONS = [
    { id: "default", label: "Default", hint: "Clear, friendly" },
    { id: "direct", label: "Direct", hint: "Punchy, concise" },
    { id: "warm", label: "Warm", hint: "Approachable" },
    { id: "bold", label: "Bold", hint: "High-energy" },
  ]
  
  const FEATURES = [
    { icon: Globe, title: "LinkedIn Posts", desc: "Professional, long-form insights", color: "from-blue-500 to-cyan-500" },
    { icon: Sparkles, title: "Instagram Carousels", desc: "5 slides with story flow", color: "from-pink-500 to-rose-500" },
    { icon: Zap, title: "Threads Posts", desc: "Short conversational hooks", color: "from-purple-500 to-indigo-500" },
    { icon: Video, title: "Video Scripts", desc: "Ready to film in minutes", color: "from-green-500 to-emerald-500" },
  ]
  
// Onboarding constants
const ONBOARDING_STEPS = {
  CONNECT_PLATFORM: 1,
  DEFINE_VOICE: 2,
  FIRST_REPURPOSE: 3,
} as const

const PLATFORM_OPTIONS = [
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Connect your YouTube channel to fetch transcripts automatically',
    icon: Youtube,
    color: 'from-red-500 to-red-600',
    available: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Login to access your own TikTok content',
    icon: Music,
    color: 'from-pink-500 to-purple-600',
    available: false, // Coming soon
  },
  {
    id: 'upload',
    name: 'Upload File',
    description: 'Upload video/audio files directly',
    icon: Upload,
    color: 'from-blue-500 to-blue-600',
    available: true,
  },
]

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional', description: 'Formal, authoritative, business-focused' },
  { id: 'friendly', label: 'Friendly', description: 'Warm, approachable, conversational' },
  { id: 'playful', label: 'Playful', description: 'Fun, creative, engaging with humor' },
  { id: 'bold', label: 'Bold', description: 'Confident, direct, attention-grabbing' },
  { id: 'custom', label: 'Custom', description: 'Define your own unique voice' },
]

const ONBOARDING_PROGRESS_STEPS = [
  { step: 1, title: 'Connect Platform', description: 'Choose your content source' },
  { step: 2, title: 'Define Voice', description: 'Set your brand personality' },
  { step: 3, title: 'First Repurpose', description: 'Transform your content' },
]

export { 
  LOADING_STATES, 
  VOICE_OPTIONS, 
  FEATURES, 
  ONBOARDING_STEPS, 
  PLATFORM_OPTIONS, 
  TONE_OPTIONS, 
  ONBOARDING_PROGRESS_STEPS 
}