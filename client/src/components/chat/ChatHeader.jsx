import '../../styles/components/chat/chatHeader.css'

import ChatAvatar from './ChatAvatar.jsx'

import aiIcon from '../../assets/icons/chat/ai.svg'
import videoIcon from '../../assets/icons/chat/video.svg'
import phoneIcon from '../../assets/icons/chat/phone.svg'
import moreIcon from '../../assets/icons/chat/more.svg'

export default function ChatHeader({ name, initials, status, presence }) {
  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <ChatAvatar initials={initials} presence={presence} size="lg" />

        <div className="chat-header-meta">
          <div className="chat-header-name">{name}</div>
          <div className="chat-header-status">{status}</div>
        </div>
      </div>

      <div className="chat-header-actions">
        <button className="chat-header-ai" type="button">
          <img src={aiIcon} alt="" />
          <span>AI Summary</span>
        </button>

        <button className="chat-header-icon" type="button" aria-label="Video call">
          <img src={videoIcon} alt="" />
        </button>
        <button className="chat-header-icon" type="button" aria-label="Audio call">
          <img src={phoneIcon} alt="" />
        </button>
        <button className="chat-header-icon chat-header-icon--ghost" type="button" aria-label="More">
          <img src={moreIcon} alt="" />
        </button>
      </div>
    </header>
  )
}
