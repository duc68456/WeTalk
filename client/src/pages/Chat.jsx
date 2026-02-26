import { useEffect, useMemo, useRef, useState } from 'react'

import '../styles/pages/chat.css'

import ChatSidebar from '../components/chat/ChatSidebar.jsx'
import ChatConversationList from '../components/chat/ChatConversationList.jsx'
import ChatHeader from '../components/chat/ChatHeader.jsx'
import ChatMessageList from '../components/chat/ChatMessageList.jsx'
import ChatComposer from '../components/chat/ChatComposer.jsx'
import ChatResizeHandle from '../components/chat/ChatResizeHandle.jsx'

export default function Chat({ onLogout }) {
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [activeConversationId, setActiveConversationId] = useState('sarah')

  // Narrow landscape behavior: show only sidebar + thread by default.
  const [isNarrowLandscape, setIsNarrowLandscape] = useState(false)
  // In narrow mode, we show ONE panel at a time: 'list' or 'thread'.
  const [narrowView, setNarrowView] = useState('thread')

  const [listWidth, setListWidth] = useState(340)
  const dragStart = useRef({ x: 0, width: 340 })

  const clampListWidth = (w) => {
    // Keep it usable across typical desktop widths.
    const min = 280
    const max = 520
    return Math.max(min, Math.min(max, w))
  }

  const conversations = useMemo(
    () => [
      {
        id: 'sarah',
        name: 'Sarah Chen',
        initials: 'SC',
        time: '2m',
        preview: 'Sounds good! See you then.',
        unread: 2,
        status: 'online',
      },
      {
        id: 'eng',
        name: 'Engineering Team',
        initials: 'ET',
        time: '15m',
        preview: 'Deploy is scheduled for 3pm',
        unread: 5,
        status: 'online',
      },
      {
        id: 'marcus',
        name: 'Marcus Johnson',
        initials: 'MJ',
        time: '1h',
        preview: "I'll review the PR tomorrow",
        unread: 0,
        status: 'away',
        active: true,
      },
      {
        id: 'design',
        name: 'Product Design',
        initials: 'PD',
        time: '2h',
        preview: 'New mockups are ready',
        unread: 0,
        status: 'online',
      },
      {
        id: 'emma',
        name: 'Emma Williams',
        initials: 'EW',
        time: '3h',
        preview: 'Thanks for your help!',
        unread: 0,
        status: 'offline',
      },
      {
        id: 'general',
        name: 'General',
        initials: 'GN',
        time: '1d',
        preview: 'Welcome to the team!',
        unread: 0,
        status: 'online',
      },
    ],
    []
  )

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? conversations[0]

  const messages = useMemo(
    () => [
      {
        id: 'm1',
        from: 'them',
        author: 'Sarah Chen',
        initials: 'SC',
        text: 'Hey! Did you get a chance to review the design mockups I sent over?',
        time: '10:32 AM',
      },
      {
        id: 'm2',
        from: 'me',
        author: 'You',
        initials: 'YO',
        text: 'Yes! They look great. I have a few suggestions for the navigation flow.',
        time: '10:35 AM',
      },
      {
        id: 'm3',
        from: 'them',
        author: 'Sarah Chen',
        initials: 'SC',
        text: "Perfect! I'd love to hear your thoughts. Should we schedule a quick call to discuss?",
        time: '10:36 AM',
      },
      {
        id: 'm4',
        from: 'me',
        author: 'You',
        initials: 'YO',
        text: 'That works for me. How about tomorrow at 2pm?',
        time: '10:38 AM',
      },
      {
        id: 'm5',
        from: 'them',
        author: 'Sarah Chen',
        initials: 'SC',
        text: 'Sounds good! See you then.',
        time: '10:40 AM',
      },
    ],
    []
  )

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) => c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q))
  }, [conversations, search])

  const onSend = () => {
    if (!message.trim()) return
    // placeholder for now
    console.log('Send message', { to: activeConversationId, message })
    setMessage('')
  }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 980px)')
    const update = () => {
      const matches = mq.matches
      setIsNarrowLandscape(matches)

      // In narrow mode, default to thread-only.
      if (matches) setNarrowView('thread')
    }

    update()

    // Safari uses addListener/removeListener.
    if (mq.addEventListener) mq.addEventListener('change', update)
    else mq.addListener(update)

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update)
      else mq.removeListener(update)
    }
  }, [])

  return (
    <div className="chat-page" data-narrow={isNarrowLandscape ? 'true' : 'false'}>
      <div className="chat-shell">
        <ChatSidebar onLogout={onLogout} />

        {(!isNarrowLandscape || narrowView === 'list') && (
          <section className="chat-panel chat-panel--list" style={{ width: `${listWidth}px` }}>
            <ChatConversationList
              title="Messages"
              search={search}
              onSearchChange={setSearch}
              conversations={filteredConversations}
              activeId={activeConversationId}
              onSelectConversation={(id) => {
                setActiveConversationId(id)
                if (isNarrowLandscape) setNarrowView('thread')
              }}
            />
          </section>
        )}

        {!isNarrowLandscape && (
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

        {(!isNarrowLandscape || narrowView === 'thread') && (
          <section className="chat-panel chat-panel--thread">
            <ChatHeader
              name={activeConversation?.name}
              initials={activeConversation?.initials}
              status="Active now"
              presence={activeConversation?.status}
              showBack={isNarrowLandscape}
              onBack={() => setNarrowView('list')}
            />

            <ChatMessageList messages={messages} />

            <ChatComposer value={message} onChange={setMessage} onSend={onSend} />
          </section>
        )}
      </div>
    </div>
  )
}
