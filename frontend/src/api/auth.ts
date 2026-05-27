import { api } from './client';
import { User } from '../types';

export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post<{ data: User }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ data: { accessToken: string; refreshToken: string; user: User } }>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<{ data: { accessToken: string } }>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  me: () =>
    api.get<{ data: User }>('/auth/me'),

  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    api.put<{ data: User }>('/auth/me', data),
};
