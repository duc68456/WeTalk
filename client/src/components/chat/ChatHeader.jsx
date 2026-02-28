import '../../styles/components/chat/chatHeader.css'

import ChatAvatar from './ChatAvatar.jsx'

import aiIcon from '../../assets/icons/chat/ai.svg'
import backIcon from '../../assets/icons/chat/back.svg'
import videoIcon from '../../assets/icons/chat/video.svg'
import phoneIcon from '../../assets/icons/chat/phone.svg'
import moreIcon from '../../assets/icons/chat/more.svg'

export default function ChatHeader({ name, initials, status, presence, showBack = false, onBack }) {
  return (
    <header className="chat-header">
      <div className="chat-header-left">
        {showBack ? (
          <button className="chat-header-back" type="button" aria-label="Back" onClick={onBack}>
            <img src={backIcon} alt="" />
          </button>
        ) : null}
        <ChatAvatar initials={initials} presence={presence} size="lg" />

        <div className="chat-header-meta">
          <div className="chat-header-name">{name}</div>
          {/* TEMP: hide user's activity status text */}
          {/* <div className="chat-header-status">{status}</div> */}
        </div>
      </div>

      <div className="chat-header-actions">
        {/* <button className="chat-header-ai" type="button">
          <img src={aiIcon} alt="" />
          <span>AI Summary</span>
        </button> */}

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
