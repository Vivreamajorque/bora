export default function Message({ msg }) {
  const isUser = msg.role === 'user'
  const isStreaming = msg.streaming

  // Render image preview if message has image
  const hasImage = msg.imageData

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      animation: 'fade-up 0.2s ease',
      padding: '2px 0'
    }}>
      {/* Image preview */}
      {hasImage && (
        <div style={{
          marginBottom: 6,
          borderRadius: 12,
          overflow: 'hidden',
          maxWidth: '70%',
          border: '1px solid var(--border)'
        }}>
          <img
            src={msg.imageData}
            alt="envoyée"
            style={{ display: 'block', maxWidth: '100%', maxHeight: 200, objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Text bubble */}
      {(msg.content || isStreaming) && (
        <div style={{
          maxWidth: '85%',
          padding: '12px 16px',
          borderRadius: isUser
            ? '18px 18px 4px 18px'
            : '18px 18px 18px 4px',
          background: isUser ? 'var(--accent)' : 'var(--surface)',
          color: isUser ? '#0a0a0a' : 'var(--text)',
          fontSize: 15,
          lineHeight: 1.55,
          border: isUser ? 'none' : '1px solid var(--border)',
          position: 'relative'
        }}>
          {/* Format Bora responses: preserve line breaks */}
          {isUser ? (
            <span>{msg.content}</span>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {msg.content || ''}
              {isStreaming && (
                <span style={{
                  display: 'inline-block',
                  width: 6,
                  height: 14,
                  background: 'var(--accent)',
                  marginLeft: 2,
                  borderRadius: 1,
                  animation: 'shimmer 0.8s ease infinite',
                  verticalAlign: 'middle'
                }} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <span style={{
        fontSize: 11,
        color: 'var(--text-dim)',
        marginTop: 3,
        padding: '0 4px'
      }}>
        {new Date(msg.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}
