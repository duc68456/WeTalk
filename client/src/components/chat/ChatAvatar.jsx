import { useState } from 'react'

import '../../styles/components/chat/chatAvatar.css'

const DEFAULT_AVATAR_URL =
  'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'

export default function ChatAvatar({
  initials,
  src,
  presence = 'offline',
  size = 'sm',
  showPresence = true,
  sublabel = ''
}) {
  const [imgOk, setImgOk] = useState(true)

  return (
    <div className={`chat-avatar chat-avatar--${size}`}
      aria-label="Avatar"
    >
      <div className="chat-avatar-circle">
        {src ? (
          <img
            src={imgOk ? src : DEFAULT_AVATAR_URL}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgOk(false)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '999px' }}
          />
        ) : (
          initials
        )}
      </div>
      {sublabel ? (
        <span className={`chat-avatar-sublabel chat-avatar-sublabel--${size}`} aria-hidden="true">
          {sublabel}
        </span>
      ) : null}
      {showPresence && presence && !sublabel && (
        <span className={`chat-avatar-presence chat-avatar-presence--${presence}`} aria-hidden="true" />
      )}
    </div>
  )
}
