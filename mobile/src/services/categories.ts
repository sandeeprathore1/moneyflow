import { apiRequest } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  is_system: boolean;
}

export async function listCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/api/v1/categories');
}
