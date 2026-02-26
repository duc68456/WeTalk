import { useCallback } from 'react'

import '../../styles/components/chat/chatComposer.css'

import attachIcon from '../../assets/icons/chat/attach.svg'
import emojiIcon from '../../assets/icons/chat/emoji.svg'
import sendIcon from '../../assets/icons/chat/send.svg'

export default function ChatComposer({ value, onChange, onSend }) {
  const send = useCallback(() => onSend?.(), [onSend])

  return (
    <div className="chat-composer">
      <div className="chat-composer-inputWrap">
        <button className="chat-composer-icon" type="button" aria-label="Attach">
          <img src={attachIcon} alt="" />
        </button>

        <input
          className="chat-composer-input"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Type a message..."
          aria-label="Message"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              send()
            }
          }}
        />

        <button className="chat-composer-icon" type="button" aria-label="Emoji">
          <img src={emojiIcon} alt="" />
        </button>
      </div>

      <button className="chat-composer-send" type="button" aria-label="Send" onClick={send}>
        <img src={sendIcon} alt="" />
      </button>
    </div>
  )
}
