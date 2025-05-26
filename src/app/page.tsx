'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { DiaryEntry } from '@/lib/supabase'
import { format } from 'date-fns'

export default function Home() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(true)

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
            user_id: 'default-user' // In a real app, this would be the authenticated user's ID
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

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">My Personal Diary</h1>
      
      <form onSubmit={handleSubmit} className="mb-12 space-y-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="mood" className="block text-sm font-medium text-gray-700">Mood</label>
          <input
            type="text"
            id="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="How are you feeling today?"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Entry</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save Entry
        </button>
      </form>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Previous Entries</h2>
        {loading ? (
          <p>Loading entries...</p>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{entry.title}</h3>
                <span className="text-sm text-gray-500">
                  {format(new Date(entry.created_at), 'MMMM d, yyyy')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Mood: {entry.mood}</p>
              <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
            </article>
          ))
        )}
      </div>
    </main>
  )
} 