export interface Flashcard {
  id: string
  front: string
  back: string
  type: 'question' | 'term' | 'case'
  difficulty?: 'basic' | 'intermediate' | 'advanced'
  tags?: string[]
}

export interface FlashcardSet {
  id: string
  title: string
  description?: string
  cards: Flashcard[]
  createdAt: string
  pdfFilename: string
}

export interface GenerateFlashcardsRequest {
  pdfText: string
  filename: string
  count?: number
}

export interface GenerateFlashcardsResponse {
  success: boolean
  flashcards?: Flashcard[]
  error?: string
}
