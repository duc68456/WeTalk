import '../../styles/components/auth/authInput.css'

export default function AuthTextInput({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  right,
}) {
  return (
    <div className="auth-input-wrap">
      <span className="auth-input-icon" aria-hidden="true">
        {icon}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="auth-input"
        autoComplete={autoComplete}
      />
      {right}
    </div>
  )
}
