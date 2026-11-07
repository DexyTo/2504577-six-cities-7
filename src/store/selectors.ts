import { createSelector } from '@reduxjs/toolkit';
import type { State } from './index';

export const getCity = (state: State) => state.city;
export const getOffers = (state: State) => state.offers;
export const getOffersStatus = (state: State) => state.offersStatus;

export const getCityOffers = createSelector(
  [getOffers, getCity],
  (offers, city) => offers.filter((offer) => offer.city.name === city.name),
);
