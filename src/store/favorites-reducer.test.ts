import { describe, expect, it } from 'vitest';
import { offerPreview } from '../test/fixtures';
import { setAuthorization } from './action';
import { fetchFavorites, setFavoriteStatus } from './api-action';
import { favoritesReducer } from './favorites-reducer';

describe('favoritesReducer', () => {
  const initialState = {
    items: {},
    status: 'idle',
    hasLoaded: false,
    requestId: null,
    updatesDuringFetch: {},
    pendingUpdates: {},
    hasUpdateError: false,
  };
  const requestId = 'favorites-request';
  const favorite = { ...offerPreview, isFavorite: true };
  const offerId = favorite.id;
  const addFavorite = { offerId, isFavorite: true };
  const removeFavorite = { offerId, isFavorite: false };

  it('initializes with empty favorites and no active requests', () => {
    expect(favoritesReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
  });

  it('records the request ID when favorites start loading', () => {
    const state = favoritesReducer(undefined, fetchFavorites.pending(requestId, undefined));

    expect(state).toEqual({ ...initialState, status: 'loading', requestId });
  });

  it('stores loaded favorites by offer ID', () => {
    const loading = favoritesReducer(undefined, fetchFavorites.pending(requestId, undefined));
    const state = favoritesReducer(loading, fetchFavorites.fulfilled([favorite], requestId, undefined));

    expect(state).toEqual({ ...initialState, items: { [offerId]: favorite }, status: 'succeeded', hasLoaded: true });
  });

  it('records a failure for the current favorites request', () => {
    const loading = favoritesReducer(undefined, fetchFavorites.pending(requestId, undefined));
    const failure = fetchFavorites.rejected(new Error('Request failed'), requestId, undefined);

    expect(favoritesReducer(loading, failure)).toEqual({ ...initialState, status: 'failed' });
  });

  it('keeps a completed removal when the favorites list arrives later', () => {
    const loading = favoritesReducer(undefined, fetchFavorites.pending(requestId, undefined));
    const updating = favoritesReducer(loading, setFavoriteStatus.pending('remove-request', removeFavorite));
    const removed = favoritesReducer(
      updating,
      setFavoriteStatus.fulfilled(offerPreview, 'remove-request', removeFavorite),
    );
    const state = favoritesReducer(removed, fetchFavorites.fulfilled([favorite], requestId, undefined));

    expect(state).toEqual({ ...initialState, items: { [offerId]: null }, status: 'succeeded', hasLoaded: true });
  });

  it('replaces the previous snapshot with the latest server response', () => {
    const loading = favoritesReducer(undefined, fetchFavorites.pending(requestId, undefined));
    const loaded = favoritesReducer(loading, fetchFavorites.fulfilled([favorite], requestId, undefined));
    const refreshing = favoritesReducer(loaded, fetchFavorites.pending('refresh-request', 'refresh'));
    const refreshed = favoritesReducer(refreshing, fetchFavorites.fulfilled([], 'refresh-request', 'refresh'));

    expect(refreshing.items).toEqual({ [offerId]: favorite });
    expect(refreshed).toEqual({ ...initialState, status: 'succeeded', hasLoaded: true });
  });

  it('tracks an update and adds the returned favorite', () => {
    const pending = favoritesReducer(undefined, setFavoriteStatus.pending(requestId, addFavorite));
    const state = favoritesReducer(pending, setFavoriteStatus.fulfilled(favorite, requestId, addFavorite));

    expect(pending.pendingUpdates).toEqual({ [offerId]: requestId });
    expect(state).toEqual({ ...initialState, items: { [offerId]: favorite } });
  });

  it('records an update failure and clears the error on retry', () => {
    const pending = favoritesReducer(undefined, setFavoriteStatus.pending(requestId, addFavorite));
    const failure = setFavoriteStatus.rejected(new Error('Request failed'), requestId, addFavorite);
    const failed = favoritesReducer(pending, failure);
    const retry = favoritesReducer(failed, setFavoriteStatus.pending('retry-request', addFavorite));

    expect(failed).toEqual({ ...initialState, hasUpdateError: true });
    expect(retry).toEqual({ ...initialState, pendingUpdates: { [offerId]: 'retry-request' } });
  });

  it('resets favorites on sign-out and ignores responses still in flight', () => {
    const loading = favoritesReducer(undefined, fetchFavorites.pending(requestId, undefined));
    const updating = favoritesReducer(loading, setFavoriteStatus.pending('add-request', addFavorite));
    const reset = favoritesReducer(updating, setAuthorization(null));

    expect(reset).toEqual(initialState);
    expect(favoritesReducer(reset, fetchFavorites.fulfilled([favorite], requestId, undefined))).toEqual(reset);
    expect(favoritesReducer(reset, setFavoriteStatus.fulfilled(favorite, 'add-request', addFavorite))).toEqual(reset);
  });
});
