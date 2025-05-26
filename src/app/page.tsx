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
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-center mb-8 space-x-3">
        <FaBook className="text-4xl text-purple-600" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          My Personal Diary
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-12 space-y-4 bg-white p-8 rounded-2xl shadow-lg border border-purple-100">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            <FaPen className="inline-block mr-2 text-purple-500" />
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
            required
          />
        </div>
        
        <div>
          <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">
            <FaRegSmile className="inline-block mr-2 text-purple-500" />
            Mood
          </label>
          <input
            type="text"
            id="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
            placeholder="How are you feeling today?"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            <FaBook className="inline-block mr-2 text-purple-500" />
            Entry
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02]"
        >
          Save Entry
        </button>
      </form>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <FaBook className="mr-2 text-purple-600" />
          Previous Entries
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your memories...</p>
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="bg-white p-6 rounded-2xl shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-purple-900">{entry.title}</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 bg-purple-50 px-3 py-1 rounded-full">
                    {format(new Date(entry.created_at), 'MMMM d, yyyy')}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete entry"
                  >
                    {deletingId === entry.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    ) : (
                      <FaTrash className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-purple-600 mb-3 flex items-center">
                <FaRegSmile className="mr-2" />
                Mood: {entry.mood}
              </p>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
            </article>
          ))
        )}
      </div>
    </main>
  )
} 