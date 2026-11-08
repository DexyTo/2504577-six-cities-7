import { createAction } from '@reduxjs/toolkit';
import type { AuthUser, City } from '../const';

export const changeCity = createAction<City>('city/changeCity');
export const setAuthorization = createAction<AuthUser | null>(
  'user/setAuthorization',
);
