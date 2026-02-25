import '../../styles/components/auth/authFooter.css'

export default function AuthFooter({ onSignUp }) {
  return (
    <div className="auth-footer">
      <span className="auth-footer-text">Need an account?</span>
      <a className="auth-footer-link" href="#" onClick={onSignUp}>
        Sign up
      </a>
    </div>
  )
}
