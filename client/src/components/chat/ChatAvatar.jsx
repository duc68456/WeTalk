import '../../styles/components/chat/chatAvatar.css'

export default function ChatAvatar({ initials, presence = 'offline', size = 'sm' }) {
  return (
    <div className={`chat-avatar chat-avatar--${size}`}
      aria-label="Avatar"
    >
      <div className="chat-avatar-circle">{initials}</div>
      <span className={`chat-avatar-presence chat-avatar-presence--${presence}`} aria-hidden="true" />
    </div>
  )
}
