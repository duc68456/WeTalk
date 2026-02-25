import { useState } from 'react'

import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'

function App() {
  const [route, setRoute] = useState('login')

  if (route === 'signup') {
    return <SignUp onNavigateLogin={() => setRoute('login')} />
  }

  return <Login onNavigateSignUp={() => setRoute('signup')} />
}

export default App
