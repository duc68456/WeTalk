import { useEffect, useMemo, useRef, useState } from 'react'
import { createApiClient } from '../utils/api.js'

import '../styles/pages/chat.css'

import ChatSidebar from '../components/chat/ChatSidebar.jsx'
import ChatConversationList from '../components/chat/ChatConversationList.jsx'
import ChatHeader from '../components/chat/ChatHeader.jsx'
import ChatMessageList from '../components/chat/ChatMessageList.jsx'
import ChatComposer from '../components/chat/ChatComposer.jsx'
import ChatResizeHandle from '../components/chat/ChatResizeHandle.jsx'
import ChatProfileSettingsPanel from '../components/chat/ChatProfileSettingsPanel.jsx'
import ChatContactInfoDock from '../components/chat/ChatContactInfoDock.jsx'
import ChatMembersDock from '../components/chat/ChatMembersDock.jsx'

import { useSocket } from '../components/utils/SocketContext.jsx'

import emptyStateIcon from '../assets/icons/common/wetalk-mark.svg'

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function Chat({ onLogout, user, token, onUserUpdated }) {
  const socket = useSocket()
  const messagesEndRef = useRef(null)
  const messageListRef = useRef(null)
  const lastNonGuardCountRef = useRef(0)
  const suppressAutoScrollRef = useRef(false)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [activeConversationId, setActiveConversationId] = useState(null)

  const [messages, setMessages] = useState([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [messageLoadError, setMessageLoadError] = useState('')
  const [messagePage, setMessagePage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false)

  const [conversations, setConversations] = useState([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [conversationLoadError, setConversationLoadError] = useState('')

  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false)
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false)
  const [isMembersOpen, setIsMembersOpen] = useState(false)
  const [isUploadingGroupAvatar, setIsUploadingGroupAvatar] = useState(false)
  const [groupAvatarError, setGroupAvatarError] = useState('')

  const [membersState, setMembersState] = useState({
    isLoading: false,
    error: '',
    members: []
  })

  const [isNarrowLandscape, setIsNarrowLandscape] = useState(false)
  const [narrowView, setNarrowView] = useState('thread')

  const [listWidth, setListWidth] = useState(340)
  const dragStart = useRef({ x: 0, width: 340 })

  const clampListWidth = (w) => {
    const min = 280
    const max = 520
    return Math.max(min, Math.min(max, w))
  }
  const initialsFromName = (name = '') => {
    const parts = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    if (parts.length === 0) return '??'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const formatRelativeTime = (dateLike) => {
    if (!dateLike) return ''
    const ts = new Date(dateLike).getTime()
    if (Number.isNaN(ts)) return ''

    const diffMs = Date.now() - ts
    const minutes = Math.floor(diffMs / 60000)
    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  const mapBackendConversation = (row) => {
    const conv = row?.conversation
    if (!conv?.id) return null

    const partnerName = conv?.members?.[0]?.user?.name
    const displayName = conv?.type === 'GROUP' ? conv?.name || 'Unnamed group' : partnerName || 'Unknown'
    const lastMessage = conv?.messages?.[0]

    const getLastMessagePreview = (m) => {
      if (!m) return 'No messages yet'
      if (typeof m?.content === 'string' && m.content.trim()) return m.content

      // Non-text messages (IMAGE/FILE/SYSTEM) or empty content
      const t = String(m?.messageType || '').toUpperCase()
      if (t === 'IMAGE') return '📷 Image'
      if (t === 'FILE') return '📎 File'
      if (t === 'SYSTEM') return 'System message'
      return 'New message'
    }

    return {
      id: conv.id,
      type: conv.type,
      name: displayName,
      initials: initialsFromName(displayName),
      time: formatRelativeTime(lastMessage?.createdAt || conv?.createdAt),
      sortTs: new Date(lastMessage?.createdAt || conv?.createdAt || 0).getTime() || 0,
      preview: getLastMessagePreview(lastMessage),
      avatarUrl: conv?.type === 'GROUP' ? conv?.avatarUrl || null : conv?.members?.[0]?.user?.avatarUrl || null,
      memberAvatars:
        conv?.type === 'GROUP'
          ? (conv?.members || []).slice(0, 4).map((m) => ({
              id: m?.user?.id,
              src: m?.user?.avatarUrl || null,
              initials: initialsFromName(m?.user?.name || '??')
            }))
          : [],
      unread: 0,
      status: 'offline'
    }
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (!token) {
        setConversations([])
        setActiveConversationId(null)
        return
      }

      try {
        setIsLoadingConversations(true)
        setConversationLoadError('')

        const api = createApiClient(token)
        const res = await api.get('/api/conversation/myConversation')
        const rows = Array.isArray(res?.data) ? res.data : []
        const mapped = rows.map(mapBackendConversation).filter(Boolean)

        if (!isMounted) return
        setConversations(mapped)

        setActiveConversationId((prev) => {
          if (prev && mapped.some((c) => c.id === prev)) return prev
          return null
        })
      } catch (err) {
        if (!isMounted) return
        const message =
          (typeof err?.response?.data?.message === 'string' && err.response.data.message) ||
          err?.message ||
          'Failed to load conversations'
        setConversationLoadError(message)
        setConversations([])
        setActiveConversationId(null)
      } finally {
        if (isMounted) setIsLoadingConversations(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [token])

  // Socket is provided via SocketProvider/SocketContext.
  // Join all conversation rooms whenever the list changes.
  useEffect(() => {
    if (!socket) return
    if (!conversations.length) return

    for (const conv of conversations) {
      socket.emit('join_room', conv.id)
    }
  }, [socket, conversations])

  // Bind 'new_message' once per socket instance.
  useEffect(() => {
    if (!socket) return

    const onNewMessage = (newMessage) => {
      // Don't echo messages we just sent ourselves.
      // We already append the created message locally in `onSend()`.
      if (newMessage?.senderId && user?.id && newMessage.senderId === user.id) {
        return
      }

      // newMessage is the backend Message object emitted by the server.
      // It should include conversationId, senderId, content, createdAt, and (optionally) sender.
      const mapped = mapBackendMessage(newMessage)
      if (!mapped) return

      const convId = newMessage?.conversationId
      if (convId && convId === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === mapped.id)) return prev
          return [...prev, mapped]
        })
      }

      if (convId) {
        setConversations((prev) =>
          prev
            .map((c) => {
              if (c.id !== convId) return c
              return {
                ...c,
                preview: mapped.text?.trim() ? mapped.text : 'New message',
                time: formatRelativeTime(newMessage?.createdAt),
                sortTs: new Date(newMessage?.createdAt || 0).getTime() || c.sortTs
              }
            })
            .slice()
            .sort((a, b) => (b.sortTs || 0) - (a.sortTs || 0))
        )
      }
    }

    socket.on('new_message', onNewMessage)
    return () => {
      socket.off('new_message', onNewMessage)
    }
  }, [socket, activeConversationId, user?.id])

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null
  const hasActiveConversation = Boolean(activeConversation?.id)

  const scrollToNewestMessage = (behavior = 'auto') => {
    const el = messagesEndRef.current
    if (!el) return
    // Use scrollIntoView so we don't need to know the scroll container.
    el.scrollIntoView({ behavior, block: 'end' })
  }

  const computeIsNearBottom = () => {
    const el = messageListRef.current
    if (!el) return true
    // How close (px) to the bottom counts as "near".
    const threshold = 160
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    return distance <= threshold
  }

  // Initialize near-bottom state when switching conversations.
  useEffect(() => {
    setIsNearBottom(true)
  }, [activeConversationId])

  // Auto-scroll to newest only when we append new messages (send/receive/initial load).
  // Do NOT scroll when we prepend older messages from infinite scroll.
  useEffect(() => {
    if (!hasActiveConversation) return
    if (isLoadingMessages || isLoadingMoreMessages) return
    if (suppressAutoScrollRef.current) return

    const nonGuardCount = messages.filter((m) => m && m.kind !== 'guard').length
    const prevCount = lastNonGuardCountRef.current
    lastNonGuardCountRef.current = nonGuardCount

    // If message count increased, we likely appended (send/receive/first load).
    // Only auto-scroll if the user is already near the bottom.
    if (nonGuardCount <= prevCount) return
    if (!computeIsNearBottom() && !isNearBottom) return

    const id = window.requestAnimationFrame(() => scrollToNewestMessage('smooth'))
    return () => window.cancelAnimationFrame(id)
  }, [messages, hasActiveConversation, isLoadingMessages, isLoadingMoreMessages, activeConversationId])

  useEffect(() => {
    // If user switches away from a group convo, close the members dock.
    if (activeConversation?.type !== 'GROUP') {
      setIsMembersOpen(false)
    }
  }, [activeConversation?.type, activeConversationId])

  useEffect(() => {
    let isMounted = true

    const loadMembers = async () => {
      if (!isMembersOpen || !token || !activeConversationId || activeConversation?.type !== 'GROUP') return

      try {
        setMembersState((s) => ({ ...s, isLoading: true, error: '' }))
        const api = createApiClient(token)
        const res = await api.get('/api/member', {
          params: { conversationId: activeConversationId }
        })

        const list = Array.isArray(res?.data?.members) ? res.data.members : []
        if (!isMounted) return
        setMembersState({ isLoading: false, error: '', members: list })
      } catch (err) {
        if (!isMounted) return
        const message =
          (typeof err?.response?.data?.message === 'string' && err.response.data.message) ||
          err?.message ||
          'Failed to load members'
        setMembersState((s) => ({ ...s, isLoading: false, error: message }))
      }
    }

    loadMembers()
    return () => {
      isMounted = false
    }
  }, [isMembersOpen, token, activeConversationId, activeConversation?.type])

  const contactInfo = useMemo(() => {
    if (!activeConversation) return null
    return {
      name: activeConversation.name,
      // Placeholder until presence/status is wired from backend.
      status: 'Active now',
      avatarUrl: activeConversation.avatarUrl || null
    }
  }, [activeConversation])

  const contactSharedMedia = useMemo(
    () => [
      { id: 'm1', url: 'http://localhost:3845/assets/e4100fe222169fdb1349aa0cf87b8023dfeaba8b.png' },
      { id: 'm2', url: 'http://localhost:3845/assets/84795127fa87865ff0bfebf43dd403d28b940055.png' },
      { id: 'm3', url: 'http://localhost:3845/assets/adddde33ccee3fb42419b2620f75654465b78943.png' },
      { id: 'm4', url: 'http://localhost:3845/assets/11e00a90904a510f32ffc2e92e19316ac9026837.png' },
      { id: 'm5', url: 'http://localhost:3845/assets/b4d228395af3fef6f50b9a8f175cb421f8f22259.png' },
      { id: 'm6', url: 'http://localhost:3845/assets/15d2d5e8a126227036800e8c615dbda6dd0aaf62.png' }
    ],
    []
  )

  const contactCallLogs = useMemo(
    () => [
      { id: 'c1', title: 'Video Call', when: 'Today at 2:30 PM', duration: '45 min' },
      { id: 'c2', title: 'Video Call', when: 'Yesterday at 10:15 AM', duration: '22 min' },
      { id: 'c3', title: 'Video Call', when: 'Mar 1, 2026 at 4:00 PM', duration: '1 hr 5 min' }
    ],
    []
  )

  const formatTime = (dateLike) => {
    if (!dateLike) return ''
    const d = new Date(dateLike)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const mapBackendMessage = (m) => {
    if (!m?.id) return null
    const isMe = m.senderId === user?.id
    const authorName = isMe ? 'You' : m?.sender?.name || 'Unknown'
    const initials = initialsFromName(isMe ? user?.name || 'You' : authorName)

    const avatarUrl =
      (isMe ? user?.avatarUrl : m?.sender?.avatarUrl) ||
      'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'

    return {
      id: m.id,
      from: isMe ? 'me' : 'them',
      author: authorName,
      initials,
      avatarUrl,
      text: m.content || '',
      createdAt: m.createdAt,
      time: formatTime(m.createdAt)
    }
  }

  const formatGuardLabel = (dateLike) => {
    const d = new Date(dateLike)
    if (Number.isNaN(d.getTime())) return ''
    // Example: "Mar 5, 2026 · 10:42"
    const date = d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${date} · ${time}`
  }

  const addTimeGuards = (msgList) => {
    // Inserts compact time separators when day changes.
    // We treat items with { kind: 'guard' } specially in the UI.
    const out = []
    let lastDayKey = null
    for (const m of msgList) {
      if (!m || typeof m !== 'object') continue
      if (m.kind === 'guard') {
        out.push(m)
        lastDayKey = null
        continue
      }

      const ts = m.createdAt ? new Date(m.createdAt) : null
      const dayKey = ts && !Number.isNaN(ts.getTime()) ? ts.toDateString() : null
      if (dayKey && dayKey !== lastDayKey) {
        out.push({
          kind: 'guard',
          id: `guard-day-${dayKey}-${m.id}`,
          label: ts.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })
        })
        lastDayKey = dayKey
      }
      out.push(m)
    }
    return out
  }

  useEffect(() => {
    let isMounted = true

    const loadMessages = async () => {
      if (!token || !activeConversationId) {
        setMessages([])
        setMessageLoadError('')
        setMessagePage(1)
        setHasMoreMessages(true)
        return
      }

      try {
        setIsLoadingMessages(true)
        setMessageLoadError('')
        setMessagePage(1)
        setHasMoreMessages(true)

        const api = createApiClient(token)
        const res = await api.get(`/api/message/${activeConversationId}`, {
          params: { page: 1, limit: 30 }
        })
        const rows = res?.data?.messages?.data
        const list = Array.isArray(rows) ? rows : []
        const pagination = res?.data?.messages?.pagination
        const totalPages = Number(pagination?.totalPages)
        if (!Number.isNaN(totalPages) && totalPages > 0) {
          setHasMoreMessages(1 < totalPages)
        } else {
          setHasMoreMessages(list.length >= 30)
        }

        // Backend returns newest-first; UI expects oldest-first
        const mapped = addTimeGuards(
          list
            .slice()
            .reverse()
            .map(mapBackendMessage)
            .filter(Boolean)
        )

        if (!isMounted) return
        setMessages(mapped)
      } catch (err) {
        if (!isMounted) return
        const message =
          (typeof err?.response?.data?.message === 'string' && err.response.data.message) ||
          err?.message ||
          'Failed to load messages'
        setMessageLoadError(message)
        setMessages([])
      } finally {
        if (isMounted) setIsLoadingMessages(false)
      }
    }

    loadMessages()
    return () => {
      isMounted = false
    }
  }, [token, activeConversationId, user?.id])

  const loadMoreMessages = async () => {
    if (!token || !activeConversationId) return
    if (isLoadingMoreMessages || isLoadingMessages) return
    if (!hasMoreMessages) return

    // Prevent the scroll-to-bottom effect from firing while we prepend older messages.
    suppressAutoScrollRef.current = true

    const container = messageListRef.current
    const prevScrollHeight = container?.scrollHeight ?? 0
    const prevScrollTop = container?.scrollTop ?? 0

    try {
      setIsLoadingMoreMessages(true)
      const nextPage = messagePage + 1

      const api = createApiClient(token)
      const res = await api.get(`/api/message/${activeConversationId}`, {
        params: { page: nextPage, limit: 30 }
      })

      const rows = res?.data?.messages?.data
      const list = Array.isArray(rows) ? rows : []
      const pagination = res?.data?.messages?.pagination
      const totalPages = Number(pagination?.totalPages)
      const stillHasMore = !Number.isNaN(totalPages) ? nextPage < totalPages : list.length >= 30

      // Incoming list is newest-first for that page; reverse to oldest-first
      const mapped = list
        .slice()
        .reverse()
        .map(mapBackendMessage)
        .filter(Boolean)

      setMessages((prev) => {
        const existingIds = new Set(prev.filter((x) => x && x.kind !== 'guard').map((m) => m.id))
        const uniqueMapped = mapped.filter((m) => !existingIds.has(m.id))

        const next = [...uniqueMapped]
        // remove existing day guards and re-add
        const prevNoGuards = prev.filter((x) => x && x.kind !== 'guard')
        return addTimeGuards([...next, ...prevNoGuards])
      })

      setMessagePage(nextPage)
      setHasMoreMessages(stillHasMore)

      // Preserve scroll position after prepending.
      window.requestAnimationFrame(() => {
        const el = messageListRef.current
        if (!el) return
        const nextScrollHeight = el.scrollHeight
        const delta = nextScrollHeight - prevScrollHeight
        el.scrollTop = prevScrollTop + delta

        // Clear suppression only after we've restored the scroll position.
        window.requestAnimationFrame(() => {
          suppressAutoScrollRef.current = false
        })
      })
    } catch (err) {
      console.error('Failed to load more messages', err)
    } finally {
      setIsLoadingMoreMessages(false)
    }
  }

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) => c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q))
  }, [conversations, search])

  const onSend = async () => {
    const content = message.trim()
    if (!content || !activeConversationId || !token) return

    setMessage('')

    try {
      const api = createApiClient(token)
      const res = await api.post('/api/message', {
        conversationId: activeConversationId,
        content
      })

      const created = res?.data?.newMessage
      const mapped = mapBackendMessage(created)
      if (mapped) {
        setMessages((prev) => [...prev, mapped])
      }

      // Update conversation preview for sender immediately.
      // (We ignore our own socket echo to avoid duplicate messages.)
      const ts = new Date(created?.createdAt || Date.now()).getTime() || Date.now()
      setConversations((prev) =>
        prev
          .map((c) => {
            if (c.id !== activeConversationId) return c
            return {
              ...c,
              preview: content,
              time: formatRelativeTime(created?.createdAt || ts),
              sortTs: ts
            }
          })
          .slice()
          .sort((a, b) => (b.sortTs || 0) - (a.sortTs || 0))
      )
    } catch (err) {
      // Restore input so the user doesn't lose their message
      setMessage(content)
      console.error('Failed to send message', err)
    }
  }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 980px)')
    const update = () => {
      const matches = mq.matches
      setIsNarrowLandscape(matches)

      // In narrow mode, choose the correct visible view.
      // If settings is open, keep showing settings; otherwise default to thread.
      if (matches) {
        setNarrowView(isProfileSettingsOpen ? 'settings' : 'list')
      }
    }

    update()

    // Safari uses addListener/removeListener.
    if (mq.addEventListener) mq.addEventListener('change', update)
    else mq.addListener(update)

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update)
      else mq.removeListener(update)
    }
  }, [isProfileSettingsOpen])

  return (
    <div className="chat-page" data-narrow={isNarrowLandscape ? 'true' : 'false'}>
      <div className="chat-shell">
        <ChatSidebar
          onLogout={onLogout}
          activeItem={isProfileSettingsOpen ? 'home' : 'messages'}
          onOpenHome={() => {
            setIsProfileSettingsOpen(true)
            if (isNarrowLandscape) setNarrowView('settings')
          }}
          onOpenMessages={() => {
            setIsProfileSettingsOpen(false)
            if (isNarrowLandscape) setNarrowView('thread')
          }}
        />

        {/* When profile settings is open, mimic the Figma screen and hide the other docks/panels. */}
        {!isProfileSettingsOpen && (!isNarrowLandscape || narrowView === 'list') && (
          <section className="chat-panel chat-panel--list" style={{ width: `${listWidth}px` }}>
            <ChatConversationList
              title="Messages"
              search={search}
              onSearchChange={setSearch}
              conversations={
                isLoadingConversations
                  ? [
                      {
                        id: 'loading',
                        name: 'Loading…',
                        initials: '…',
                        time: '',
                        preview: 'Fetching your conversations',
                        unread: 0,
                        status: 'offline'
                      }
                    ]
                  : conversationLoadError
                    ? [
                        {
                          id: 'error',
                          name: 'Couldn\'t load conversations',
                          initials: '!',
                          time: '',
                          preview: conversationLoadError,
                          unread: 0,
                          status: 'offline'
                        }
                      ]
                    : filteredConversations.length
                      ? filteredConversations
                      : [
                          {
                            id: 'empty',
                            name: 'No conversations yet',
                            initials: '—',
                            time: '',
                            preview: 'Start a new chat to see it here',
                            unread: 0,
                            status: 'offline'
                          }
                        ]
              }
              activeId={isLoadingConversations || conversationLoadError ? null : activeConversationId}
              onSelectConversation={(id) => {
                if (id === 'loading' || id === 'error' || id === 'empty') return
                setActiveConversationId(id)
                if (isNarrowLandscape) setNarrowView('thread')
              }}
            />
          </section>
        )}

        {!isProfileSettingsOpen && !isNarrowLandscape && (
          <ChatResizeHandle
            onDragStart={(e) => {
              dragStart.current = { x: e.clientX, width: listWidth }
            }}
            onDrag={(e) => {
              const dx = e.clientX - dragStart.current.x
              setListWidth(clampListWidth(dragStart.current.width + dx))
            }}
          />
        )}

        {!isProfileSettingsOpen && (!isNarrowLandscape || narrowView === 'thread') && (
          <section className="chat-panel chat-panel--thread">
            {hasActiveConversation ? (
              <>
                <ChatHeader
                  name={activeConversation?.name}
                  initials={activeConversation?.initials}
                  avatarSrc={activeConversation?.avatarUrl}
                  conversationType={activeConversation?.type}
                  memberAvatars={activeConversation?.memberAvatars}
                  status="Active now"
                  presence={activeConversation?.status}
                  showBack={isNarrowLandscape}
                  onBack={() => setNarrowView('list')}
                  onMore={() => {
                    setIsContactInfoOpen((v) => {
                      const next = !v
                      if (isNarrowLandscape && next) {
                        // In narrow/landscape, the contact info dock isn't shown.
                        // Route to the conversation list instead.
                        setNarrowView('list')
                      }
                      return next
                    })
                  }}
                />

                <ChatMessageList
                  messages={
                    isLoadingMessages
                      ? [
                          {
                            id: 'loading',
                            from: 'them',
                            author: '',
                            initials: '…',
                            text: 'Loading messages…',
                            time: ''
                          }
                        ]
                      : messageLoadError
                        ? [
                            {
                              id: 'error',
                              from: 'them',
                              author: '',
                              initials: '!',
                              text: messageLoadError,
                              time: ''
                            }
                          ]
                        : messages
                  }
      endRef={messagesEndRef}
      containerRef={messageListRef}
      onReachTop={loadMoreMessages}
                  isLoadingMore={isLoadingMoreMessages}
                  hasMore={hasMoreMessages}
                  onScrollChange={(el) => {
                    const threshold = 160
                    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
                    setIsNearBottom(distance <= threshold)
                  }}
                />

                <ChatComposer value={message} onChange={setMessage} onSend={onSend} />
              </>
            ) : (
              <div className="chat-empty-state" role="status" aria-live="polite">
                <div className="chat-empty-state__icon" aria-hidden="true">
                  <img src={emptyStateIcon} alt="" />
                </div>
                <h2 className="chat-empty-state__title">Select a Conversation</h2>
                <p className="chat-empty-state__subtitle">
                  Choose a conversation from the sidebar to start chatting with your contacts and teams.
                </p>
              </div>
            )}
          </section>
        )}

        {!isProfileSettingsOpen && !isNarrowLandscape && (
          <ChatContactInfoDock
            isOpen={isContactInfoOpen}
            onClose={() => setIsContactInfoOpen(false)}
            contact={contactInfo}
            membersCount={
              typeof activeConversation?.type === 'string' && activeConversation?.type === 'GROUP'
                ? (membersState.members?.length || activeConversation?.memberAvatars?.length || 0)
                : undefined
            }
            memberPreviewAvatars={activeConversation?.memberAvatars}
            onViewAllMembers={() => {
              if (activeConversation?.type !== 'GROUP') return
              setIsContactInfoOpen(false)
              setIsMembersOpen(true)
            }}
            allowEditAvatar={activeConversation?.id && activeConversation?.type === 'GROUP'}
            isUploadingAvatar={isUploadingGroupAvatar}
            onAvatarSelected={async (file) => {
              try {
                if (!token || !activeConversationId) return
                setGroupAvatarError('')
                setIsUploadingGroupAvatar(true)

                const api = createApiClient(token)
                const formData = new FormData()
                formData.append('avatar', file)

                const res = await api.patch(`/api/conversation/${activeConversationId}/update-avatar`, formData)
                const updated = res?.data?.conversation
                const nextAvatarUrl = updated?.avatarUrl

                if (nextAvatarUrl) {
                  setConversations((prev) =>
                    prev.map((c) => (c.id === activeConversationId ? { ...c, avatarUrl: nextAvatarUrl } : c))
                  )
                } else {
                  setGroupAvatarError('Upload succeeded but no avatar URL was returned.')
                }
              } catch (err) {
                const msg =
                  err?.response?.data?.message ||
                  err?.message ||
                  'Failed to update group avatar'
                setGroupAvatarError(msg)
                console.error('Failed to update group avatar', err)
              } finally {
                setIsUploadingGroupAvatar(false)
              }
            }}
            errorMessage={groupAvatarError}
            sharedMedia={contactSharedMedia}
            callLogs={contactCallLogs}
            onBlock={() => {
              // TODO: wire to backend when endpoint exists
              console.log('Block user')
            }}
          />
        )}

        {!isProfileSettingsOpen && !isNarrowLandscape && (
          <ChatMembersDock
            isOpen={isMembersOpen && activeConversation?.type === 'GROUP'}
            onClose={() => setIsMembersOpen(false)}
            onBack={() => {
              setIsMembersOpen(false)
              setIsContactInfoOpen(true)
            }}
            membersState={membersState}
            onMemberAction={(member) => {
              // Placeholder for future: promote/demote/kick/etc.
              console.log('Member action clicked', member)
            }}
          />
        )}

        {/* Profile Settings panel (UI-only). In narrow mode, it becomes its own view. */}
        {isProfileSettingsOpen && (!isNarrowLandscape || narrowView === 'settings') && (
          <ChatProfileSettingsPanel
            user={user}
            token={token}
            onUserUpdated={onUserUpdated}
          />
        )}
      </div>
    </div>
  )
}
