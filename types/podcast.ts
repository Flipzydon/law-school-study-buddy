export interface Podcast {
  id: string
  script: string
  audioUrl: string
  duration?: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  voiceUsed: string
  pdfFilename: string
  createdAt: string
}

export interface GeneratePodcastRequest {
  pdfText: string
  pdfFilename: string
  difficulty?: 'basic' | 'intermediate' | 'advanced'
}

export interface GeneratePodcastResponse {
  success: boolean
  script?: string
  audioUrl?: string
  duration?: number
  error?: string
}
