import '../../styles/components/chat/chatMessageBubble.css'

import ChatAvatar from './ChatAvatar.jsx'
import { useEffect, useState } from 'react'

export default function ChatMessageBubble({ message }) {
  if (message?.kind === 'guard') {
    return <div className="chat-time-guard">{message.label}</div>
  }

  const { from, author, initials, avatarUrl, text, time, createdAt, messageType, fileUrl, isUploading, isFailed } = message
  const isMe = from === 'me'
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const type = String(messageType || 'TEXT').toUpperCase()

  const detailTime = (() => {
    if (!createdAt) return ''
    const d = new Date(createdAt)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleString()
  })()

  const bubbleContent = (() => {
    if (type === 'IMAGE') {
      if (!fileUrl) return <span>(Image)</span>
      return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className="chat-bubble-mediaBtn"
            type="button"
            aria-label="View image"
            onClick={() => setIsViewerOpen(true)}
          >
            <img src={fileUrl} alt="" style={{ maxWidth: 260, maxHeight: 260 }} />
          </button>
          {isUploading ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.25)',
                color: 'white',
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 600
              }}
            >
              Uploading…
            </div>
          ) : null}

          {isFailed ? (
            <div
              style={{
                position: 'absolute',
                left: 8,
                bottom: 8,
                padding: '4px 8px',
                background: 'rgba(220,38,38,0.92)',
                color: 'white',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700
              }}
            >
              Failed
            </div>
          ) : null}
        </div>
      )
    }
    return text
  })()

  useEffect(() => {
    if (!isViewerOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsViewerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isViewerOpen])

  const viewer = isViewerOpen && type === 'IMAGE' ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={() => setIsViewerOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 2000
      }}
    >
      <img
        src={fileUrl}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '92vw',
          maxHeight: '92vh',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)'
        }}
      />
    </div>
  ) : null

  if (isMe) {
    return (
      <div className="chat-msg chat-msg--me">
        <div className="chat-msg-content">
          <div
            className={`chat-bubble ${type === 'IMAGE' ? 'chat-bubble--media' : 'chat-bubble--me'}`}
            title={detailTime || undefined}
          >
            {bubbleContent}
          </div>
          <div className="chat-msg-time" title={detailTime || undefined}>{time}</div>
        </div>
        <ChatAvatar initials={initials} src={avatarUrl} presence="offline" size="sm" />
        {viewer}
      </div>
    )
  }

  return (
    <div className="chat-msg">
      <ChatAvatar initials={initials} src={avatarUrl} presence="offline" size="sm" />
      <div className="chat-msg-content">
        <div className="chat-msg-author">{author}</div>
        <div
          className={`chat-bubble ${type === 'IMAGE' ? 'chat-bubble--media' : ''}`}
          title={detailTime || undefined}
        >
          {bubbleContent}
        </div>
        <div className="chat-msg-time" title={detailTime || undefined}>{time}</div>
      </div>
      {viewer}
    </div>
  )
}
