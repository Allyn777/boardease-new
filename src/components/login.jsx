import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getValidationErrors } from '../utils/validation'
import Header from './header'
import { useAuth } from '../contexts/authcontext'

const Login = () => {
  const navigate = useNavigate()
  const auth = useAuth()
  const [formData, setFormData] = useState({ login: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const validationErrors = getValidationErrors(formData, false)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const res = await auth.signIn(formData.login, formData.password)
      
      if (res.error) {
        setErrors({ general: res.error.message || 'Login failed' })
      } else {
        // ✅ Use the role returned from signIn, not auth.userRole state
        console.log('Login response role:', res.role)
        
        if (res.role === 'admin') {
          navigate('/admin', { replace: true })
        } else {
          navigate('/profile', { replace: true })
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.login) {
      setErrors({ login: 'Please enter your email address first' })
      return
    }

    const res = await auth.resetPassword(formData.login)
    if (res.error) {
      setErrors({ general: res.error.message || 'Failed to send reset email' })
    } else {
      setErrors({ general: 'Password reset email sent! Check your inbox.' })
    }
  }

  return (
    <div className="min-h-screen bg-[#061A25] flex items-center justify-center p-2 sm:p-4">
      <Header />
      <div className="w-full max-w-6xl">
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row items-stretch">
            <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 xl:p-12 bg-[#FFFFFF]">
              <div className="max-w-md mx-auto">
                <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">Welcome back</h1>
                <p className="text-black-300 mb-8">Login to your boardease account</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="login" className="block text-black text-sm font-medium mb-2">
                      Login
                    </label>
                    <input
                      type="text"
                      id="login"
                      name="login"
                      value={formData.login}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-[#FFFFFF] text-gray-900 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.login ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your Email"
                      required
                    />
                    {errors.login && <p className="text-red-400 text-xs mt-1">{errors.login}</p>}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="password" className="block text-black text-sm font-medium">
                        Password
                      </label>
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-[#FFFFFF] text-gray-900 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                  </div>
                 
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-black hover:text-blue-400 transition-colors ml-0 sm:ml-20 md:ml-75"
                  >
                    Forgot your Password?
                  </button>

                  {errors.general && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-[#061A25] hover:bg-[#1C1C1C] disabled:bg-[#1C1C1C] disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-black-300 text-sm">
                    Don't have account?{' '}
                    <button onClick={() => navigate('/signup')} className="text-black hover:text-blue-400 transition-colors font-medium">
                      Sign Up
                    </button>
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 relative min-h-[200px] sm:min-h-[280px] md:min-h-[360px] lg:min-h-0 overflow-hidden">
              <img src="../logo-picture/login-bg.png" alt="Interior design" className="w-full h-48 sm:h-64 md:h-96 lg:h-full object-cover" onError={(e) => { e.target.style.display = 'none'; const next = e.target.nextElementSibling; if (next) next.style.display = 'block'; }} />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-700 hidden"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login