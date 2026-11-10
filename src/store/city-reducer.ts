import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_CITY } from '../cities';
import { changeCity } from './action';

export const cityReducer = createReducer(DEFAULT_CITY, (builder) => {
  builder.addCase(changeCity, (_state, action) => action.payload);
});
