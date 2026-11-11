import { describe, expect, it } from 'vitest';
import { offerPreview, user } from '../test/fixtures';
import { setAuthorization } from './action';
import { fetchOffers } from './api-action';
import { offersReducer } from './offers-reducer';

describe('offersReducer', () => {
  const initialState = { items: [], status: 'loading', requestId: null };
  const requestId = 'offers-request';

  it('initializes with an empty list in the loading state', () => {
    expect(offersReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
  });

  it('records the current request when loading starts', () => {
    const state = offersReducer(undefined, fetchOffers.pending(requestId, undefined));

    expect(state).toEqual({ ...initialState, requestId });
  });

  it('stores the offers returned by the current request', () => {
    const loading = offersReducer(undefined, fetchOffers.pending(requestId, undefined));
    const state = offersReducer(loading, fetchOffers.fulfilled([offerPreview], requestId, undefined));

    expect(state).toEqual({ items: [offerPreview], status: 'succeeded', requestId: null });
  });

  it('records a failure for the current request', () => {
    const loading = offersReducer(undefined, fetchOffers.pending(requestId, undefined));
    const state = offersReducer(loading, fetchOffers.rejected(new Error('Request failed'), requestId, undefined));

    expect(state).toEqual({ items: [], status: 'failed', requestId: null });
  });

  it('ignores responses from an earlier request', () => {
    const loading = offersReducer(undefined, fetchOffers.pending(requestId, undefined));
    const success = fetchOffers.fulfilled([offerPreview], 'earlier-request', undefined);
    const failure = fetchOffers.rejected(new Error('Request failed'), 'earlier-request', undefined);

    expect(offersReducer(loading, success)).toEqual(loading);
    expect(offersReducer(loading, failure)).toEqual(loading);
  });

  it('clears loaded offers when authorization changes', () => {
    const loading = offersReducer(undefined, fetchOffers.pending(requestId, undefined));
    const loaded = offersReducer(loading, fetchOffers.fulfilled([offerPreview], requestId, undefined));

    expect(offersReducer(loaded, setAuthorization(user))).toEqual(initialState);
  });
});
