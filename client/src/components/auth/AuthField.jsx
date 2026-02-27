import '../../styles/components/auth/authField.css'

export default function AuthField({ label, htmlFor, error, children }) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <div className="auth-field-error">{error}</div> : null}
    </div>
  )
}
