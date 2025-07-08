import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'

const defaultAvatar = (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
    <circle cx="20" cy="20" r="20" fill="#2D2D2D" />
    <circle cx="20" cy="16" r="7" fill="#6D28D9" />
    <ellipse cx="20" cy="30" rx="11" ry="7" fill="#4B5563" />
  </svg>
)

const doorIcon = (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 17v1a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h7a2 2 0 012 2v1M11 12h9m0 0l-3-3m3 3l-3 3" />
  </svg>
)

const userIcon = (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const dashboardIcon = (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" />
  </svg>
)

const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('keydown', handleEsc)
    }
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [dropdownOpen])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

    return (
    <div className="fixed top-0 left-0 w-screen h-16 px-6 flex items-center justify-between bg-black/90 text-white shadow z-50">
            {/* Left: Logo */}
      <div 
        className="text-2xl font-bold cursor-pointer hover:text-purple-400 transition-colors select-none"
        onClick={() => navigate('/')}
      >
                StreamSnipe
            </div>
      {/* Right: Only show 'Dashboard' if signed in and on landing page */}
      {user && location.pathname === '/' ? (
        <button
          className="text-lg font-semibold hover:text-purple-400 transition-colors"
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/pricing')}
            className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg transition-all focus:outline-none"
          >
            Upgrade
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              className="rounded-full focus:outline-none border-2 border-transparent hover:border-purple-500 transition-all"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-label="Open user menu"
            >
              {defaultAvatar}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-2 z-50 animate-fade-in">
                <button
                  className="w-full flex items-center px-4 py-2 text-left text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  {userIcon}
                  Account
                </button>
                <button
                  className="w-full flex items-center px-4 py-2 text-left text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                  onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                >
                  {dashboardIcon}
                  Dashboard
                </button>
                <button
                  className="w-full flex items-center px-4 py-2 text-left text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                  onClick={handleSignOut}
                >
                  {doorIcon}
                  Log out
                </button>
              </div>
            )}
            </div>
        </div>
      )}
    </div>
  )
}

export default Navbar;
