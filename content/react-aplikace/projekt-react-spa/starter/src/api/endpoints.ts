import { apiFetch } from './client';
import type { Plan, Recipe, User } from '../lib/types';

export const getRecipes = () => apiFetch<Recipe[]>('/recipes');
export const getRecipe = (id: string | number) => apiFetch<Recipe>(`/recipes/${id}`);

export const getMe = () => apiFetch<User>('/me');
export const login = (email: string, password: string) =>
  apiFetch<User>('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const logout = () => apiFetch<void>('/logout', { method: 'POST' });

export const getFavourites = () => apiFetch<number[]>('/favourites');
export const addFavourite = (id: number) => apiFetch<number[]>(`/favourites/${id}`, { method: 'PUT' });
export const removeFavourite = (id: number) => apiFetch<number[]>(`/favourites/${id}`, { method: 'DELETE' });

export const getPlan = () => apiFetch<Plan>('/plan');
export const savePlan = (plan: Plan) => apiFetch<Plan>('/plan', { method: 'PUT', body: JSON.stringify(plan) });
