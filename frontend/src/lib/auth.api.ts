import api from './api';
import { AuthResponse, User } from '@/types';

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await api.post('/auth/register', data);
  return response.data.data;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await api.post('/auth/login', data);
  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function refreshToken(): Promise<{ accessToken: string }> {
  const response = await api.post('/auth/refresh');
  return response.data.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data.data.user;
}
