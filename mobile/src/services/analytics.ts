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
  average_daily_spending: string;
  largest_transactions: Array<{
    id: string;
    merchant: string | null;
    amount: string;
    transaction_type: string;
    transaction_date: string;
  }>;
  top_merchants: Array<{
    merchant: string;
    amount: string;
    transaction_count: number;
  }>;
  total_refunds: string;
  total_transfers: string;
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

export interface CashflowData {
  date_from: string;
  date_to: string;
  points: Array<{ label: string; income: string; expenses: string; net: string }>;
  total_income: string;
  total_expenses: string;
  net_cashflow: string;
}

function monthQuery(month?: string): string {
  return month ? `?month=${month}` : '';
}

export async function getDashboard(month?: string): Promise<DashboardData> {
  return apiRequest<DashboardData>(`/api/v1/analytics/dashboard${monthQuery(month)}`);
}

export async function getMonthlyAnalytics(month?: string): Promise<MonthlyAnalytics> {
  return apiRequest<MonthlyAnalytics>(`/api/v1/analytics/monthly${monthQuery(month)}`);
}

export async function getCategoryAnalytics(month?: string): Promise<CategoryAnalytics> {
  return apiRequest<CategoryAnalytics>(`/api/v1/analytics/categories${monthQuery(month)}`);
}

export async function getCashflow(
  dateFrom: string,
  dateTo: string,
  granularity: 'day' | 'week' = 'week',
): Promise<CashflowData> {
  return apiRequest<CashflowData>(
    `/api/v1/analytics/cashflow?date_from=${dateFrom}&date_to=${dateTo}&granularity=${granularity}`,
  );
}

export function formatMonthParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

export function shiftMonth(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}
