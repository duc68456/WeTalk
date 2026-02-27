import { useState } from 'react'

import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import SignUpSuccess from './pages/SignUpSuccess.jsx'
import Chat from './pages/Chat.jsx'

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser || savedUser === "undefined") {
      return null;
    } 
    console.log('saved User: ', savedUser)
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [route, setRoute] = useState(() => {
    return user ? 'chat' : 'login' 
  })

  const handleLoginSuccess = (user) => {
    setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
    setRoute('chat')
  }

  const handleSignupSuccess = (user) => {
    setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
    setRoute('signup-success')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    setRoute('login')
  }

  if (route === 'chat') {
    return <Chat 
      onLogout = {handleLogout}
      />
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
