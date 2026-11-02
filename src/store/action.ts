import { createAction } from '@reduxjs/toolkit';
import { City, Offer } from '../const';

export const changeCity = createAction<City>('city/changeCity');
export const fillOffers = createAction<Offer[]>('offers/fillOffers');
