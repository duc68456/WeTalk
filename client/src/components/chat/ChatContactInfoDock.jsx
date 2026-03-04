import '../../styles/components/chat/chatContactInfoDock.css'

import videoIcon from '../../assets/icons/chat/video.svg'
import aiIcon from '../../assets/icons/chat/ai.svg'
import searchIcon from '../../assets/icons/chat/search.svg'
import muteIcon from '../../assets/icons/chat/settings.svg'
import closeIcon from '../../assets/icons/chat/back.svg'
import { useRef } from 'react'

const DEFAULT_AVATAR_URL =
  'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'

function ActionButton({ icon, label, onClick }) {
  return (
    <button className="contact-dock-action" type="button" aria-label={label} onClick={onClick}>
      <img src={icon} alt="" />
    </button>
  )
}

function MembersPreview({ membersCount = 0, previewAvatars = [], onViewAll }) {
  const avatars = (Array.isArray(previewAvatars) ? previewAvatars : []).slice(0, 3)

  return (
    <button className="contact-dock-members" type="button" onClick={onViewAll} aria-label="View all members">
      <div className="contact-dock-members-avatars" aria-hidden="true">
        {avatars.length ? (
          avatars.map((a, idx) => (
            <img
              key={a?.id || idx}
              className="contact-dock-members-avatar"
              src={a?.src || DEFAULT_AVATAR_URL}
              alt=""
              style={{ zIndex: avatars.length - idx }}
            />
          ))
        ) : (
          <span className="contact-dock-members-fallback" />
        )}
      </div>

      <div className="contact-dock-members-text">
        <div className="contact-dock-members-count">{membersCount} members</div>
      </div>

      <div className="contact-dock-members-link">View all</div>
    </button>
  )
}

export default function ChatContactInfoDock({
  isOpen,
  onClose,
  contact,
  membersCount,
  memberPreviewAvatars = [],
  onViewAllMembers,
  allowEditAvatar = false,
  isUploadingAvatar = false,
  onAvatarSelected,
  errorMessage = '',
  sharedMedia = [],
  callLogs = [],
  onBlock
}) {
  if (!isOpen) return null

  const fileInputRef = useRef(null)

  const name = contact?.name || 'Unknown'
  const status = contact?.status || 'Active now'
  const avatarUrl = contact?.avatarUrl || DEFAULT_AVATAR_URL

  return (
    <aside className="chat-panel chat-panel--contact" aria-label="Contact info">
      <div className="contact-dock-header">
        <div className="contact-dock-title">Contact Info</div>
        <button className="contact-dock-close" type="button" aria-label="Close" onClick={onClose}>
          <img src={closeIcon} alt="" />
        </button>
      </div>

      <div className="contact-dock-body">
        <div className="contact-dock-profile">
          <button
            className="contact-dock-avatarWrap"
            type="button"
            onClick={() => {
              if (!allowEditAvatar || isUploadingAvatar) return
              fileInputRef.current?.click()
            }}
            aria-label={allowEditAvatar ? 'Change group avatar' : 'Avatar'}
            data-editable={allowEditAvatar ? 'true' : 'false'}
          >
            <img className="contact-dock-avatar" src={avatarUrl} alt="" />
            {allowEditAvatar ? (
              <span className="contact-dock-avatarOverlay" aria-hidden="true">
                {isUploadingAvatar ? 'Uploading…' : 'Change'}
              </span>
            ) : null}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              onAvatarSelected?.(file)
              // allow selecting the same file again
              e.target.value = ''
            }}
          />
          <div className="contact-dock-name">{name}</div>
          <div className="contact-dock-status">
            <span className="contact-dock-statusDot" aria-hidden="true" />
            <span>{status}</span>
          </div>

          {errorMessage ? <div className="contact-dock-error">{errorMessage}</div> : null}
        </div>

        <div className="contact-dock-actions" role="group" aria-label="Contact actions">
          <ActionButton icon={videoIcon} label="Video" />
          <ActionButton icon={aiIcon} label="AI Summary" />
          <ActionButton icon={muteIcon} label="Mute" />
          <ActionButton icon={searchIcon} label="Search" />
        </div>

        {typeof membersCount === 'number' ? (
          <section className="contact-dock-section">
            <MembersPreview
              membersCount={membersCount}
              previewAvatars={memberPreviewAvatars}
              onViewAll={onViewAllMembers}
            />
          </section>
        ) : null}

        {/* Shared Media (hidden for now) */}
        {/*
        <section className="contact-dock-section">
          <div className="contact-dock-sectionTitle">Shared Media</div>
          <div className="contact-dock-mediaGrid">
            {sharedMedia.slice(0, 6).map((m) => (
              <img
                key={m.id || m.url}
                className="contact-dock-mediaThumb"
                src={m.url}
                alt=""
                loading="lazy"
              />
            ))}
          </div>
        </section>
        */}

        {/* Call Logs (hidden for now) */}
        {/*
        <section className="contact-dock-section">
          <div className="contact-dock-sectionTitle">Call Logs</div>
          <div className="contact-dock-callList">
            {callLogs.map((c) => (
              <div key={c.id} className="contact-dock-callItem">
                <div className="contact-dock-callIcon" aria-hidden="true">
                  <img src={c.icon || videoIcon} alt="" />
                </div>
                <div className="contact-dock-callMeta">
                  <div className="contact-dock-callTitle">{c.title}</div>
                  <div className="contact-dock-callTime">{c.when}</div>
                </div>
                <div className="contact-dock-callDuration">{c.duration}</div>
              </div>
            ))}
          </div>
        </section>
        */}
      </div>

      {/* Footer actions (hidden for now) */}
      {/*
      <div className="contact-dock-footer">
        <button className="contact-dock-block" type="button" onClick={onBlock}>
          Block User
        </button>
      </div>
      */}
    </aside>
  )
}
