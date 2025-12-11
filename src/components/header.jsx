import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  
  // Hide header on auth pages where you don't want a header displayed
  const hideOn = ['/login', '/signup'];
  if (hideOn.includes(location.pathname)) return null;

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-[#071E26] border-b border-[#06303a] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20"> 
          {/* Logo area */}
          <div className="flex items-center gap-3"> 
            <button onClick={() => navigate('/home')} className="flex items-center gap-2 focus:outline-none">
              <img
                src="/logo.png"
                alt="Board Ease"
                className="w-12 h-auto rounded-full object-contain p-1"
                onError={(e) => { e.target.src = '../logo-picture/main-logo.jpg'; }}
              />
              <span className="text-white font-semibold tracking-wide hidden sm:inline">BOARD EASE</span>
            </button>
          </div>

          {/* Desktop / tablet nav */}
          <nav className="hidden md:flex items-center gap-4"> 
            <button onClick={() => navigate('/profile')} className={`flex items-center gap-2 text-sm px-3 py-1 rounded ${isActive('/profile') ? 'text-white bg-[#0b2f36]' : 'text-white hover:text-gray-200'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </button>
            {/* Logout button */}
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm px-3 py-1 rounded text-red-400 hover:text-red-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
              <span>Logout</span>
            </button>
          </nav>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center"> 
            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((s) => !s)}
              className="p-2 rounded-md text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {open ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden bg-[#071E26] border-t border-[#06303a]"> 
          <div className="px-4 pt-4 pb-6 space-y-2">
            <button onClick={() => { setOpen(false); navigate('/profile'); }} className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${isActive('/profile') ? 'text-white bg-[#0b2f36]' : 'text-white hover:bg-white/5'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </button>
            {/* Mobile logout button */}
            <button onClick={() => { setOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 rounded flex items-center gap-2 text-red-400 hover:bg-white/5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;