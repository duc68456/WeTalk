import '../../styles/components/chat/chatMessageBubble.css'

import ChatAvatar from './ChatAvatar.jsx'

export default function ChatMessageBubble({ message }) {
  const { from, author, initials, text, time } = message
  const isMe = from === 'me'

  if (isMe) {
    return (
      <div className="chat-msg chat-msg--me">
        <div className="chat-msg-content">
          <div className="chat-bubble chat-bubble--me">{text}</div>
          <div className="chat-msg-time">{time}</div>
        </div>
        <ChatAvatar initials={initials} presence="online" size="sm" />
      </div>
    )
  }

  return (
    <div className="chat-msg">
      <ChatAvatar initials={initials} presence="online" size="sm" />
      <div className="chat-msg-content">
        <div className="chat-msg-author">{author}</div>
        <div className="chat-bubble">{text}</div>
        <div className="chat-msg-time">{time}</div>
      </div>
    </div>
  )
}
