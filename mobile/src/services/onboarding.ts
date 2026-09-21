import { apiRequest } from './api';
import type { User } from './auth';

export interface OnboardingData {
  display_name?: string;
  monthly_income: string;
  salary_day: number;
  currency: string;
  total_budget: string;
  category_limits: Array<{ category_id: string; limit_amount: string }>;
}

export async function completeOnboarding(data: OnboardingData): Promise<User> {
  return apiRequest<User>('/api/v1/onboarding/complete', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
