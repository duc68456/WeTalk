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

export default function Chat({ onLogout, user, token, onUserUpdated }) {
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [activeConversationId, setActiveConversationId] = useState(null)

  const [messages, setMessages] = useState([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [messageLoadError, setMessageLoadError] = useState('')

  const [conversations, setConversations] = useState([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [conversationLoadError, setConversationLoadError] = useState('')

  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false)

  const [isNarrowLandscape, setIsNarrowLandscape] = useState(false)
  const [narrowView, setNarrowView] = useState('thread')

  const [listWidth, setListWidth] = useState(340)
  const dragStart = useRef({ x: 0, width: 340 })

  const clampListWidth = (w) => {
    // Keep it usable across typical desktop widths.
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
    // Backend shape: { conversation: { id,type,name,createdAt,members:[{user:{name,avatarUrl}}], messages:[{text,createdAt,sender:{name}}] } }
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
      name: displayName,
      initials: initialsFromName(displayName),
      time: formatRelativeTime(lastMessage?.createdAt || conv?.createdAt),
      preview: getLastMessagePreview(lastMessage),
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

        // Pick a default active conversation if none is selected.
        setActiveConversationId((prev) => {
          if (prev && mapped.some((c) => c.id === prev)) return prev
          return mapped[0]?.id ?? null
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

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? conversations[0]

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
      time: formatTime(m.createdAt)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadMessages = async () => {
      if (!token || !activeConversationId) {
        setMessages([])
        setMessageLoadError('')
        return
      }

      try {
        setIsLoadingMessages(true)
        setMessageLoadError('')

        const api = createApiClient(token)
        const res = await api.get(`/api/message/${activeConversationId}`)
        const rows = res?.data?.messages?.data
        const list = Array.isArray(rows) ? rows : []

        // Backend returns newest-first; UI expects oldest-first
        const mapped = list
          .slice()
          .reverse()
          .map(mapBackendMessage)
          .filter(Boolean)

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
        setNarrowView(isProfileSettingsOpen ? 'settings' : 'thread')
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
            <ChatHeader
              name={activeConversation?.name}
              initials={activeConversation?.initials}
              status="Active now"
              presence={activeConversation?.status}
              showBack={isNarrowLandscape}
              onBack={() => setNarrowView('list')}
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
            />

            <ChatComposer value={message} onChange={setMessage} onSend={onSend} />
          </section>
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
