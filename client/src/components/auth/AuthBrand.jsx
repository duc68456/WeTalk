import '../../styles/components/auth/authBrand.css'

import weTalkLogo from '../../assets/icons/common/wetalk.svg'

export default function AuthBrand() {
  return (
    <div className="auth-brand" aria-label="WeTalk">
      <div className="auth-brand-icon" aria-hidden="true">
        <img className="auth-brand-logo" src={weTalkLogo} alt="" />
      </div>
      <div className="auth-brand-name">WeTalk</div>
    </div>
  )
}
