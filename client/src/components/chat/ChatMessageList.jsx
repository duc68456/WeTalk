import '../../styles/components/chat/chatMessageList.css'

import ChatMessageBubble from './ChatMessageBubble.jsx'
import { useEffect, useRef } from 'react'

export default function ChatMessageList({
  messages,
  endRef,
  onReachTop,
  containerRef,
  isLoadingMore,
  hasMore,
  onScrollChange
}) {
  const hasUserScrolledRef = useRef(false)
  const hasUserInteractedRef = useRef(false)

  useEffect(() => {
    const markInteracted = () => {
      hasUserInteractedRef.current = true
    }

    // These capture the most common intentional scroll interactions.
    window.addEventListener('wheel', markInteracted, { passive: true })
    window.addEventListener('touchstart', markInteracted, { passive: true })
    window.addEventListener('keydown', markInteracted)

    return () => {
      window.removeEventListener('wheel', markInteracted)
      window.removeEventListener('touchstart', markInteracted)
      window.removeEventListener('keydown', markInteracted)
    }
  }, [])

  const getTopDetailLabel = () => {
    for (const m of messages) {
      if (!m || typeof m !== 'object') continue
      if (m.kind === 'guard') continue
      if (!m.createdAt) continue
      const d = new Date(m.createdAt)
      if (Number.isNaN(d.getTime())) continue
      const date = d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return `${date} · ${time}`
    }
    return ''
  }

  return (
    <div className="chat-thread">
      <div
        className="chat-messages"
        ref={containerRef}
        onScroll={(e) => {
          const el = e.currentTarget
          // Don’t auto-trigger pagination just because the list renders at scrollTop=0.
          // Only allow reach-top loading after the user has actually scrolled.
          if (!hasUserScrolledRef.current) {
            // If the user scrolls even a tiny bit (down or up), we consider it intentional.
            if (el.scrollTop > 0) hasUserScrolledRef.current = true
          }
          if (onScrollChange) onScrollChange(el)
          if (!onReachTop) return
          if (isLoadingMore) return
          if (hasMore === false) return
          // Initial render/layout/auto-scroll can cause scroll events or leave scrollTop at 0.
          // Require a real user interaction before allowing pagination.
          if (!hasUserInteractedRef.current) return
          if (!hasUserScrolledRef.current) return
          // Trigger a bit before absolute top for smoother UX.
          if (el.scrollTop <= 24) onReachTop()
        }}
      >
        {isLoadingMore ? (
          <div className="chat-messages__top">
            <div className="chat-messages__loader">
              <span className="chat-messages__loaderLabel">{getTopDetailLabel()}</span>
              <span className="chat-messages__loaderDots">Loading…</span>
            </div>
          </div>
        ) : null}
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} />
        ))}

        {/* Scroll target for "jump to newest" behavior */}
        <div ref={endRef} className="chat-messages__end" />
      </div>
    </div>
  )
}
