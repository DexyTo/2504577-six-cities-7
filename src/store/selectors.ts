import { createSelector } from '@reduxjs/toolkit';
import type { OfferPreview } from '../const';
import type { State } from './index';

export const getCity = (state: State) => state.city;
export const getOffers = (state: State) => state.offers.items;
export const getOffersStatus = (state: State) => state.offers.status;
export const getAuthorizationStatus = (state: State) =>
  state.user.authorizationStatus;
export const getAuthUser = (state: State) => state.user.profile;
export const getHasAuthCheckError = (state: State) =>
  state.user.hasAuthCheckError;
export const getIsAuthRequestPending = (state: State) =>
  state.user.isAuthRequestPending;

const getFavoriteOffers = createSelector([getOffers], (offers) =>
  offers.filter((offer) => offer.isFavorite),
);

export const getFavoriteCount = (state: State) =>
  getFavoriteOffers(state).length;

export const getFavoriteOffersByCity = createSelector(
  [getFavoriteOffers],
  (offers) => {
    const offersByCity = new Map<string, OfferPreview[]>();

    for (const offer of offers) {
      const cityName = offer.city.name;
      const cityOffers = offersByCity.get(cityName);

      if (cityOffers) {
        cityOffers.push(offer);
      } else {
        offersByCity.set(cityName, [offer]);
      }
    }

    return Array.from(offersByCity);
  },
);

export const getCityOffers = createSelector(
  [getOffers, getCity],
  (offers, city) => offers.filter((offer) => offer.city.name === city.name),
);
