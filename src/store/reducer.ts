import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import {
  AuthorizationStatus,
  type AuthUser,
  type City,
  type OfferPreview,
} from '../const';
import { DEFAULT_CITY } from '../cities';
import { changeCity, setAuthorization } from './action';
import { checkAuth, fetchOffers, login, logout } from './api-action';

type InitialState = {
  city: City;
  offers: OfferPreview[];
  offersStatus: 'loading' | 'succeeded' | 'failed';
  offersRequestId: string | null;
  authorizationStatus: AuthorizationStatus;
  user: AuthUser | null;
  hasAuthCheckError: boolean;
  isAuthRequestPending: boolean;
};

const initialState: InitialState = {
  city: DEFAULT_CITY,
  offers: [],
  offersStatus: 'loading',
  offersRequestId: null,
  authorizationStatus: AuthorizationStatus.Unknown,
  user: null,
  hasAuthCheckError: false,
  isAuthRequestPending: false,
};

export const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(changeCity, (state, action) => {
      state.city = action.payload;
    })
    .addCase(setAuthorization, (state, action) => {
      state.offers = [];
      state.offersStatus = 'loading';
      state.offersRequestId = null;
      state.user = action.payload;
      state.authorizationStatus = action.payload
        ? AuthorizationStatus.Auth
        : AuthorizationStatus.NoAuth;
      state.hasAuthCheckError = false;
    })
    .addCase(checkAuth.rejected, (state) => {
      state.user = null;
      state.authorizationStatus = AuthorizationStatus.NoAuth;
      state.hasAuthCheckError = true;
    })
    .addCase(fetchOffers.pending, (state, action) => {
      state.offersStatus = 'loading';
      state.offersRequestId = action.meta.requestId;
    })
    .addCase(fetchOffers.fulfilled, (state, action) => {
      if (state.offersRequestId === action.meta.requestId) {
        state.offers = action.payload;
        state.offersStatus = 'succeeded';
        state.offersRequestId = null;
      }
    })
    .addCase(fetchOffers.rejected, (state, action) => {
      if (state.offersRequestId === action.meta.requestId) {
        state.offersStatus = 'failed';
        state.offersRequestId = null;
      }
    })
    .addMatcher(isAnyOf(login.pending, logout.pending), (state) => {
      state.isAuthRequestPending = true;
    })
    .addMatcher(
      isAnyOf(
        login.fulfilled,
        login.rejected,
        logout.fulfilled,
        logout.rejected,
      ),
      (state) => {
        state.isAuthRequestPending = false;
      },
    );
});
