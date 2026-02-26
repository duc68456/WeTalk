import '../../styles/components/chat/chatConversationList.css'

import ChatConversationItem from './ChatConversationItem.jsx'

import filterIcon from '../../assets/icons/chat/filter.svg'
import searchIcon from '../../assets/icons/chat/search.svg'

export default function ChatConversationList({
  title,
  search,
  onSearchChange,
  conversations,
  activeId,
  onSelectConversation,
}) {
  return (
    <div className="chat-list">
      <header className="chat-list-header">
        <h2 className="chat-list-title">{title}</h2>
        <button className="chat-list-filter" type="button" aria-label="Filter">
          <img src={filterIcon} alt="" />
        </button>
      </header>

      <div className="chat-list-search">
        <img className="chat-list-search-icon" src={searchIcon} alt="" />
        <input
          className="chat-list-search-input"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search..."
          aria-label="Search conversations"
        />
      </div>

      <div className="chat-list-items" role="list">
        {conversations.map((c) => (
          <ChatConversationItem
            key={c.id}
            conversation={c}
            active={c.id === activeId}
            onClick={() => onSelectConversation?.(c.id)}
          />
        ))}
      </div>
    </div>
  )
}
