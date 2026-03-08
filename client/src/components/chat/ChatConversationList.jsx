import '../../styles/components/chat/chatConversationList.css'

import ChatConversationItem from './ChatConversationItem.jsx'

import filterIcon from '../../assets/icons/chat/filter.svg'
import searchIcon from '../../assets/icons/chat/search.svg'
import plusIcon from '../../assets/icons/chat/plus.svg'

export default function ChatConversationList({
  title,
  search,
  onSearchChange,
  conversations,
  activeId,
  onSelectConversation,
  onCreateGroup,
}) {
  const sortedConversations = [...conversations].sort((a, b) => {
    const at = typeof a?.sortTs === 'number' ? a.sortTs : 0
    const bt = typeof b?.sortTs === 'number' ? b.sortTs : 0
    return bt - at
  })

  return (
    <div className="chat-list">
      <header className="chat-list-header">
        <h2 className="chat-list-title">{title}</h2>

        <div className="chat-list-headerActions">
          <button className="chat-list-filter" type="button" aria-label="Filter">
            <img src={filterIcon} alt="" />
          </button>
        </div>
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
        {/* {conversations.map((c) => ( */}
        {sortedConversations.map((c) => (
          <ChatConversationItem
            key={c.id}
            conversation={c}
            active={c.id === activeId}
            onClick={() => onSelectConversation?.(c.id)}
          />
        ))}
      </div>

      <div className="chat-list-createBar" role="region" aria-label="Create group">
        <button
          className="chat-list-create"
          type="button"
          onClick={() => onCreateGroup?.()}
        >
          <img className="chat-list-createIcon" src={plusIcon} alt="" aria-hidden="true" />
          <span className="chat-list-createLabel">Create Group</span>
        </button>
      </div>
    </div>
  )
}
