import { createReducer } from '@reduxjs/toolkit';
import type { City, OfferPreview } from '../const';
import { DEFAULT_CITY } from '../cities';
import { changeCity } from './action';
import { fetchOffers } from './api-action';

type InitialState = {
  city: City;
  offers: OfferPreview[];
  offersStatus: 'loading' | 'succeeded' | 'failed';
};

const initialState: InitialState = {
  city: DEFAULT_CITY,
  offers: [],
  offersStatus: 'loading',
};

export const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(changeCity, (state, action) => {
      state.city = action.payload;
    })
    .addCase(fetchOffers.pending, (state) => {
      state.offersStatus = 'loading';
    })
    .addCase(fetchOffers.fulfilled, (state, action) => {
      state.offers = action.payload;
      state.offersStatus = 'succeeded';
    })
    .addCase(fetchOffers.rejected, (state) => {
      state.offersStatus = 'failed';
    });
});
