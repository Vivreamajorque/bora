import { useState } from 'react'

export default function SetupScreen({ onSave }) {
  const [key, setKey] = useState('')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px 24px',
      gap: '32px',
      background: 'var(--bg)'
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--accent-dim)',
          border: '1.5px solid var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          margin: '0 auto 20px'
        }}>🌬️</div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          color: 'var(--text)',
          marginBottom: 8
        }}>Bora</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: 15 }}>
          Ton majordome personnel
        </p>
      </div>

      {/* Setup card */}
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        padding: '24px'
      }}>
        <p style={{
          fontSize: 13,
          color: 'var(--text-dim)',
          marginBottom: 16,
          lineHeight: 1.6
        }}>
          Clé API Anthropic pour activer Bora.<br />
          Elle reste uniquement sur ton appareil.
        </p>

        <input
          type="password"
          placeholder="sk-ant-..."
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && key.startsWith('sk-') && onSave(key)}
          style={{
            width: '100%',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            color: 'var(--text)',
            fontSize: 15,
            fontFamily: 'monospace',
            outline: 'none',
            marginBottom: 16
          }}
        />

        <button
          onClick={() => key.startsWith('sk-') && onSave(key)}
          disabled={!key.startsWith('sk-')}
          style={{
            width: '100%',
            padding: '14px',
            background: key.startsWith('sk-') ? 'var(--accent)' : 'var(--surface-2)',
            color: key.startsWith('sk-') ? '#0a0a0a' : 'var(--text-dim)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 15,
            fontWeight: 600,
            cursor: key.startsWith('sk-') ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          Activer Bora
        </button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
        Récupère ta clé sur console.anthropic.com
      </p>
    </div>
  )
}
