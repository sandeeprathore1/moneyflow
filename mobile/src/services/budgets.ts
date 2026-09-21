import { apiRequest } from './api';

export interface BudgetCategory {
  category_id: string;
  category_name: string;
  limit_amount: string;
  spent_amount: string;
  percentage_used: number;
}

export interface Budget {
  id: string;
  month: string;
  total_amount: string;
  currency: string;
  spent_amount: string;
  remaining_amount: string;
  percentage_used: number;
  categories: BudgetCategory[];
}

export async function getBudget(): Promise<Budget | null> {
  try {
    return await apiRequest<Budget>('/api/v1/budgets');
  } catch {
    return null;
  }
}

export async function createBudget(data: {
  month: string;
  total_amount: string;
  categories: Array<{ category_id: string; limit_amount: string }>;
}): Promise<Budget> {
  return apiRequest<Budget>('/api/v1/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
