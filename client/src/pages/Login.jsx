import { useState } from 'react'

import '../styles/pages/login.css'

import AuthBrand from '../components/auth/AuthBrand.jsx'
import AuthField from '../components/auth/AuthField.jsx'
import AuthFooter from '../components/auth/AuthFooter.jsx'
import AuthLink from '../components/auth/AuthLink.jsx'
import AuthSubmitButton from '../components/auth/AuthSubmitButton.jsx'
import AuthTextInput from '../components/auth/AuthTextInput.jsx'

import mailIcon from '../assets/icons/common/mail.svg'
import lockIcon from '../assets/icons/common/lock.svg'
import eyeIcon from '../assets/icons/common/eye.svg'

export default function Login({ onNavigateSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const onSubmit = (e) => {
    e.preventDefault()

    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required'
    if (!password) nextErrors.password = 'Password is required'
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    // TODO: connect to your server auth endpoint
    console.log('Login submit', { email, password })
  }

  return (
    <div className="auth-page">
      <div className="auth-card-stack">
        <div className="auth-card">
          <AuthBrand />

          <h1 className="auth-title">Welcome Back</h1>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <AuthField label="Email Address" htmlFor="email" error={errors.email}>
              <AuthTextInput
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                icon={<img src={mailIcon} alt="" />}
              />
            </AuthField>

            <AuthField label="Password" htmlFor="password" error={errors.password}>
              <AuthTextInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                icon={<img src={lockIcon} alt="" />}
                right={
                  <button
                    type="button"
                    className="auth-icon-button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    <img src={eyeIcon} alt="" />
                  </button>
                }
              />
            </AuthField>

            <div className="auth-row">
              <AuthLink onClick={(e) => e.preventDefault()}>Forgot Password?</AuthLink>
            </div>

            <AuthSubmitButton>Log In</AuthSubmitButton>
          </form>

          <AuthFooter
            onSignUp={(e) => {
              e.preventDefault()
              onNavigateSignUp?.()
            }}
          />
        </div>

        <div className="auth-caption">Secure and private messaging</div>
      </div>
    </div>
  )
}
