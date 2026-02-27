import '../styles/pages/signupSuccess.css'

import AuthBrand from '../components/auth/AuthBrand.jsx'

import checkCircleIcon from '../assets/icons/common/check-circle.svg'

export default function SignUpSuccess({ onContinue }) {
  return (
    <div className="signup-success-page">
      <div className="signup-success-card-stack">
        <div className="signup-success-card">
          <AuthBrand />

          <div className="signup-success-top">
            <div className="signup-success-badge" aria-hidden="true">
              <img src={checkCircleIcon} alt="" />
            </div>
          </div>

          <div className="signup-success-copy">
            <h1 className="signup-success-title">Account Created Successfully!</h1>
            <p className="signup-success-subtitle">
              Welcome to WeTalk. Your account has been created and you&apos;re ready to start messaging.
            </p>
          </div>

          <div className="signup-success-next">
            <div className="signup-success-next-icon" aria-hidden="true">
              <img src={checkCircleIcon} alt="" />
            </div>

            <div className="signup-success-next-body">
              <div className="signup-success-next-title">What&apos;s Next?</div>
              <ul className="signup-success-next-list">
                <li>Start conversations with your team</li>
                <li>Customize your profile settings</li>
                <li>Invite colleagues to join</li>
              </ul>
            </div>
          </div>

          <button type="button" className="signup-success-cta" onClick={() => onContinue?.()}>
            Continue to Messages
          </button>
        </div>

        <div className="signup-success-caption">🎉 You&apos;re all set to start chatting</div>
      </div>
    </div>
  )
}
