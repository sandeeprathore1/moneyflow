import { apiRequest } from './api';

export interface ChatResponse {
  answer: string;
  data_sources: string[];
}

export interface Insight {
  type: string;
  message: string;
  label: string;
}

export async function askAssistant(question: string): Promise<ChatResponse> {
  return apiRequest<ChatResponse>('/api/v1/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

export async function getInsights(): Promise<Insight[]> {
  return apiRequest<Insight[]>('/api/v1/ai/insights');
}
