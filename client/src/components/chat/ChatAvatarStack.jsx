import '../../styles/components/chat/chatAvatarStack.css'

import ChatAvatar from './ChatAvatar.jsx'

const DEFAULT_AVATAR_URL =
  'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'

export default function ChatAvatarStack({ avatars = [], initials = '??', size = 'md', showPresence = true }) {
  // Render up to 4 avatars. If none, fall back to initials.
  const items = Array.isArray(avatars) ? avatars.filter(Boolean).slice(0, 4) : []

  if (items.length === 0) {
    return <ChatAvatar initials={initials} size={size} />
  }

  const boxClass =
    size === 'md' ? 'chat-avatarStack--md' : size === 'lg' ? 'chat-avatarStack--lg' : 'chat-avatarStack--sm'

  return (
    <div className={`chat-avatarStack ${boxClass}`} aria-label="Group avatar">
      {items.map((a, idx) => (
        <div key={a.id || `${a.src}-${idx}`} className="chat-avatarStack-cell">
          <ChatAvatar
            initials={a.initials}
            src={a.src || DEFAULT_AVATAR_URL}
            size={size === 'lg' ? 'md' : 'sm'}
            showPresence={showPresence}
          />
        </div>
      ))}
    </div>
  )
}
