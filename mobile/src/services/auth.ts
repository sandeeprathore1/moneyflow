import * as SecureStore from 'expo-secure-store';

import { apiRequest, setTokens, clearTokens } from './api';

export interface UserProfile {
  display_name: string | null;
  currency: string;
  monthly_income: string | null;
  salary_day: number | null;
  onboarding_completed: boolean;
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  profile: UserProfile | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  return apiRequest<User>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name: displayName }),
  });
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const tokens = await apiRequest<TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await setTokens(tokens.access_token, tokens.refresh_token);
  return tokens;
}

export async function getMe(): Promise<User> {
  return apiRequest<User>('/api/v1/users/me');
}

export async function logout(): Promise<void> {
  const refreshToken = await SecureStore.getItemAsync('refresh_token');
  if (refreshToken) {
    try {
      await apiRequest<void>('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Clear local session even if server revoke fails
    }
  }
  await clearTokens();
}
