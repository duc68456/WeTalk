import { useState } from 'react'

import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import Chat from './pages/Chat.jsx'

function App() {
  const [route, setRoute] = useState('login')

  if (route === 'chat') {
    return <Chat onLogout={() => setRoute('login')} />
  }

  if (route === 'signup') {
    return <SignUp onNavigateLogin={() => setRoute('login')} />
  }

  return <Login onNavigateSignUp={() => setRoute('signup')} onNavigateChat={() => setRoute('chat')} />
}

export default App
