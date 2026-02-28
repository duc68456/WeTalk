import '../../styles/components/chat/chatSidebar.css'

import wetalkIcon from '../../assets/icons/common/wetalk-mark.svg'
import navHomeIcon from '../../assets/icons/chat/home.svg'
import navMessageIcon from '../../assets/icons/chat/message.svg'
import navUserIcon from '../../assets/icons/chat/user.svg'
import navSettingsIcon from '../../assets/icons/chat/settings.svg'
import navLogoutIcon from '../../assets/icons/chat/logout.svg'

export default function ChatSidebar({
  onLogout,
  activeItem = 'messages',
  onOpenHome,
  onOpenMessages,
}) {
  return (
    <aside className="chat-sidebar" aria-label="Primary navigation">
      <div className="chat-sidebar-top">
        <div className="chat-sidebar-brand">
          <img className="chat-sidebar-brand-icon" src={wetalkIcon} alt="" />
        </div>

        <nav className="chat-sidebar-nav" aria-label="Navigation">
          <button
            className={`chat-sidebar-btn ${activeItem === 'home' ? 'chat-sidebar-btn--active' : ''}`}
            type="button"
            aria-label="Home"
            onClick={onOpenHome}
          >
            <img src={navHomeIcon} alt="" />
          </button>

          <button
            className={`chat-sidebar-btn ${activeItem === 'messages' ? 'chat-sidebar-btn--active' : ''}`}
            type="button"
            aria-label="Messages"
            onClick={onOpenMessages}
          >
            <img src={navMessageIcon} alt="" />
          </button>

          <button className="chat-sidebar-btn" type="button" aria-label="Contacts">
            <img src={navUserIcon} alt="" />
          </button>

          <button className="chat-sidebar-btn" type="button" aria-label="Settings">
            <img src={navSettingsIcon} alt="" />
          </button>
        </nav>
      </div>

      <div className="chat-sidebar-bottom">
        <div className="chat-sidebar-divider" />
        <button className="chat-sidebar-btn" type="button" aria-label="Log out" onClick={onLogout}>
          <img src={navLogoutIcon} alt="" />
        </button>
      </div>
    </aside>
  )
}
