import { useState, useCallback } from 'react'
import { BORA_SYSTEM_PROMPT } from '../lib/prompt.js'

export function useBora(apiKey) {
  const [loading, setLoading] = useState(false)

  const send = useCallback(async (messages, onChunk) => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: BORA_SYSTEM_PROMPT,
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error?.message || `Erreur ${response.status}`)
      }

      const text = data.content?.[0]?.text || ''
      onChunk(text)
      return text
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  return { send, loading }
}
