import type { AppUser } from '../models/User';
import type { APIUser } from './api';

import {
  api,
  json,
  setToken,
  clearToken
} from './api';

import {
  mapUser,
  setCurrentUser,
  resetAuthPromise
} from './authState';

export interface RegisterInput {
  displayName: string;
  email: string;
  phone: string;
  password: string;
  role?: 'donor' | 'organizer';
}

const FULL_NAME_REGEX =
  /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)? [\p{L}]\. [\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;

const GMAIL_REGEX =
  /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@gmail\.com$/;

const MOBILE_REGEX = /^09\d{9}$/;

function validateFullName(name: string): string {
  const cleanedName = name
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ');

  if (!cleanedName) {
    throw new Error('Please enter your full name.');
  }

  if (cleanedName.length > 100) {
    throw new Error('Full name must not exceed 100 characters.');
  }

  if (!FULL_NAME_REGEX.test(cleanedName)) {
    throw new Error(
      'Invalid full name format. Use First Name, optional Second Name, Middle Initial, and Last Name (e.g., Maria A. Santos).'
    );
  }

  return cleanedName;
}

function validateGmail(email: string): string {
  const cleanedEmail = email.trim().toLowerCase();

  if (!cleanedEmail) {
    throw new Error('Please enter your email address.');
  }

  if (cleanedEmail.length > 254) {
    throw new Error('Email address must not exceed 254 characters.');
  }

  if (
    !GMAIL_REGEX.test(cleanedEmail) ||
    cleanedEmail.includes('..')
  ) {
    throw new Error('Please use a valid email address.');
  }

  return cleanedEmail;
}

function validateMobileNumber(phone: string): string {
  const cleanedPhone = phone.trim();

  if (!cleanedPhone) {
    throw new Error('Please enter your mobile number.');
  }

  if (!MOBILE_REGEX.test(cleanedPhone)) {
    throw new Error(
      'Please enter a valid 11-digit Philippine mobile number starting with 09.'
    );
  }

  return cleanedPhone;
}

function validatePassword(password: string): void {
  if (!password) {
    throw new Error('Please enter your password.');
  }

  if (password.length < 10) {
    throw new Error('Password must be at least 10 characters.');
  }

  if (password.length > 128) {
    throw new Error('Password must not exceed 128 characters.');
  }
}

export async function registerUser(
  input: RegisterInput
): Promise<AppUser> {
  const validName = validateFullName(input.displayName);
  const validEmail = validateGmail(input.email);
  const validPhone = validateMobileNumber(input.phone);
  validatePassword(input.password);

  const result = await api<{
    user: APIUser;
    token: string;
  }>('/auth/register', {
    method: 'POST',
    body: json({
      name: validName,
      email: validEmail,
      phone: validPhone,
      password: input.password,
      role: input.role || 'donor'
    })
  });

  const user = mapUser(result.user);
  setToken(result.token);
  setCurrentUser(user);
  resetAuthPromise();

  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AppUser> {
  const result = await api<{
    user: APIUser;
    token: string;
  }>('/auth/login', {
    method: 'POST',
    body: json({
      email,
      password
    })
  });

  const user = mapUser(result.user);
  setToken(result.token);
  setCurrentUser(user);
  resetAuthPromise();

  return user;
}

export async function logoutUser(): Promise<void> {
  clearToken();
  setCurrentUser(null);
  resetAuthPromise();
}
