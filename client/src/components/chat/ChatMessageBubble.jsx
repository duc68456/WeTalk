import '../../styles/components/chat/chatMessageBubble.css'

import ChatAvatar from './ChatAvatar.jsx'

export default function ChatMessageBubble({ message }) {
  if (message?.kind === 'guard') {
    return <div className="chat-time-guard">{message.label}</div>
  }

  const { from, author, initials, avatarUrl, text, time, createdAt } = message
  const isMe = from === 'me'

  const detailTime = (() => {
    if (!createdAt) return ''
    const d = new Date(createdAt)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleString()
  })()

  if (isMe) {
    return (
      <div className="chat-msg chat-msg--me">
        <div className="chat-msg-content">
          <div className="chat-bubble chat-bubble--me" title={detailTime || undefined}>{text}</div>
          <div className="chat-msg-time" title={detailTime || undefined}>{time}</div>
        </div>
        <ChatAvatar initials={initials} src={avatarUrl} presence="online" size="sm" />
      </div>
    )
  }

  return (
    <div className="chat-msg">
      <ChatAvatar initials={initials} src={avatarUrl} presence="online" size="sm" />
      <div className="chat-msg-content">
        <div className="chat-msg-author">{author}</div>
        <div className="chat-bubble" title={detailTime || undefined}>{text}</div>
        <div className="chat-msg-time" title={detailTime || undefined}>{time}</div>
      </div>
    </div>
  )
}
