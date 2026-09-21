import { apiRequest } from './api';

export interface Subscription {
  id: string;
  name: string;
  amount: string;
  billing_cycle: string;
  status: string;
  monthly_cost: string;
  annual_cost: string;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  return apiRequest<Subscription[]>('/api/v1/subscriptions');
}

export async function syncSubscriptions(): Promise<Subscription[]> {
  return apiRequest<Subscription[]>('/api/v1/subscriptions/sync', { method: 'POST' });
}
