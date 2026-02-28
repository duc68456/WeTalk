import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

import '../../styles/components/chat/chatProfileSettingsPanel.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// export default function ChatProfileSettingsPanel({
//   displayName = 'John Doe',
//   email = 'john.doe@example.com',
//   avatarUrl,
//   onSave,
// }) {
export default function ChatProfileSettingsPanel({ user, token, onUserUpdated }) {
  // const displayName = user.name
  const email = user.email
  const [displayName, setDisplayName] = useState(user.name)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef(null)
  const fallbackAvatar =
    // avatarUrl ||
    'http://localhost:3845/assets/5a016d0bcaa3b6f79f1e3a8c6b58e993c68e6d6f.png'

  const computedAvatarSrc = avatarPreviewUrl || user?.avatarUrl || fallbackAvatar
  const [avatarImgSrc, setAvatarImgSrc] = useState(computedAvatarSrc)

  useEffect(() => {
    setAvatarImgSrc(computedAvatarSrc)
  }, [computedAvatarSrc])

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
    }
  }, [avatarPreviewUrl])

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const onAvatarFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic client-side guard
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please choose an image file')
      return
    }

    setSubmitError('')
    setSubmitSuccess('')

    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
    const url = URL.createObjectURL(file)
    setAvatarFile(file)
    setAvatarPreviewUrl(url)

    // Immediately upload the avatar to backend
    uploadAvatar(file)
  }

  const uploadAvatar = async (file) => {
    try {
      setIsSaving(true)
      setSubmitError('')
      setSubmitSuccess('')

      const formData = new FormData()
      formData.append('avatar', file)

      const res = await axios.patch(`${API_BASE_URL}/api/user/update-avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const updatedUser = res?.data?.user
      if (updatedUser) {
        onUserUpdated?.(updatedUser)
        setSubmitSuccess('Avatar updated')
      }
    } catch (err) {
      const message =
        (typeof err?.response?.data?.message === 'string' && err.response.data.message) ||
        err?.message ||
        'Failed to upload avatar'
      setSubmitError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    const nextName = displayName.trim()
    if (!nextName) {
      setSubmitError('Display name cannot be blank')
      return
    }

    try {
      setIsSaving(true)
      const res = await axios.patch(
        `${API_BASE_URL}/api/user/update-profile`,
        {
          name: nextName
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const updatedName = res?.data?.name ?? nextName
      setDisplayName(updatedName)
      setSubmitSuccess('Saved')

      onUserUpdated?.({ ...user, name: updatedName })
    } catch (err) {
      const message =
        (typeof err?.response?.data?.message === 'string' && err.response.data.message) ||
        err?.message ||
        'Failed to save changes'
      setSubmitError(message)
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <section className="chat-panel chat-panel--settings" aria-label="Profile settings">
      <div className="profile-settings">
        <div className="profile-settings-title">
          <h1>Profile Settings</h1>
        </div>

        <div className="profile-settings-avatar">
          <button
            type="button"
            className="profile-settings-avatar-ring profile-settings-avatar-button"
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') openFilePicker()
            }}
            aria-label="Change profile picture"
          >
            <img
              className="profile-settings-avatar-img"
              src={avatarImgSrc}
              alt=""
              onError={() => {
                setAvatarImgSrc(fallbackAvatar)
              }}
            />
            <span className="profile-settings-avatar-overlay">
              <span className="profile-settings-avatar-overlay-icon" aria-hidden="true">📷</span>
              <span className="profile-settings-avatar-overlay-text">Change Picture</span>
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="profile-settings-avatar-input"
            onChange={onAvatarFileChange}
          />
        </div>

        <form className="profile-settings-form" onSubmit={handleSubmit}>
          <div className="profile-settings-field">
            <label className="profile-settings-label" htmlFor="profileDisplayName">
              Display Name
            </label>
            <input
              id="profileDisplayName"
              className="profile-settings-input"
              type="text"
              value={displayName}
              // placeholder="John Doe"
              onChange={(e) => {
                setDisplayName(e.target.value)
              }}
              disabled={isSaving}
            />
          </div>

          <div className="profile-settings-field">
            <label className="profile-settings-label" htmlFor="profileEmail">
              Email Address
            </label>
            <input
              id="profileEmail"
              className="profile-settings-input profile-settings-input--muted"
              type="email"
              value={email}
              placeholder="john.doe@example.com"
              disabled
              readOnly
            />
          </div>

          <button className="profile-settings-save" type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          {submitError ? (
            <p className="auth-error" role="alert" aria-live="polite">
              {submitError}
            </p>
          ) : null}

          {submitSuccess ? (
            <p className="profile-settings-success" role="status" aria-live="polite">
              {submitSuccess}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}
