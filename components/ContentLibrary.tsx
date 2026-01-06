'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

interface ContentItem {
  id: string
  user_id: string
  pdf_filename: string
  content_type: 'flashcards' | 'podcast' | 'slides' | 'quiz'
  content_data: any
  created_at: string
}

type ContentFilter = 'all' | 'flashcards' | 'podcast' | 'slides' | 'quiz'
type SortOption = 'newest' | 'oldest' | 'name'

const ITEMS_PER_PAGE = 10

export default function ContentLibrary() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ContentFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = createClient()

  const fetchContent = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please log in to view your content')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('generated_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setContent(data || [])
    } catch (err: any) {
      console.error('Error fetching content:', err)
      setError('Failed to load content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Apply filters, sorting, and search
  useEffect(() => {
    let result = [...content]

    // Filter by type
    if (filter !== 'all') {
      result = result.filter(item => item.content_type === filter)
    }

    // Search by filename
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.pdf_filename.toLowerCase().includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        return a.pdf_filename.localeCompare(b.pdf_filename)
      }
    })

    setFilteredContent(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [content, filter, sortBy, searchQuery])

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      const { error: deleteError } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      setContent(prev => prev.filter(item => item.id !== id))
      setDeleteConfirm(null)
    } catch (err: any) {
      console.error('Error deleting content:', err)
      setError('Failed to delete content. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'flashcards':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      case 'podcast':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )
      case 'slides':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'quiz':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        )
      default:
        return null
    }
  }

  const getContentColor = (type: string) => {
    switch (type) {
      case 'flashcards':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
      case 'podcast':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
      case 'slides':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
      case 'quiz':
        return 'bg-nigerian-100 text-nigerian-600 dark:bg-nigerian-900/30 dark:text-nigerian-400'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getContentDetails = (item: ContentItem) => {
    switch (item.content_type) {
      case 'flashcards':
        const cardCount = item.content_data?.flashcards?.length || item.content_data?.cardCount || 0
        return `${cardCount} cards`
      case 'podcast':
        const duration = item.content_data?.duration || 0
        const mins = Math.floor(duration / 60)
        const secs = duration % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
      case 'slides':
        const slideCount = item.content_data?.slideCount || item.content_data?.slides?.length || 0
        return `${slideCount} slides`
      case 'quiz':
        const questionCount = item.content_data?.questions?.length || 10
        return `${questionCount} questions`
      default:
        return ''
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE)
  const paginatedContent = filteredContent.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const filterButtons: { value: ContentFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'flashcards', label: 'Flashcards' },
    { value: 'podcast', label: 'Podcasts' },
    { value: 'slides', label: 'Slides' }
  ]

  if (isLoading) {
    return (
      <Card variant="default" padding="lg">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your content...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card variant="default" padding="lg">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Error Loading Content</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button onClick={fetchContent} variant="primary">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card variant="glass" padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === btn.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-600'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full lg:w-64 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">By Name</option>
          </select>
        </div>
      </Card>

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <Card variant="default" padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery || filter !== 'all' ? 'No matching content' : 'No content yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload a PDF and generate quizzes, flashcards, podcasts, or slides to see them here.'}
            </p>
            {!searchQuery && filter === 'all' && (
              <Button onClick={() => window.location.href = '/'} variant="primary" className="mt-4">
                Upload a PDF
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            <AnimatePresence>
              {paginatedContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card variant="default" padding="md" className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getContentColor(item.content_type)}`}>
                        {getContentIcon(item.content_type)}
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.pdf_filename.replace('.pdf', '')}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span className="capitalize">{item.content_type}</span>
                          <span>•</span>
                          <span>{getContentDetails(item)}</span>
                          <span>•</span>
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {deleteConfirm === item.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(item.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deleting...' : 'Confirm'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
                              disabled={isDeleting}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Results count */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredContent.length)} of {filteredContent.length} items
          </p>
        </>
      )}
    </div>
  )
}
