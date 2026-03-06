import { useState } from 'react'

import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import SignUpSuccess from './pages/SignUpSuccess.jsx'
import Chat from './pages/Chat.jsx'

import { SocketProvider } from './components/utils/SocketContext.jsx'

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser || savedUser === "undefined") {
      return null;
    } 
    // console.log('saved User: ', savedUser)
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token')
    if (!savedToken || savedToken === "undefined") {
      return null;
    } 
    // console.log('saved User: ', savedUser)
    return savedToken
  })

  const [route, setRoute] = useState(() => {
    return user ? 'chat' : 'login' 
  })

  const handleLoginSuccess = (user, token) => {
    setUser(user)
    setToken(token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    setRoute('chat')
  }

  const handleSignupSuccess = (user, token) => {
    setUser(user)
    setToken(token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    setRoute('signup-success')
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setRoute('login')
  }

  const handleUserUpdated = (nextUser) => {
    setUser(nextUser)
    localStorage.setItem('user', JSON.stringify(nextUser))
  }

  if (route === 'chat') {
    return (
      <SocketProvider token={token} user={user}>
        <Chat 
          token={token}
          user={user}
          onLogout = {handleLogout}
          onUserUpdated={handleUserUpdated}
          />
      </SocketProvider>
    )
  }

  if (route === 'signup') {
    return <SignUp 
      onNavigateLogin={() => setRoute('login')}
      onSignUpSuccess={handleSignupSuccess}
      />
  }

  if (route === 'signup-success') {
    return <SignUpSuccess 
      onContinue={() => setRoute('chat')} 
      />
  }

  return <Login 
    onNavigateSignUp={() => setRoute('signup')}
    onNavigateChat={() => setRoute('chat')}
    onLoginSuccess={handleLoginSuccess}
    />
}

export default App
