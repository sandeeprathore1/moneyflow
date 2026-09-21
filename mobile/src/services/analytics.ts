import { apiRequest } from './api';

export interface DashboardData {
  month: string;
  currency: string;
  total_income: string;
  total_expenses: string;
  total_saved: string;
  budget_total: string | null;
  budget_spent: string;
  budget_remaining: string | null;
  budget_percentage_used: number | null;
  top_categories: Array<{
    category_id: string | null;
    category_name: string;
    amount: string;
    percentage: number;
  }>;
  recent_transactions: Array<{
    id: string;
    merchant: string | null;
    amount: string;
    transaction_type: string;
    transaction_date: string;
    category_name: string | null;
  }>;
}

export interface MonthlyAnalytics {
  month: string;
  total_spent: string;
  total_income: string;
  savings_rate: number;
  mom_change_percentage: number | null;
  trend: Array<{ label: string; amount: string }>;
}

export interface CategoryAnalytics {
  month: string;
  categories: Array<{
    category_id: string | null;
    category_name: string;
    amount: string;
    percentage: number;
  }>;
  total: string;
}

export async function getDashboard(): Promise<DashboardData> {
  return apiRequest<DashboardData>('/api/v1/analytics/dashboard');
}

export async function getMonthlyAnalytics(): Promise<MonthlyAnalytics> {
  return apiRequest<MonthlyAnalytics>('/api/v1/analytics/monthly');
}

export async function getCategoryAnalytics(): Promise<CategoryAnalytics> {
  return apiRequest<CategoryAnalytics>('/api/v1/analytics/categories');
}
