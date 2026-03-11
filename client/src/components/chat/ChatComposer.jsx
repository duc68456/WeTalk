import { useCallback, useEffect, useRef } from 'react'

import '../../styles/components/chat/chatComposer.css'

import attachIcon from '../../assets/icons/chat/attach.svg'
import emojiIcon from '../../assets/icons/chat/emoji.svg'
import sendIcon from '../../assets/icons/chat/send.svg'

export default function ChatComposer({ value, onChange, onSend, onSendImage, onTypingStart, onTypingStop }) {
  const send = useCallback(() => onSend?.(), [onSend])
  const hasMessage = Boolean(value?.trim())
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  return (
    <div className="chat-composer">
      <div className="chat-composer-inputWrap">
        <button
          className="chat-composer-icon"
          type="button"
          aria-label="Attach"
          onClick={() => fileInputRef.current?.click()}
        >
          <img src={attachIcon} alt="" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            onSendImage?.(file)
            // allow selecting the same file again
            e.target.value = ''
          }}
        />

        <input
          className="chat-composer-input"
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value)

            if (!isTypingRef.current) {
              isTypingRef.current = true
              onTypingStart?.()
            }

            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = window.setTimeout(() => {
              isTypingRef.current = false
              onTypingStop?.()
            }, 900)
          }}
          placeholder="Type a message..."
          aria-label="Message"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
              if (isTypingRef.current) {
                isTypingRef.current = false
                onTypingStop?.()
              }
              send()
            }
          }}
        />

        <button className="chat-composer-icon" type="button" aria-label="Emoji">
          <img src={emojiIcon} alt="" />
        </button>
      </div>

      <button
        className={`chat-composer-send ${hasMessage ? 'chat-composer-send--active' : ''}`}
        type="button"
        aria-label="Send"
        onClick={() => {
          if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
          if (isTypingRef.current) {
            isTypingRef.current = false
            onTypingStop?.()
          }
          send()
        }}
        disabled={!hasMessage}
      >
        <img src={sendIcon} alt="" />
      </button>
    </div>
  )
}
