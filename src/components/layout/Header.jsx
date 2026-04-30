import React, { useState } from 'react'
import { useAuth } from '../../context/authContext/AuthContext'
import { NavLink } from 'react-router-dom';
import ClickAwayListener from 'react-click-away-listener';

const Header = () => {
  const { user, signOut } = useAuth();
  const [showProfileDropdown, setProfileDropdown] = useState(false);
  const userMetadata = user?.user_metadata; 

  // const getInitials = (first_name = '', last_name = '') => {
  //   const first = first_name?.charAt(0)?.toUpperCase() || ''
  //   const last = last_name?.charAt(0)?.toUpperCase() || ''
  //   return `${first}${last}`
  // }

  const getInitials = (userMetadata = {}) => {
  // 1️⃣ If first + last exist
  if (userMetadata.first_name || userMetadata.last_name) {
    const first = userMetadata.first_name?.charAt(0)?.toUpperCase() || '';
    const last = userMetadata.last_name?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || '?';
  }

  // 2️⃣ If full_name exists
  if (userMetadata.full_name) {
    const parts = userMetadata.full_name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0)?.toUpperCase() || '';
    const last =
      parts.length > 1
        ? parts[parts.length - 1]?.charAt(0)?.toUpperCase()
        : '';
    return `${first}${last}` || '?';
  }

  // 3️⃣ Fallback: email
  if (userMetadata.email) {
    return userMetadata.email.charAt(0).toUpperCase();
  }

  return '?';
};

const initials = getInitials(user.user_metadata);


const handleSignOut = async () =>{
  await signOut()
}

const handleProfileToggle = () => {
  setProfileDropdown((prev) => !prev)
}

const handleHideProfile = () => {
  setProfileDropdown(false)
}


  return (
    <header className='app_header'>
      <div className='container'>
        <div className='header_wrapper'>
          <div className='logo_wrapper'>
            <img src="/images/logo-invoice.png" alt="PAYCHECK" className='app_logo' />
          </div>
          <div className='menu_wrapper'>
            <nav>
              <ul>
                <li><NavLink to='/' className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
                <li><NavLink to='/invoices' className={({ isActive }) => isActive ? "active" : ""}>Invoices</NavLink></li>
                <li><NavLink to='/clients' className={({ isActive }) => isActive ? "active" : ""}>Clients</NavLink></li>
                <li><NavLink to='/projects' className={({ isActive }) => isActive ? "active" : ""}>Projects</NavLink></li>
              </ul>
            </nav>
          </div>
          <ClickAwayListener onClickAway={handleHideProfile}>
            <div className={`profile_wrapper ${showProfileDropdown && 'show_profile_dropdown'}`}>
            <div className='profile_icon' onClick={handleProfileToggle}>
              {initials}
            </div>
            <div className='profile_dropdown'>
              <ul>
                <li>
                  <span className='dropdown_initial_icon'>{initials}</span>
              <span className="dropdown_user_name">
  {userMetadata?.first_name || userMetadata?.last_name
    ? `${userMetadata?.first_name ?? ''} ${userMetadata?.last_name ?? ''}`.trim()
    : userMetadata?.full_name || ''}
</span>

                </li>
                <li onClick={handleSignOut}>
                  <img src="/images/logout.png" alt="Logout" />
                  <span className='dropdown_txt'>Logout</span>
                </li>
              </ul>
            </div>
          </div>
          </ClickAwayListener>
          
        </div>
      </div>
    </header>
  )
}

export default Header