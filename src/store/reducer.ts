import { createReducer } from '@reduxjs/toolkit';
import { City, Offer } from '../const';
import { DEFAULT_CITY } from '../cities';
import { changeCity, fillOffers } from './action';

type InitialState = {
  city: City;
  offers: Offer[];
};

const initialState: InitialState = {
  city: DEFAULT_CITY,
  offers: [],
};

export const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(changeCity, (state, action) => {
      state.city = action.payload;
    })
    .addCase(fillOffers, (state, action) => {
      state.offers = action.payload;
    });
});
