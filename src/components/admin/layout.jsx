import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/authcontext";
import { useState } from "react";

export default function Layout({ children }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const active = (path) =>
    location.pathname === `/admin${path}`
      ? "border-[#051A2C] text-[#051A2C]"
      : "border-transparent hover:text-black";

  const navLinks = [
    { path: "", label: "Dashboard" },
    { path: "/rooms", label: "Rooms Management" },
    { path: "/tenants", label: "Tenants Management" },
    { path: "/payments", label: "Payments Management" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-gray-900">
      {/* HEADER */}
      <header className="bg-[#051A2C] text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-widest text-white/70">Admin Panel</p>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm hidden sm:inline">
              Welcome,{" "}
              <span className="font-semibold">{user?.email?.split('@')[0] ?? "Admin"}</span>
            </span>

            <button
              onClick={signOut}
              className="rounded-full bg-red-500 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* DESKTOP NAV TABS */}
        <nav className="bg-white text-gray-600 hidden lg:block">
          <div className="max-w-7xl mx-auto flex">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={`/admin${link.path}`} 
                className={`flex-1 text-center py-3 border-b-2 text-sm font-medium ${active(link.path)}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* MOBILE/TABLET NAV TOGGLE */}
        <div className="bg-white lg:hidden px-4 sm:px-6 py-2 flex justify-between items-center border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            {navLinks.find(link => location.pathname === `/admin${link.path}`)?.label || "Dashboard"}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* MOBILE/TABLET DROPDOWN MENU */}
        {mobileMenuOpen && (
          <nav className="bg-white lg:hidden border-t border-gray-200">
            <div className="max-w-7xl mx-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={`/admin${link.path}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 sm:px-6 py-3 border-l-4 text-sm font-medium ${
                    location.pathname === `/admin${link.path}`
                      ? "border-[#051A2C] bg-gray-50 text-[#051A2C]"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">{children}</main>

      {/* FOOTER */}
      <footer className="bg-[#051A2C] py-4 sm:py-6 text-center text-xs sm:text-sm text-white/100">
        © {new Date().getFullYear()} Board Ease. All rights reserved.
      </footer>
    </div>
  );
}
