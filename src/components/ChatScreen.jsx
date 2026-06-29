import { useState, useRef, useEffect, useCallback } from 'react'
import { useBora } from '../hooks/useBora.js'
import { useVoice } from '../hooks/useVoice.js'
import Message from './Message.jsx'

const WELCOME = {
  role: 'assistant',
  content: '🌬️ Bora actif.\n→ Déverse.',
  ts: Date.now(),
  id: 'welcome'
}

export default function ChatScreen({ apiKey, onReset }) {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [pendingImage, setPendingImage] = useState(null) // { data: base64, preview: dataURL }
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const { send, loading } = useBora(apiKey)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // Voice
  const handleTranscript = useCallback((text) => {
    setInput(prev => prev ? prev + ' ' + text : text)
    inputRef.current?.focus()
  }, [])
  const { recording, supported: voiceSupported, start: startVoice, stop: stopVoice } = useVoice(handleTranscript)

  // Send message
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text && !pendingImage) return

    const userMsg = {
      role: 'user',
      content: text || (pendingImage ? '[Image envoyée]' : ''),
      imageData: pendingImage?.preview,
      ts: Date.now(),
      id: Date.now().toString()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setPendingImage(null)

    // Build API messages (no images in API for now — describe them)
    const apiMessages = [
      ...messages.filter(m => m.id !== 'welcome').map(m => ({
        role: m.role,
        content: m.content
      })),
      {
        role: 'user',
        content: pendingImage
          ? `[L'utilisatrice envoie une photo. Demande-lui ce qu'elle veut en faire si ce n'est pas clair, ou traite-la si le contexte est évident.]${text ? '\n' + text : ''}`
          : text
      }
    ]

    // Add streaming assistant message
    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      streaming: true,
      ts: Date.now(),
      id: assistantId
    }])

    try {
      await send(apiMessages, (chunk) => {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: chunk } : m
        ))
      })
      // Mark done
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, streaming: false } : m
      ))
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: `⚠️ Erreur : ${err.message}`, streaming: false }
          : m
      ))
    }
  }, [input, pendingImage, messages, send])

  // Image pick
  const handleImagePick = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataURL = ev.target.result
      const base64 = dataURL.split(',')[1]
      setPendingImage({ data: base64, preview: dataURL, mime: file.type })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [])

  // Keyboard
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Quick prompts
  const quickPrompts = [
    { label: '📬 Mails', text: 'Lis mes mails' },
    { label: '📅 Agenda', text: 'Qu\'est-ce que j\'ai aujourd\'hui ?' },
    { label: '🌀 Bloquée', text: 'Je suis bloquée, aide-moi' },
    { label: '🗂️ Drive', text: 'Trie mon drive' },
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg)',
      paddingTop: 'var(--safe-top)',
      paddingBottom: 'var(--safe-bottom)'
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 12px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18
          }}>🌬️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.2px' }}>Bora</div>
            <div style={{ fontSize: 11, color: loading ? 'var(--accent)' : 'var(--text-dim)' }}>
              {loading ? 'en train de répondre…' : 'prêt'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: 20,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 8
          }}
        >⋯</button>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div style={{
          position: 'absolute',
          top: 64,
          right: 16,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          zIndex: 100,
          minWidth: 180
        }}>
          <button
            onClick={() => { setMessages([WELCOME]); setShowMenu(false) }}
            style={menuItemStyle}
          >🗑️ Vider la conversation</button>
          <button
            onClick={() => { onReset(); setShowMenu(false) }}
            style={{ ...menuItemStyle, color: 'var(--danger)' }}
          >🔑 Changer de clé API</button>
        </div>
      )}

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '12px 16px',
          overflowX: 'auto',
          flexShrink: 0,
          scrollbarWidth: 'none'
        }}>
          {quickPrompts.map(qp => (
            <button
              key={qp.label}
              onClick={() => { setInput(qp.text); inputRef.current?.focus() }}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                color: 'var(--text-mid)',
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >{qp.label}</button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}
        onClick={() => setShowMenu(false)}
      >
        {messages.map(msg => (
          <Message key={msg.id} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {pendingImage && (
        <div style={{
          padding: '8px 16px',
          flexShrink: 0
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '6px 10px'
          }}>
            <img src={pendingImage.preview} alt="" style={{
              width: 40, height: 40, borderRadius: 6, objectFit: 'cover'
            }} />
            <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>Photo prête</span>
            <button
              onClick={() => setPendingImage(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16, padding: 0 }}
            >✕</button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end'
      }}>
        {/* Photo button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          style={iconButtonStyle}
          title="Ajouter une photo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleImagePick} />

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Déverse..."
          rows={1}
          style={{
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '10px 16px',
            color: 'var(--text)',
            fontSize: 15,
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.4,
            maxHeight: 120,
            overflowY: 'auto'
          }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />

        {/* Voice button */}
        {voiceSupported && (
          <button
            onPointerDown={startVoice}
            onPointerUp={stopVoice}
            onPointerLeave={stopVoice}
            style={{
              ...iconButtonStyle,
              background: recording ? 'var(--accent)' : 'var(--surface)',
              color: recording ? '#0a0a0a' : 'var(--text-dim)',
              border: recording ? 'none' : '1px solid var(--border)'
            }}
            title="Maintenir pour parler"
          >
            {recording ? (
              <div style={{ display: 'flex', gap: 2, alignItems: 'center', height: 20 }}>
                {[0, 0.1, 0.2].map(d => (
                  <div key={d} style={{
                    width: 3, height: 20, background: '#0a0a0a', borderRadius: 2,
                    animation: `wave 0.6s ease ${d}s infinite`
                  }} />
                ))}
              </div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={loading || (!input.trim() && !pendingImage)}
          style={{
            ...iconButtonStyle,
            background: (input.trim() || pendingImage) && !loading ? 'var(--accent)' : 'var(--surface)',
            color: (input.trim() || pendingImage) && !loading ? '#0a0a0a' : 'var(--text-dim)',
            border: 'none',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? (
            <div style={{
              width: 18, height: 18, border: '2px solid currentColor',
              borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

const iconButtonStyle = {
  width: 42,
  height: 42,
  borderRadius: '50%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-dim)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'all 0.15s'
}

const menuItemStyle = {
  display: 'block',
  width: '100%',
  padding: '12px 16px',
  background: 'none',
  border: 'none',
  color: 'var(--text)',
  fontSize: 14,
  cursor: 'pointer',
  textAlign: 'left',
  borderBottom: '1px solid var(--border)'
}
