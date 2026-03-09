import axios from 'axios'

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

import logger from '../utils/logger.js'
import { createApiClient } from '../utils/api.js'

export default function Login({ onNavigateSignUp, onNavigateChat, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear any previous server-side error
    setSubmitError('')

    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required'
    if (!password) nextErrors.password = 'Password is required'
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    // TODO: connect to your server auth endpoint
    console.log('Login submit', { email, password })
    // console.log('email: ', email, ' password: ', password)
    try {
      const api = createApiClient()
      const res = await api.post('/auth/login', {
        email: email,
        password: password
      })
      // console.log('res: ', res)
      // Clear any server-side error on success
      setSubmitError('')

      const user = res?.data?.user
      const token = res?.data?.token

      onLoginSuccess?.(user, token)

      logger.info('Login response:', res.data)
    } catch (err) {
      const status = err?.response?.status
      const data = err?.response?.data
      logger.error('Login failed', { status, data, message: err?.message })

      const message =
        (typeof data?.message === 'string' && data.message) ||
        (Array.isArray(data?.details) && data.details.join('\n')) ||
        (status === 401 ? 'Invalid email or password' : '') ||
        'Login failed. Please try again.'

      setSubmitError(message)
    }

    // Temporary: let you preview the main chat screen without wiring auth yet.
    // onNavigateChat?.()
  }

  return (
    <div className="auth-page">
      <div className="auth-card-stack">
        <div className="auth-card">
          <AuthBrand />

          <h1 className="auth-title">Welcome Back</h1>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

            {submitError ? (
              <p className="auth-error" role="alert" aria-live="polite">
                {submitError}
              </p>
            ) : null}
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
