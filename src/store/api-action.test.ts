import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { StatusCodes } from 'http-status-codes';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthorizationStatus } from '../const';
import { dropToken, getToken, saveToken } from '../services/token';
import { offer, offerPreview, review, user } from '../test/fixtures';
import { createTestStore } from '../test/test-store';
import { setAuthorization } from './action';
import { checkAuth, fetchFavorites, fetchOfferDetails, fetchOffers, logout, postComment, setFavoriteStatus } from './api-action';

const offerId = 'paris/loft';
const detailsPath = '/offers/paris%2Floft';
const commentsPath = '/comments/paris%2Floft';
const comment = { rating: review.rating, comment: review.comment };

describe('API actions', () => {
  let mock: MockAdapter;
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    const api = axios.create();
    mock = new MockAdapter(api, { onNoMatch: 'throwException' });
    store = createTestStore(api);
  });

  afterEach(() => {
    mock.restore();
    dropToken();
  });

  describe('checkAuth', () => {
    it('restores the user profile and saves the token returned by the server', async () => {
      const token = 'restored-session-token';
      mock.onGet('/login').replyOnce(StatusCodes.OK, { ...user, token });

      await store.dispatch(checkAuth()).unwrap();

      expect(store.getState().user).toMatchObject({ authorizationStatus: AuthorizationStatus.Auth, profile: user });
      expect(getToken()).toBe(token);
    });

    it('clears an expired session when the server returns 401', async () => {
      saveToken('expired-session-token');
      mock.onGet('/login').replyOnce(StatusCodes.UNAUTHORIZED);

      await store.dispatch(checkAuth()).unwrap();

      expect(store.getState().user.authorizationStatus).toBe(AuthorizationStatus.NoAuth);
      expect(getToken()).toBeNull();
    });

    it('records a network error during the authorization check', async () => {
      mock.onGet('/login').networkErrorOnce();

      await expect(store.dispatch(checkAuth()).unwrap()).rejects.toMatchObject({ message: 'Network Error' });
      expect(store.getState().user.hasAuthCheckError).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears the local session if the server already considers it expired', async () => {
      store.dispatch(setAuthorization(user));
      saveToken('expired-session-token');
      mock.onDelete('/logout').replyOnce(StatusCodes.UNAUTHORIZED);

      await store.dispatch(logout()).unwrap();

      expect(store.getState().user.authorizationStatus).toBe(AuthorizationStatus.NoAuth);
      expect(getToken()).toBeNull();
    });
  });

  describe('fetchOffers', () => {
    it('returns offers from GET /offers', async () => {
      mock.onGet('/offers').replyOnce(StatusCodes.OK, [offerPreview]);

      await expect(store.dispatch(fetchOffers()).unwrap()).resolves.toEqual([offerPreview]);
    });

    it('rejects when the server cannot load offers', async () => {
      mock.onGet('/offers').replyOnce(StatusCodes.INTERNAL_SERVER_ERROR);

      await expect(store.dispatch(fetchOffers()).unwrap()).rejects.toMatchObject({
        message: 'Request failed with status code 500',
      });
    });

    it('skips loading offers that are already available', async () => {
      mock.onGet('/offers').replyOnce(StatusCodes.OK, [offerPreview]);
      await store.dispatch(fetchOffers()).unwrap();

      const action = await store.dispatch(fetchOffers());

      expect(action.meta).toMatchObject({ requestStatus: 'rejected', condition: true });
      expect(mock.history.get).toHaveLength(1);
    });
  });

  describe('fetchFavorites', () => {
    it('returns favorites for an authorized user', async () => {
      const favorites = [{ ...offerPreview, isFavorite: true }];
      store.dispatch(setAuthorization(user));
      mock.onGet('/favorite').replyOnce(StatusCodes.OK, favorites);

      await expect(store.dispatch(fetchFavorites()).unwrap()).resolves.toEqual(favorites);
    });

    it('skips the request for a guest', async () => {
      store.dispatch(setAuthorization(null));

      const action = await store.dispatch(fetchFavorites());

      expect(action.meta).toMatchObject({ requestStatus: 'rejected', condition: true });
      expect(mock.history.get).toHaveLength(0);
    });

    it('reuses an in-flight load and lets the page fetch again after it finishes', async () => {
      const favorites = [{ ...offerPreview, isFavorite: true }];
      store.dispatch(setAuthorization(user));
      mock.onGet('/favorite').replyOnce(StatusCodes.OK, []);
      mock.onGet('/favorite').replyOnce(StatusCodes.OK, favorites);

      const firstLoad = store.dispatch(fetchFavorites());
      const skippedRefresh = await store.dispatch(fetchFavorites('refresh'));
      expect(skippedRefresh.meta).toMatchObject({ requestStatus: 'rejected', condition: true });
      await firstLoad.unwrap();

      await expect(store.dispatch(fetchFavorites('refresh')).unwrap()).resolves.toEqual(favorites);
      expect(mock.history.get).toHaveLength(2);
    });
  });

  describe('setFavoriteStatus', () => {
    it.each([
      { isFavorite: true, path: '/favorite/paris%2Floft/1' },
      { isFavorite: false, path: '/favorite/paris%2Floft/0' },
    ])('posts the updated status to $path', async ({ isFavorite, path }) => {
      const updated = { ...offerPreview, id: offerId, isFavorite };
      store.dispatch(setAuthorization(user));
      mock.onPost(path).replyOnce(StatusCodes.OK, updated);

      await expect(store.dispatch(setFavoriteStatus({ offerId, isFavorite })).unwrap()).resolves.toEqual(updated);
    });
  });

  describe('fetchOfferDetails', () => {
    const details = { ...offer, id: offerId };

    it('returns the offer, nearby places, and reviews for the requested ID', async () => {
      mock.onGet(detailsPath).replyOnce(StatusCodes.OK, details);
      mock.onGet(`${detailsPath}/nearby`).replyOnce(StatusCodes.OK, [offerPreview]);
      mock.onGet(commentsPath).replyOnce(StatusCodes.OK, [review]);

      await expect(store.dispatch(fetchOfferDetails(offerId)).unwrap()).resolves.toEqual({
        offer: details,
        nearbyOffers: [offerPreview],
        reviews: [review],
      });
    });

    it('reports a missing offer when its details return 404', async () => {
      mock.onGet(detailsPath).replyOnce(StatusCodes.NOT_FOUND);
      mock.onGet(`${detailsPath}/nearby`).replyOnce(StatusCodes.OK, []);
      mock.onGet(commentsPath).replyOnce(StatusCodes.OK, []);

      await expect(store.dispatch(fetchOfferDetails(offerId)).unwrap()).rejects.toBe('not-found');
    });

    it.each([
      detailsPath,
      `${detailsPath}/nearby`,
      commentsPath,
    ])('reports unavailable details when %s fails', async (path) => {
      mock.onGet(path).replyOnce(StatusCodes.INTERNAL_SERVER_ERROR);
      mock.onGet(detailsPath).replyOnce(StatusCodes.OK, details);
      mock.onGet(`${detailsPath}/nearby`).replyOnce(StatusCodes.OK, []);
      mock.onGet(commentsPath).replyOnce(StatusCodes.OK, []);

      await expect(store.dispatch(fetchOfferDetails(offerId)).unwrap()).rejects.toBe('unavailable');
      expect(mock.history.get.map((request) => request.url)).toEqual([
        detailsPath,
        `${detailsPath}/nearby`,
        commentsPath,
      ]);
    });
  });

  describe('postComment', () => {
    it('sends the rating and comment and returns the saved review', async () => {
      store.dispatch(setAuthorization(user));
      mock.onPost(commentsPath, comment).replyOnce(StatusCodes.CREATED, review);

      await expect(store.dispatch(postComment({ offerId, comment })).unwrap()).resolves.toEqual(review);
    });

    it('rejects when the server refuses the comment', async () => {
      store.dispatch(setAuthorization(user));
      mock.onPost(commentsPath, comment).replyOnce(StatusCodes.BAD_REQUEST);

      await expect(store.dispatch(postComment({ offerId, comment })).unwrap()).rejects.toMatchObject({
        message: 'Request failed with status code 400',
      });
    });

    it('skips the request for a guest', async () => {
      store.dispatch(setAuthorization(null));

      const action = await store.dispatch(postComment({ offerId, comment }));

      expect(action.meta).toMatchObject({ requestStatus: 'rejected', condition: true });
      expect(mock.history.post).toHaveLength(0);
    });
  });
});
