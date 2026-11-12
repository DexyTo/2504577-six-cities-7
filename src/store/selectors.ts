import { createSelector } from '@reduxjs/toolkit';
import { AuthorizationStatus, type OfferPreview } from '../const';
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

const getFavoriteItems = (state: State) => state.favorites.items;

export const getFavoritesStatus = (state: State) => state.favorites.status;
export const getHasLoadedFavorites = (state: State) => state.favorites.hasLoaded;
export const getHasFavoriteUpdateError = (state: State) =>
  state.favorites.hasUpdateError;
export const getIsFavoriteUpdatePending = (state: State, offerId: string) =>
  state.favorites.pendingUpdates[offerId] !== undefined;

export function getIsFavorite(
  state: State,
  offerId: string,
  initialStatus: boolean,
): boolean {
  if (getAuthorizationStatus(state) !== AuthorizationStatus.Auth) {
    return false;
  }

  const favorite = getFavoriteItems(state)[offerId];
  return favorite === undefined
    ? !getHasLoadedFavorites(state) && initialStatus
    : favorite !== null;
}

const getFavoriteOffers = createSelector([getFavoriteItems], (items) =>
  Object.values(items).filter((offer): offer is OfferPreview => Boolean(offer)),
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
