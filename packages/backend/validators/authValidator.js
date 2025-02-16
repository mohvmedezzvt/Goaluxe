import Joi from 'joi';

// Password Strength Checker Regex (minimum 8 chars, letters, numbers, symbols)
const passwordPattern =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Registration Validation Schema
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.base': 'Username must be a string',
    'string.alphanum': 'Username must only contain letters and numbers',
    'string.empty': 'Username is required',
    'string.min': 'Username should have a minimum length of 3',
    'string.max': 'Username should have a maximum length of 30',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base':
      'Password must be at least 8 characters long, include letters, numbers, and a special character',
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

// Login Validation Schema
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});
