export interface Slide {
  title: string
  bullets: string[]
  footer?: string
}

export interface SlidePresentation {
  id: string
  slides: Slide[]
  slideCount: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  pdfFilename: string
  slidesUrl?: string
  createdAt: string
}

export interface GenerateSlidesRequest {
  pdfText: string
  pdfFilename: string
  difficulty?: 'basic' | 'intermediate' | 'advanced'
}

export interface GenerateSlidesResponse {
  success: boolean
  slides?: Slide[]
  slidesUrl?: string
  slideCount?: number
  error?: string
}
