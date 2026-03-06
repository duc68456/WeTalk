import '../../styles/components/chat/chatHeader.css'

import ChatAvatar from './ChatAvatar.jsx'
import ChatAvatarStack from './ChatAvatarStack.jsx'

import aiIcon from '../../assets/icons/chat/ai.svg'
import backIcon from '../../assets/icons/chat/back.svg'
import videoIcon from '../../assets/icons/chat/video.svg'
import phoneIcon from '../../assets/icons/chat/phone.svg'
import moreIcon from '../../assets/icons/chat/more.svg'

export default function ChatHeader({
  name,
  initials,
  avatarSrc,
  conversationType,
  memberAvatars = [],
  status,
  presence,
  showBack = false,
  onBack,
  onMore
}) {
  return (
    <header className="chat-header">
      <div className="chat-header-left">
        {showBack ? (
          <button className="chat-header-back" type="button" aria-label="Back" onClick={onBack}>
            <img src={backIcon} alt="" />
          </button>
        ) : null}
        {conversationType === 'GROUP' && !avatarSrc ? (
          <ChatAvatarStack avatars={memberAvatars} initials={initials} size="lg" />
        ) : (
          <ChatAvatar initials={initials} src={avatarSrc} presence={presence} size="lg" />
        )}

        <div className="chat-header-meta">
          <div className="chat-header-name">{name}</div>
          {status ? <div className="chat-header-status">{status}</div> : null}
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
        <button className="chat-header-icon chat-header-icon--ghost" type="button" aria-label="More" onClick={onMore}>
          <img src={moreIcon} alt="" />
        </button>
      </div>
    </header>
  )
}
