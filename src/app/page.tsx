'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { DiaryEntry } from '@/lib/supabase'
import { format } from 'date-fns'
import { FaBook, FaPen, FaRegSmile, FaTrash } from 'react-icons/fa'

export default function Home() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('diary_entries')
        .insert([
          {
            title,
            content,
            mood,
            user_id: 'default-user'
          }
        ])

      if (error) throw error

      setTitle('')
      setContent('')
      setMood('')
      fetchEntries()
    } catch (error) {
      console.error('Error creating entry:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      setEntries(entries.filter(entry => entry.id !== id))
    } catch (error) {
      console.error('Error deleting entry:', error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-md mx-auto">
      {/* Input to add a new entry section */}
      <section className="mb-8 p-6 rounded-lg shadow-md bg-gradient-to-r from-purple-300 to-pink-300">
        <h2 className="text-xl font-semibold mb-4 text-white text-center">Input to add a new entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors p-2"
              required
            />
          </div>
          
          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-white mb-1">
              Mood
            </label>
            <input
              type="text"
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors p-2"
              placeholder="How are you feeling today?"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-white mb-1">
              Entry
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors p-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-purple-600 py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          >
            Save Entry
          </button>
        </form>
      </section>

      {/* Saved entries section */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your memories...</p>
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="bg-blue-700 text-white p-6 rounded-lg shadow-md border border-blue-900">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{entry.title}</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm opacity-80">
                    {format(new Date(entry.created_at), 'MMMM d, yyyy')}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="text-red-300 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete entry"
                  >
                    {deletingId === entry.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-300"></div>
                    ) : (
                      <FaTrash className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3 flex items-center">
                Mood: {entry.mood}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed opacity-95">{entry.content}</p>
            </article>
          ))
        )}
      </div>
    </main>
  )
} 