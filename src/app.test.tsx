import { render, screen } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { StatusCodes } from 'http-status-codes';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './app';
import { AppRoute, getOfferRoute } from './const';
import { setAuthorization } from './store/action';
import { offer, offerPreview, user } from './test/fixtures';
import { createTestStore } from './test/test-store';

vi.mock('./components/map/map', () => ({ default: () => null }));

describe('App routing', () => {
  let mock: MockAdapter;
  let store: ReturnType<typeof createTestStore>;
  let previousUrl: string;

  beforeEach(() => {
    previousUrl = window.location.href;
    const api = axios.create();
    mock = new MockAdapter(api, { onNoMatch: 'throwException' });
    store = createTestStore(api);
  });

  afterEach(() => {
    mock.restore();
    window.history.replaceState(null, '', previousUrl);
  });

  function renderRoute(path: string) {
    window.history.replaceState(null, '', path);
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
  }

  it('renders the cities page at the root URL', async () => {
    store.dispatch(setAuthorization(null));
    mock.onGet('/offers').replyOnce(StatusCodes.OK, []);
    renderRoute(AppRoute.Main);

    expect(
      await screen.findByRole('heading', { name: 'Cities' }),
    ).toBeInTheDocument();
  });

  it('renders the sign-in form for a guest at /login', () => {
    store.dispatch(setAuthorization(null));
    renderRoute(AppRoute.Login);

    expect(
      screen.getByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('redirects an authorized user from /login to the cities page', async () => {
    store.dispatch(setAuthorization(user));
    mock.onGet('/favorite').replyOnce(StatusCodes.OK, []);
    mock.onGet('/offers').replyOnce(StatusCodes.OK, []);
    renderRoute(AppRoute.Login);

    expect(
      await screen.findByRole('heading', { name: 'Cities' }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe(AppRoute.Main);
  });

  it('redirects a guest from /favorites to /login', async () => {
    store.dispatch(setAuthorization(null));
    renderRoute(AppRoute.Favorites);

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe(AppRoute.Login);
  });

  it('waits for authorization to be resolved at /favorites', () => {
    renderRoute(AppRoute.Favorites);

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(window.location.pathname).toBe(AppRoute.Favorites);
  });

  it('renders saved offers for an authorized user at /favorites', async () => {
    store.dispatch(setAuthorization(user));
    mock
      .onGet('/favorite')
      .replyOnce(StatusCodes.OK, [{ ...offerPreview, isFavorite: true }]);
    renderRoute(AppRoute.Favorites);

    expect(
      await screen.findByRole('heading', { name: offerPreview.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Saved listing' }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe(AppRoute.Favorites);
  });

  it('renders the offer identified by the route parameter', async () => {
    store.dispatch(setAuthorization(null));
    mock.onGet(`/offers/${offer.id}`).replyOnce(StatusCodes.OK, offer);
    mock.onGet(`/offers/${offer.id}/nearby`).replyOnce(StatusCodes.OK, []);
    mock.onGet(`/comments/${offer.id}`).replyOnce(StatusCodes.OK, []);
    renderRoute(getOfferRoute(offer.id));

    expect(
      await screen.findByRole('heading', { level: 1, name: offer.title }),
    ).toBeInTheDocument();
  });

  it('redirects to /404 when the requested offer does not exist', async () => {
    store.dispatch(setAuthorization(null));
    mock.onGet('/offers/missing').replyOnce(StatusCodes.NOT_FOUND);
    mock.onGet('/offers/missing/nearby').replyOnce(StatusCodes.OK, []);
    mock.onGet('/comments/missing').replyOnce(StatusCodes.OK, []);
    renderRoute(getOfferRoute('missing'));

    expect(
      await screen.findByRole('heading', { name: '404' }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe(AppRoute.NotFound);
  });

  it('renders the 404 page for an unknown URL', () => {
    renderRoute('/unknown');

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });
});
