import { createAsyncThunk } from '@reduxjs/toolkit';
import { isAxiosError, type AxiosInstance } from 'axios';
import { StatusCodes } from 'http-status-codes';
import {
  AuthorizationStatus,
  type AuthInfo,
  type LoginData,
  type NewComment,
  type Offer,
  type OfferPreview,
  type ReviewData,
} from '../const';
import { dropToken, saveToken } from '../services/token';
import { setAuthorization } from './action';
import type { State } from './index';

type ApiThunkConfig = { extra: AxiosInstance };
type StateThunkConfig = ApiThunkConfig & { state: State };

type LoginError = {
  message?: string;
  details?: { messages: string[] }[];
};

export type OfferDetails = {
  offer: Offer;
  nearbyOffers: OfferPreview[];
  reviews: ReviewData[];
};

export type OfferDetailsError = 'not-found' | 'unavailable';

export const fetchOffers = createAsyncThunk<
  OfferPreview[],
  void,
  StateThunkConfig
>(
  'offers/fetchOffers',
  async (_arg, { extra: api, signal }) => {
    const { data } = await api.get<OfferPreview[]>('/offers', { signal });
    return data;
  },
  {
    condition: (_arg, { getState }) => getState().offersStatus !== 'succeeded',
  },
);

export const checkAuth = createAsyncThunk<void, void, ApiThunkConfig>(
  'user/checkAuth',
  async (_arg, { extra: api, dispatch }) => {
    try {
      const {
        data: { token, ...user },
      } = await api.get<AuthInfo>('/login');
      saveToken(token);
      dispatch(setAuthorization(user));
    } catch (error) {
      if (
        !isAxiosError(error) ||
        error.response?.status !== StatusCodes.UNAUTHORIZED
      ) {
        throw error;
      }

      dropToken();
      dispatch(setAuthorization(null));
    }
  },
);

export const login = createAsyncThunk<
  void,
  LoginData,
  StateThunkConfig & { rejectValue: string }
>(
  'user/login',
  async (credentials, { extra: api, dispatch, rejectWithValue }) => {
    try {
      const {
        data: { token, ...user },
      } = await api.post<AuthInfo>('/login', credentials);
      saveToken(token);
      dispatch(setAuthorization(user));
    } catch (error) {
      if (
        isAxiosError<LoginError>(error) &&
        error.response?.status === StatusCodes.BAD_REQUEST
      ) {
        const { message, details } = error.response.data;
        const validationMessage = details
          ?.flatMap((detail) => detail.messages)
          .join(' ');

        return rejectWithValue(
          validationMessage || message || 'Check your email and password.',
        );
      }

      return rejectWithValue('Could not sign in. Please try again.');
    }
  },
  {
    condition: (_arg, { getState }) => {
      const { authorizationStatus, isAuthRequestPending } = getState();
      return (
        authorizationStatus === AuthorizationStatus.NoAuth &&
        !isAuthRequestPending
      );
    },
  },
);

export const logout = createAsyncThunk<void, void, StateThunkConfig>(
  'user/logout',
  async (_arg, { extra: api, dispatch }) => {
    try {
      await api.delete('/logout');
    } catch (error) {
      if (
        !isAxiosError(error) ||
        error.response?.status !== StatusCodes.UNAUTHORIZED
      ) {
        throw error;
      }
    }

    dropToken();
    dispatch(setAuthorization(null));
  },
  {
    condition: (_arg, { getState }) => {
      const { authorizationStatus, isAuthRequestPending } = getState();
      return (
        authorizationStatus === AuthorizationStatus.Auth &&
        !isAuthRequestPending
      );
    },
  },
);

export const fetchOfferDetails = createAsyncThunk<
  OfferDetails,
  string,
  ApiThunkConfig & { rejectValue: OfferDetailsError }
>(
  'offers/fetchOfferDetails',
  async (id, { extra: api, signal, rejectWithValue }) => {
    const offerId = encodeURIComponent(id);

    const [offer, nearbyOffers, reviews] = await Promise.allSettled([
      api.get<Offer>(`/offers/${offerId}`, { signal }),
      api.get<OfferPreview[]>(`/offers/${offerId}/nearby`, { signal }),
      api.get<ReviewData[]>(`/comments/${offerId}`, { signal }),
    ]);

    if (offer.status === 'rejected') {
      const notFound =
        isAxiosError(offer.reason) &&
        offer.reason.response?.status === StatusCodes.NOT_FOUND;
      return rejectWithValue(notFound ? 'not-found' : 'unavailable');
    }

    if (nearbyOffers.status === 'rejected' || reviews.status === 'rejected') {
      return rejectWithValue('unavailable');
    }

    return {
      offer: offer.value.data,
      nearbyOffers: nearbyOffers.value.data,
      reviews: reviews.value.data,
    };
  },
);

export const postComment = createAsyncThunk<
  ReviewData,
  { offerId: string; comment: NewComment },
  StateThunkConfig
>(
  'offers/postComment',
  async ({ offerId, comment }, { extra: api }) => {
    const { data } = await api.post<ReviewData>(
      `/comments/${encodeURIComponent(offerId)}`,
      comment,
    );
    return data;
  },
  {
    condition: (_arg, { getState }) =>
      getState().authorizationStatus === AuthorizationStatus.Auth,
  },
);
