import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { VoiceProfile } from '@/lib/types'

interface VoiceProfilesResponse {
  profiles: VoiceProfile[]
}

interface CreateVoiceProfilePayload {
  name?: string
  tone: string
  audience: string
  keywords?: string[]
  vocabulary?: string[]
  cta?: string
  hashtags?: string[]
  style?: string
}

export function useVoiceProfiles() {
  return useQuery<VoiceProfilesResponse>({
    queryKey: ['voice-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/voice-profiles')
      if (!response.ok) {
        throw new Error('Failed to fetch voice profiles')
      }
      return response.json()
    },
  })
}

export function useCreateVoiceProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (payload: CreateVoiceProfilePayload) => {
      const response = await fetch('/api/voice-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create voice profile')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch voice profiles
      queryClient.invalidateQueries({ queryKey: ['voice-profiles'] })
    },
  })
}
