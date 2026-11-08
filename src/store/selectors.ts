import { createSelector } from '@reduxjs/toolkit';
import type { State } from './index';

export const getCity = (state: State) => state.city;
export const getOffers = (state: State) => state.offers;
export const getOffersStatus = (state: State) => state.offersStatus;
export const getAuthorizationStatus = (state: State) =>
  state.authorizationStatus;
export const getAuthUser = (state: State) => state.user;
export const getHasAuthCheckError = (state: State) => state.hasAuthCheckError;
export const getIsAuthRequestPending = (state: State) =>
  state.isAuthRequestPending;

export const getFavoriteCount = createSelector(
  [getOffers],
  (offers) => offers.filter((offer) => offer.isFavorite).length,
);

export const getCityOffers = createSelector(
  [getOffers, getCity],
  (offers, city) => offers.filter((offer) => offer.city.name === city.name),
);
