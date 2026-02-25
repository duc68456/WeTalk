import '../../styles/components/auth/authLink.css'

export default function AuthLink({ children, onClick }) {
  return (
    <a className="auth-link" href="#" onClick={onClick}>
      {children}
    </a>
  )
}
