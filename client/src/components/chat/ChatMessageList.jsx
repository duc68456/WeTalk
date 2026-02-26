import '../../styles/components/chat/chatMessageList.css'

import ChatMessageBubble from './ChatMessageBubble.jsx'

export default function ChatMessageList({ messages }) {
  return (
    <div className="chat-thread">
      <div className="chat-messages">
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} />
        ))}
      </div>
    </div>
  )
}
