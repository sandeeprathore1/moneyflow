import { apiRequest } from './api';

export interface FinancialGoal {
  id: string;
  name: string;
  goal_type: string;
  target_amount: string;
  current_amount: string;
  target_date: string | null;
  progress_percentage: number;
}

export async function getGoals(): Promise<FinancialGoal[]> {
  return apiRequest<FinancialGoal[]>('/api/v1/goals');
}

export async function createGoal(data: {
  name: string;
  target_amount: string;
  current_amount?: string;
}): Promise<FinancialGoal> {
  return apiRequest<FinancialGoal>('/api/v1/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
