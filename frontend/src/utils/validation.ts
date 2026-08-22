import { RegisterData, LoginCredentials } from '@/types';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Mirrors backend/src/constants/validationRules.js. The two must agree: every
// time they drifted, the form accepted something the API then refused, and the
// person got two contradictory messages for one mistake - one under the field
// and a differently worded one above the form.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;
export const PASSWORD_LENGTH_MESSAGE = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
export const PASSWORD_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, and one number';

export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 30;
export const NAME_MESSAGE = `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`;

export const PHONE_LENGTH = 11;
export const PHONE_PATTERN = /^\d{11}$/;
export const PHONE_MESSAGE = `Phone number must be ${PHONE_LENGTH} digits`;

export const validateRegistrationData = (data: RegisterData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  } else if (
    data.name.trim().length < NAME_MIN_LENGTH ||
    data.name.trim().length > NAME_MAX_LENGTH
  ) {
    errors.name = NAME_MESSAGE;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation
  if (!data.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!PHONE_PATTERN.test(data.phone.trim())) {
    errors.phone = PHONE_MESSAGE;
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = PASSWORD_LENGTH_MESSAGE;
  } else if (!PASSWORD_PATTERN.test(data.password)) {
    errors.password = PASSWORD_MESSAGE;
  }

  // Address validation
  if (!data.street?.trim()) {
    errors.street = 'Street address is required';
  }

  if (!data.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!data.state?.trim()) {
    errors.state = 'State is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLoginData = (data: LoginCredentials): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.emailOrPhone?.trim()) {
    errors.emailOrPhone = 'Email or phone is required';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateResetPassword = (data: { password: string; confirmPassword: string }): ValidationResult => {
  const errors: Record<string, string> = {};
  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = PASSWORD_LENGTH_MESSAGE;
  } else if (!PASSWORD_PATTERN.test(data.password)) {
    errors.password = PASSWORD_MESSAGE;
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
