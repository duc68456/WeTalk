import '../../styles/components/chat/chatConversationItem.css'

import ChatAvatar from './ChatAvatar.jsx'

export default function ChatConversationItem({ conversation, active, onClick }) {
  const { name, initials, time, preview, unread = 0, status } = conversation

  return (
    <button
      className={`chat-convo ${active ? 'chat-convo--active' : ''}`}
      type="button"
      onClick={onClick}
      role="listitem"
    >
      <ChatAvatar initials={initials} presence={status} size="md" />

      <div className="chat-convo-body">
        <div className="chat-convo-top">
          <div className={`chat-convo-name ${active ? 'chat-convo-name--active' : ''}`}>{name}</div>
          <div className="chat-convo-time">{time}</div>
        </div>

        <div className="chat-convo-bottom">
          <div className="chat-convo-preview">{preview}</div>
          {unread > 0 ? <span className="chat-convo-badge">{unread}</span> : null}
        </div>
      </div>
    </button>
  )
}
