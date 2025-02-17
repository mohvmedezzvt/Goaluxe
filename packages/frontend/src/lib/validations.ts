export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 6 characters
  return password.length >= 6;
};

export const validateUsername = (username: string): boolean => {
  // 3-20 characters, letters, numbers, underscores, hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

// Optional: Strong password validation for registration only
export const isStrongPassword = (password: string): boolean => {
  // At least:
  // - 8 characters
  // - 1 uppercase
  // - 1 lowercase
  // - 1 number
  // - Special characters are allowed
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  return passwordRegex.test(password);
};
