import { createReducer } from '@reduxjs/toolkit';
import type { OfferPreview } from '../const';
import { setAuthorization } from './action';
import { fetchFavorites, setFavoriteStatus } from './api-action';

type FavoritesState = {
  items: Record<string, OfferPreview | null | undefined>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  requestId: string | null;
  pendingUpdates: Record<string, string | undefined>;
  hasUpdateError: boolean;
};

const initialState: FavoritesState = {
  items: {},
  status: 'idle',
  requestId: null,
  pendingUpdates: {},
  hasUpdateError: false,
};

export const favoritesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setAuthorization, () => initialState)
    .addCase(fetchFavorites.pending, (state, action) => {
      state.status = 'loading';
      state.requestId = action.meta.requestId;
    })
    .addCase(fetchFavorites.fulfilled, (state, action) => {
      if (state.requestId === action.meta.requestId) {
        state.items = {
          ...Object.fromEntries(
            action.payload.map((offer) => [offer.id, offer]),
          ),
          ...state.items,
        };
        state.status = 'succeeded';
        state.requestId = null;
      }
    })
    .addCase(fetchFavorites.rejected, (state, action) => {
      if (state.requestId === action.meta.requestId) {
        state.status = 'failed';
        state.requestId = null;
      }
    })
    .addCase(setFavoriteStatus.pending, (state, action) => {
      state.pendingUpdates[action.meta.arg.offerId] = action.meta.requestId;
      state.hasUpdateError = false;
    })
    .addCase(setFavoriteStatus.fulfilled, (state, action) => {
      const { offerId } = action.meta.arg;
      if (state.pendingUpdates[offerId] === action.meta.requestId) {
        const offer = action.payload;
        state.items[offerId] = offer.isFavorite ? offer : null;
        delete state.pendingUpdates[offerId];
      }
    })
    .addCase(setFavoriteStatus.rejected, (state, action) => {
      const { offerId } = action.meta.arg;
      if (state.pendingUpdates[offerId] === action.meta.requestId) {
        delete state.pendingUpdates[offerId];
        state.hasUpdateError = true;
      }
    });
});
