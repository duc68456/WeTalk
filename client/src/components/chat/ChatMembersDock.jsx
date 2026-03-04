import '../../styles/components/chat/chatMembersDock.css'

import closeIcon from '../../assets/icons/chat/back.svg'
import moreIcon from '../../assets/icons/chat/more.svg'
import { useMemo, useState } from 'react'

const DEFAULT_AVATAR_URL =
  'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'

function MemberRow({ member }) {
  const user = member?.user
  const name = user?.name || 'Unknown'
  const avatarUrl = user?.avatarUrl || DEFAULT_AVATAR_URL
  const role = member?.role || ''

  return (
    <div className="members-dock-row">
      <img className="members-dock-avatar" src={avatarUrl} alt="" loading="lazy" />
      <div className="members-dock-meta">
        <div className="members-dock-name">{name}</div>
        {role ? <div className="members-dock-role">{role}</div> : null}
      </div>

      <button className="members-dock-more" type="button" aria-label="Member actions">
        <img src={moreIcon} alt="" />
      </button>
    </div>
  )
}

export default function ChatMembersDock({
  isOpen,
  onClose,
  onBack,
  membersState,
  title = 'Members',
  onMemberAction
}) {
  if (!isOpen) return null

  const { isLoading, error, members } = membersState || {}
  const [query, setQuery] = useState('')

  const filteredMembers = useMemo(() => {
    const list = Array.isArray(members) ? members : []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((m) => String(m?.user?.name || '').toLowerCase().includes(q))
  }, [members, query])

  return (
    <aside className="chat-panel chat-panel--members" aria-label="Group members">
      <div className="members-dock-header">
        <div className="members-dock-title">{title}</div>
        <div className="members-dock-headerActions">
          <button className="members-dock-back" type="button" aria-label="Back" onClick={onBack}>
            <img src={closeIcon} alt="" />
          </button>
          <button className="members-dock-close" type="button" aria-label="Close" onClick={onClose}>
            <img src={closeIcon} alt="" />
          </button>
        </div>
      </div>

      <div className="members-dock-body">
        <input
          className="members-dock-search"
          type="search"
          value={query}
          placeholder="Search"
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search members"
        />

        {isLoading ? <div className="members-dock-info">Loading members…</div> : null}
        {!isLoading && error ? <div className="members-dock-error">{error}</div> : null}
        {!isLoading && !error && (!members || members.length === 0) ? (
          <div className="members-dock-info">No members found.</div>
        ) : null}

        {!isLoading && !error && members && members.length > 0 && filteredMembers.length === 0 ? (
          <div className="members-dock-info">No results.</div>
        ) : null}

        {!isLoading && !error && Array.isArray(members) ? (
          <div className="members-dock-list">
            {filteredMembers.map((m) => (
              <div
                key={`${m?.userId || m?.user?.id || 'u'}:${m?.conversationId || 'c'}`}
                onClick={(e) => {
                  const isMore = e.target?.closest?.('.members-dock-more')
                  if (!isMore) return
                  e.preventDefault()
                  onMemberAction?.(m)
                }}
              >
                <MemberRow member={m} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
