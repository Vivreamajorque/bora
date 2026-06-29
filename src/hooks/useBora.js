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
          stream: true,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || 'Erreur API')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullText += parsed.delta.text
                onChunk(fullText)
              }
            } catch {}
          }
        }
      }

      return fullText
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  return { send, loading }
}
