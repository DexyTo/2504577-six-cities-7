import { createAsyncThunk } from '@reduxjs/toolkit';
import { isAxiosError, type AxiosInstance } from 'axios';
import type { Offer, OfferPreview, ReviewData } from '../const';

type ApiThunkConfig = { extra: AxiosInstance };

export type OfferDetails = {
  offer: Offer;
  nearbyOffers: OfferPreview[];
  reviews: ReviewData[];
};

export type OfferDetailsError = 'not-found' | 'unavailable';

export const fetchOffers = createAsyncThunk<
  OfferPreview[],
  void,
  ApiThunkConfig
>('offers/fetchOffers', async (_arg, { extra: api, signal }) => {
  const { data } = await api.get<OfferPreview[]>('/offers', { signal });
  return data;
});

export const fetchOfferDetails = createAsyncThunk<
  OfferDetails,
  string,
  ApiThunkConfig & { rejectValue: OfferDetailsError }
>(
  'offers/fetchOfferDetails',
  async (id, { extra: api, signal, rejectWithValue }) => {
    const offerId = encodeURIComponent(id);

    try {
      const [offer, nearbyOffers, reviews] = await Promise.all([
        api.get<Offer>(`/offers/${offerId}`, { signal }),
        api.get<OfferPreview[]>(`/offers/${offerId}/nearby`, { signal }),
        api.get<ReviewData[]>(`/comments/${offerId}`, { signal }),
      ]);

      return {
        offer: offer.data,
        nearbyOffers: nearbyOffers.data,
        reviews: reviews.data,
      };
    } catch (error) {
      const notFound = isAxiosError(error) && error.response?.status === 404;
      return rejectWithValue(notFound ? 'not-found' : 'unavailable');
    }
  },
);
