import { useEffect, useMemo, useRef, useState } from 'react'

import '../../styles/components/chat/createGroupModal.css'

import closeIcon from '../../assets/icons/chat/x.svg'
import searchIcon from '../../assets/icons/chat/search.svg'
import ChatAvatar from './ChatAvatar.jsx'

const initialsFromName = (name = '') => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function MemberRow({ member, checked, onToggle }) {
  const labelId = `cg-member-${member.id}`
  const initials = member.initials || initialsFromName(member.name)

  return (
    <label className="cg-member" htmlFor={labelId}>
      <input
        id={labelId}
        className="cg-member-checkbox"
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(member.id)}
      />

      <div className="cg-member-avatar" aria-hidden="true">
        <ChatAvatar
          size="md"
          initials={initials}
          src={member.avatarUrl || null}
          showPresence={false}
        />
      </div>

      <div className="cg-member-name">
        {member.name}
      </div>
    </label>
  )
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreate,
  members = [],
  onSearchEmail,
}) {
  const dialogRef = useRef(null)
  const [groupName, setGroupName] = useState('')
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const selectedUsersRef = useRef(new Map())
  const [isSearchingEmail, setIsSearchingEmail] = useState(false)
  const [emailSearchError, setEmailSearchError] = useState('')
  const [emailFoundUser, setEmailFoundUser] = useState(null)

  // Reset modal state whenever opened.
  useEffect(() => {
    if (!isOpen) return
    setGroupName('')
    setQuery('')
    setSelectedIds(new Set())
    selectedUsersRef.current = new Map()
    setIsSearchingEmail(false)
    setEmailSearchError('')
    setEmailFoundUser(null)
  }, [isOpen])

  // Keep selected user objects up to date for DIRECT candidates.
  useEffect(() => {
    const map = selectedUsersRef.current
    for (const m of members) {
      if (selectedIds.has(m.id)) map.set(m.id, m)
    }
  }, [members, selectedIds])

  // Basic ESC + scroll lock.
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  const isQueryEmail = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q)
  }, [query])

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members

    // When searching by email, show ONLY the found user (do not mix with direct candidates).
    if (isQueryEmail) {
      if (!emailFoundUser) return []
      const foundEmail = String(emailFoundUser?.email || '').toLowerCase()
      return foundEmail === q ? [emailFoundUser] : []
    }

    return members.filter((m) => String(m?.name || '').toLowerCase().includes(q))
  }, [members, query, isQueryEmail, emailFoundUser])

  // Single search box: if query looks like an email, search user by email (like conversation list).
  useEffect(() => {
    if (!isOpen) return
    if (!onSearchEmail) return

    const value = String(query || '').trim()
    if (!value) {
      setIsSearchingEmail(false)
      setEmailSearchError('')
      return
    }

    // lightweight email format check
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    if (!isEmail) {
      setIsSearchingEmail(false)
      setEmailSearchError('')
      return
    }

    let cancelled = false
    const t = setTimeout(async () => {
      try {
        setIsSearchingEmail(true)
        setEmailSearchError('')
        const found = await onSearchEmail(value)
        if (!found?.id) throw new Error('User not found')

  setEmailFoundUser(found)

  // Cache the found user so they remain visible in the selected chips
  // even after the search query is cleared/changed.
  selectedUsersRef.current.set(found.id, found)

        // Preselect the found user so the user sees an immediate effect.
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.add(found.id)
          return next
        })
      } catch (e) {
        if (cancelled) return
        setEmailSearchError(e?.message || 'Failed to search user')
        setEmailFoundUser(null)
      } finally {
        if (!cancelled) setIsSearchingEmail(false)
      }
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, isOpen, onSearchEmail])

  const selectedMembers = useMemo(() => {
    if (!selectedIds.size) return []

    // 1) start with cached selected users (covers email-search selections)
    const byId = new Map(selectedUsersRef.current)
    // 2) overlay latest DIRECT candidates (may have fresher avatar/name)
    for (const m of members) byId.set(m.id, m)
    // 3) overlay current email found user
    if (emailFoundUser?.id) byId.set(emailFoundUser.id, emailFoundUser)

    return Array.from(selectedIds)
      .map((id) => byId.get(id))
      .filter(Boolean)
  }, [members, selectedIds, emailFoundUser])

  // Backend enforces: GROUP requires at least 2 invitees (excluding creator).
  // Only count selected IDs that we can resolve to a user object.
  const inviteeCount = selectedMembers.length
  const canSubmit = groupName.trim().length >= 2 && inviteeCount >= 2

  const toggleMember = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const submit = async () => {
    if (!canSubmit) return
    const payload = {
      name: groupName.trim(),
      memberIds: Array.from(selectedIds),
    }
    await onCreate?.(payload)
  }

  if (!isOpen) return null

  return (
    <div
      className="cg-overlay"
      role="presentation"
      onMouseDown={(e) => {
        // click outside closes (only for direct overlay clicks)
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        ref={dialogRef}
        className="cg-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Create Group"
      >
        <div className="cg-header">
          <div className="cg-title">Create Group</div>
          <button className="cg-close" type="button" aria-label="Close" onClick={onClose}>
            <img src={closeIcon} alt="" aria-hidden="true" />
          </button>
        </div>

        <div className="cg-body">
          <div className="cg-field">
            <label className="cg-label" htmlFor="cg-name">
              Group Name
            </label>
            <input
              id="cg-name"
              className="cg-input"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              autoComplete="off"
            />
          </div>

          <div className="cg-field">
            <div className="cg-label">Add Members</div>

            <div className="cg-addBox" aria-label="Selected members">
              {selectedMembers.length ? (
                <div className="cg-chipGrid">
                  {selectedMembers.map((m) => (
                    <div key={m.id} className="cg-chip">
                      <div className="cg-chipAvatar" aria-hidden="true">
                        <ChatAvatar
                          size="sm"
                          initials={m.initials || initialsFromName(m.name)}
                          src={m.avatarUrl || null}
                          showPresence={false}
                        />
                      </div>
                      <div className="cg-chipName" title={m.name}>
                        {m.name}
                      </div>
                      <button
                        className="cg-chipRemove"
                        type="button"
                        onClick={() => toggleMember(m.id)}
                        aria-label={`Remove ${m.name}`}
                      >
                        <img src={closeIcon} alt="" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cg-chipEmpty">Select members to add to the group</div>
              )}
            </div>

            <div className="cg-searchWrap">
              <img className="cg-searchIcon" src={searchIcon} alt="" aria-hidden="true" />
              <input
                className="cg-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members..."
                autoComplete="off"
              />
            </div>

            {isSearchingEmail ? <div className="cg-searchHint">Searching…</div> : null}
            {!isSearchingEmail && emailSearchError ? (
              <div className="cg-searchError">{emailSearchError}</div>
            ) : null}

            <div className="cg-memberList" role="list">
              {filteredMembers.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  checked={selectedIds.has(m.id)}
                  onToggle={toggleMember}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="cg-footer">
          <button className="cg-cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="cg-submit" type="button" disabled={!canSubmit} onClick={submit}>
            Create Group
          </button>
        </div>
      </div>
    </div>
  )
}
