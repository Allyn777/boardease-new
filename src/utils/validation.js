export function getValidationErrors(formData, isSignup = false) {
  const errors = {};

  // Validate email or login field
  const identifier = formData.email ?? formData.login;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!identifier || !emailRegex.test(identifier)) {
    if (formData.email) {
      errors.email = 'Please enter a valid email address.';
    } else if (formData.login) {
      errors.login = 'Please enter a valid email address.';
    }
  }

  // Validate password for signup
  if (isSignup) {
    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  return errors;
}

export default getValidationErrors;
