import { createReducer } from '@reduxjs/toolkit';
import type { OfferPreview } from '../const';
import { setAuthorization } from './action';
import { fetchOffers } from './api-action';

type OffersState = {
  items: OfferPreview[];
  status: 'loading' | 'succeeded' | 'failed';
  requestId: string | null;
};

const initialState: OffersState = {
  items: [],
  status: 'loading',
  requestId: null,
};

export const offersReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setAuthorization, () => initialState)
    .addCase(fetchOffers.pending, (state, action) => {
      state.status = 'loading';
      state.requestId = action.meta.requestId;
    })
    .addCase(fetchOffers.fulfilled, (state, action) => {
      if (state.requestId === action.meta.requestId) {
        state.items = action.payload;
        state.status = 'succeeded';
        state.requestId = null;
      }
    })
    .addCase(fetchOffers.rejected, (state, action) => {
      if (state.requestId === action.meta.requestId) {
        state.status = 'failed';
        state.requestId = null;
      }
    });
});
