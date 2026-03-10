import axios from 'axios'

import { useState } from 'react'

import '../styles/pages/signup.css'

import AuthBrand from '../components/auth/AuthBrand.jsx'
import AuthField from '../components/auth/AuthField.jsx'
import AuthLink from '../components/auth/AuthLink.jsx'
import AuthSubmitButton from '../components/auth/AuthSubmitButton.jsx'
import AuthTextInput from '../components/auth/AuthTextInput.jsx'

import userIcon from '../assets/icons/common/user.svg'
import mailIcon from '../assets/icons/common/mail.svg'
import lockIcon from '../assets/icons/common/lock.svg'
import eyeIcon from '../assets/icons/common/eye.svg'
import errorIcon from '../assets/icons/common/error-exclamation.svg'

import { createApiClient } from '../utils/api.js'

export default function SignUp({ onNavigateLogin, onSignUpSuccess }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitError('')

    const nextErrors = {}
    if (!fullName.trim()) nextErrors.fullName = 'Full name is required'
    if (!email.trim()) nextErrors.email = 'Email is required'
    if (!password) nextErrors.password = 'Password is required'
    if (!confirmPassword) nextErrors.confirmPassword = 'Confirm password is required'
    if (password && confirmPassword && password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // TODO: connect to your server register endpoint
    console.log('Sign up submit', { fullName, email, password })
    try {
      const api = createApiClient()
      const res = await api.post('/auth/register', {
        email: email,
        password: password,
        name: fullName
      })

      const user = res?.data?.user
      const token = res?.data?.token

      onSignUpSuccess(user, token)
    }
    catch (error) {
      const status = error?.response?.status
      const message =
        error?.response?.data?.message ||
        (status ? `Sign up failed (HTTP ${status}).` : '') ||
        'Sign up failed. Please try again.'
      setSubmitError(message)
    }

    

    // Temporary: show the success screen until the API is wired.
    // onSignUpSuccess?.()
  }

  return (
    <div className="auth-page">
      <div className="auth-card-stack auth-card-stack--signup">
        <div className="auth-card auth-card--signup">
          <AuthBrand />

          <div className="signup-heading">
            <h1 className="auth-title">Create an Account</h1>
            <p className="signup-subtitle">Join to start chatting</p>
          </div>

          <form className="auth-form auth-form--signup" onSubmit={handleSubmit} noValidate>
            <AuthField label="Full Name" htmlFor="fullName" error={errors.fullName}>
              <AuthTextInput
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                icon={<img src={userIcon} alt="" />}
              />
            </AuthField>

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
                autoComplete="new-password"
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

            <AuthField label="Confirm Password" htmlFor="confirmPassword" error={errors.confirmPassword}>
              <AuthTextInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                icon={<img src={lockIcon} alt="" />}
                right={
                  <button
                    type="button"
                    className="auth-icon-button"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirmPassword((s) => !s)}
                  >
                    <img src={eyeIcon} alt="" />
                  </button>
                }
              />
            </AuthField>

            <AuthSubmitButton>Sign Up</AuthSubmitButton>
            
            {submitError ? (
              <div className="auth-error" role="alert" aria-live="polite">
                <img className="auth-error-icon" src={errorIcon} alt="" aria-hidden="true" />
                <p className="auth-error-text">{submitError}</p>
              </div>
            ) : null}
          </form>

          <div className="signup-switch">
            <span className="signup-switch-text">Already have an account?</span>
            <AuthLink
              onClick={(e) => {
                e.preventDefault()
                onNavigateLogin?.()
              }}
            >
              Log in
            </AuthLink>
          </div>
        </div>

        <div className="auth-caption">Secure and private messaging</div>
      </div>
    </div>
  )
}
