import '../../styles/components/auth/authButton.css'

export default function AuthSubmitButton({ children }) {
  return (
    <button className="auth-submit" type="submit">
      {children}
    </button>
  )
}
