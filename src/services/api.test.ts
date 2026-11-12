import MockAdapter from 'axios-mock-adapter';
import { StatusCodes } from 'http-status-codes';
import { afterEach, describe, expect, it } from 'vitest';
import { createApi } from './api';
import { dropToken, saveToken } from './token';

afterEach(dropToken);

describe('createApi', () => {
  it('sends the saved X-Token and stops sending it after the token is removed', async () => {
    const api = createApi();
    const mock = new MockAdapter(api, { onNoMatch: 'throwException' });
    mock.onGet('/offers').reply(StatusCodes.OK, []);
    const token = 'test-session-token';

    saveToken(token);
    expect(localStorage.getItem('six-cities-token')).toBe(token);

    const authorizedResponse = await api.get('/offers');
    expect(authorizedResponse.config.headers.get('X-Token')).toBe(token);

    dropToken();
    const guestResponse = await api.get('/offers');
    expect(guestResponse.config.headers.has('X-Token')).toBe(false);
  });
});
