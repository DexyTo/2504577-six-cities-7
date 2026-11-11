import { describe, expect, it } from 'vitest';
import { AuthorizationStatus } from '../const';
import { user } from '../test/fixtures';
import { setAuthorization } from './action';
import { checkAuth, login, logout } from './api-action';
import { userReducer } from './user-reducer';

describe('userReducer', () => {
  const requestId = 'auth-request';
  const credentials = { email: user.email, password: 'example123' };

  it('initializes with unknown authorization and no profile', () => {
    expect(userReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual({
      authorizationStatus: AuthorizationStatus.Unknown,
      profile: null,
      hasAuthCheckError: false,
      isAuthRequestPending: false,
    });
  });

  it('stores the profile and clears an earlier authorization check error', () => {
    const failed = userReducer(undefined, checkAuth.rejected(new Error('Request failed'), requestId, undefined));

    expect(userReducer(failed, setAuthorization(user))).toMatchObject({
      authorizationStatus: AuthorizationStatus.Auth,
      profile: user,
      hasAuthCheckError: false,
    });
  });

  it('clears the profile when authorization is removed', () => {
    const authorized = userReducer(undefined, setAuthorization(user));

    expect(userReducer(authorized, setAuthorization(null))).toMatchObject({
      authorizationStatus: AuthorizationStatus.NoAuth,
      profile: null,
      hasAuthCheckError: false,
    });
  });

  it('records an authorization check failure', () => {
    const failure = checkAuth.rejected(new Error('Request failed'), requestId, undefined);

    expect(userReducer(undefined, failure)).toMatchObject({
      authorizationStatus: AuthorizationStatus.NoAuth,
      profile: null,
      hasAuthCheckError: true,
    });
  });

  it('tracks a login request until it succeeds or fails', () => {
    const pending = userReducer(undefined, login.pending(requestId, credentials));
    const success = login.fulfilled(undefined, requestId, credentials);
    const failure = login.rejected(new Error('Request failed'), requestId, credentials);

    expect(pending.isAuthRequestPending).toBe(true);
    expect(userReducer(pending, success).isAuthRequestPending).toBe(false);
    expect(userReducer(pending, failure).isAuthRequestPending).toBe(false);
  });

  it('tracks a logout request until it succeeds or fails', () => {
    const pending = userReducer(undefined, logout.pending(requestId, undefined));
    const success = logout.fulfilled(undefined, requestId, undefined);
    const failure = logout.rejected(new Error('Request failed'), requestId, undefined);

    expect(pending.isAuthRequestPending).toBe(true);
    expect(userReducer(pending, success).isAuthRequestPending).toBe(false);
    expect(userReducer(pending, failure).isAuthRequestPending).toBe(false);
  });
});
