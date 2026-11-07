import { createAction } from '@reduxjs/toolkit';
import type { City } from '../const';

export const changeCity = createAction<City>('city/changeCity');
