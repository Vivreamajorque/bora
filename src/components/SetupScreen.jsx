import { useState } from 'react'

export default function SetupScreen({ onSave }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [testing, setTesting] = useState(false)

  const handleActivate = async () => {
    const trimmed = key.trim()
    if (!trimmed) return setError('Colle ta clé API ici')

    setTesting(true)
    setError('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': trimmed },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'ok' }]
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error?.message || 'Clé invalide')
      } else {
        onSave(trimmed)
      }
    } catch (e) {
      setError('Erreur de connexion')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', padding: '40px 24px',
      gap: '32px', background: 'var(--bg)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--accent-dim)', border: '1.5px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 20px'
        }}>🌬️</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8 }}>Bora</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: 15 }}>Ton majordome personnel</p>
      </div>

      <div style={{
        width: '100%', maxWidth: 380, background: 'var(--surface)',
        borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '24px'
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16, lineHeight: 1.6 }}>
          Clé API Anthropic pour activer Bora.<br />
          Elle reste uniquement sur ton appareil.
        </p>

        <textarea
          placeholder="sk-ant-api03-..."
          value={key}
          onChange={e => { setKey(e.target.value); setError('') }}
          rows={3}
          style={{
            width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '12px 14px', color: 'var(--text)',
            fontSize: 13, fontFamily: 'monospace', outline: 'none', resize: 'none',
            marginBottom: error ? 8 : 16, lineHeight: 1.5
          }}
        />

        {error && (
          <p style={{ color: '#ef5350', fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>
        )}

        <button
          onClick={handleActivate}
          disabled={!key.trim() || testing}
          style={{
            width: '100%', padding: '14px',
            background: key.trim() && !testing ? 'var(--accent)' : 'var(--surface-2)',
            color: key.trim() && !testing ? '#0a0a0a' : 'var(--text-dim)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: 15, fontWeight: 600,
            cursor: key.trim() && !testing ? 'pointer' : 'not-allowed'
          }}
        >
          {testing ? 'Vérification...' : 'Activer Bora'}
        </button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
        console.anthropic.com → API Keys
      </p>
    </div>
  )
}
