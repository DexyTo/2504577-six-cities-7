import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';
import { StatusCodes } from 'http-status-codes';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './app';
import { AMSTERDAM } from './cities';
import { AppRoute, getOfferRoute, SortType } from './const';
import { dropToken } from './services/token';
import { setAuthorization } from './store/action';
import { offer, offerPreview, review, user } from './test/fixtures';
import { createMockedTestStore, type createTestStore } from './test/test-store';

vi.mock('./components/map/map', () => ({
  default: ({ activeOfferId }: { activeOfferId?: string | null }) => (
    <div data-testid="offer-map" data-active-offer-id={activeOfferId} />
  ),
}));

describe('App routing', () => {
  let mock: MockAdapter;
  let store: ReturnType<typeof createTestStore>;
  let previousUrl: string;

  beforeEach(() => {
    previousUrl = window.location.href;
    ({ mock, store } = createMockedTestStore());
  });

  afterEach(() => {
    mock.restore();
    dropToken();
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

  it('sorts the current city offers, highlights a hovered card, and changes city', async () => {
    const visitor = userEvent.setup();
    const cheaperOffer = { ...offerPreview, id: 'cheaper', title: 'Paris studio', price: 60 };
    const amsterdamOffer = {
      ...offerPreview,
      id: 'amsterdam',
      title: 'Amsterdam apartment',
      city: AMSTERDAM,
      location: AMSTERDAM.location,
    };
    store.dispatch(setAuthorization(null));
    mock.onGet('/offers').replyOnce(StatusCodes.OK, [offerPreview, cheaperOffer, amsterdamOffer]);
    renderRoute(AppRoute.Main);

    await screen.findByRole('heading', { name: offerPreview.title });
    const cardTitles = () => screen.getAllByRole('article').map((card) => within(card).getByRole('heading').textContent);
    expect(cardTitles()).toEqual([offerPreview.title, cheaperOffer.title]);

    await visitor.click(screen.getByRole('button', { name: SortType.Popular }));
    await visitor.click(screen.getByText(SortType.PriceLowToHigh));
    expect(cardTitles()).toEqual([cheaperOffer.title, offerPreview.title]);

    const [firstCard] = screen.getAllByRole('article');
    await visitor.hover(firstCard);
    expect(screen.getByTestId('offer-map')).toHaveAttribute('data-active-offer-id', cheaperOffer.id);
    await visitor.unhover(firstCard);
    expect(screen.getByTestId('offer-map')).not.toHaveAttribute('data-active-offer-id');

    await visitor.click(screen.getByRole('link', { name: AMSTERDAM.name }));
    expect(screen.getByText('1 places to stay in Amsterdam')).toBeInTheDocument();
    expect(cardTitles()).toEqual([amsterdamOffer.title]);
  });

  it('displays a message when the offers server is unavailable', async () => {
    store.dispatch(setAuthorization(null));
    mock.onGet('/offers').networkErrorOnce();
    renderRoute(AppRoute.Main);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load places to stay');
  });

  it('opens the sign-in form from the header and returns home through the city link', async () => {
    const visitor = userEvent.setup();
    store.dispatch(setAuthorization(null));
    mock.onGet('/offers').replyOnce(StatusCodes.OK, []);
    renderRoute(AppRoute.Main);

    await visitor.click(await screen.findByRole('link', { name: 'Sign in' }));

    expect(window.location.pathname).toBe(AppRoute.Login);
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    await visitor.click(screen.getByRole('link', { name: AMSTERDAM.name }));
    expect(screen.getByRole('heading', { name: 'Cities' })).toBeInTheDocument();
    expect(window.location.pathname).toBe(AppRoute.Main);
  });

  it('sends login credentials, saves the token, and opens the cities page', async () => {
    const visitor = userEvent.setup();
    const credentials = { email: user.email, password: 'test-password1' };
    store.dispatch(setAuthorization(null));
    mock.onPost('/login', credentials).replyOnce(StatusCodes.OK, { ...user, token: 'test-session-token' });
    mock.onGet('/favorite').replyOnce(StatusCodes.OK, []);
    mock.onGet('/offers').replyOnce(StatusCodes.OK, []);
    renderRoute(AppRoute.Login);

    await visitor.type(screen.getByLabelText('E-mail'), credentials.email);
    await visitor.type(screen.getByLabelText('Password'), credentials.password);
    await visitor.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Cities' })).toBeInTheDocument();
    expect(window.location.pathname).toBe(AppRoute.Main);
    expect(localStorage.getItem('six-cities-token')).toBe('test-session-token');
  });

  it('shows a validation message for a whitespace-only password', async () => {
    const visitor = userEvent.setup();
    store.dispatch(setAuthorization(null));
    renderRoute(AppRoute.Login);

    await visitor.type(screen.getByLabelText('E-mail'), user.email);
    await visitor.type(screen.getByLabelText('Password'), '   ');
    await visitor.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Enter a password that contains a non-space character.');
    expect(mock.history.post).toHaveLength(0);
  });

  it('displays a server validation error and leaves the sign-in form available', async () => {
    const visitor = userEvent.setup();
    const message = 'Check your email and password.';
    store.dispatch(setAuthorization(null));
    mock.onPost('/login').replyOnce(StatusCodes.BAD_REQUEST, { message });
    renderRoute(AppRoute.Login);

    await visitor.type(screen.getByLabelText('E-mail'), user.email);
    await visitor.type(screen.getByLabelText('Password'), 'test-password1');
    await visitor.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    expect(window.location.pathname).toBe(AppRoute.Login);
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

  it('opens saved offers through the authorized user’s profile link', async () => {
    const visitor = userEvent.setup();
    store.dispatch(setAuthorization(user));
    mock.onGet('/offers').replyOnce(StatusCodes.OK, []);
    mock
      .onGet('/favorite')
      .replyOnce(StatusCodes.OK, [{ ...offerPreview, isFavorite: true }]);
    renderRoute(AppRoute.Main);

    const profile = await screen.findByRole('link', { name: (name) => name.startsWith(user.email) });
    await visitor.click(profile);

    expect(
      await screen.findByRole('heading', { name: offerPreview.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Saved listing' }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe(AppRoute.Favorites);
  });

  it('shows an empty favorites list and returns home through the footer', async () => {
    const visitor = userEvent.setup();
    store.dispatch(setAuthorization(user));
    mock.onGet('/favorite').replyOnce(StatusCodes.OK, []);
    mock.onGet('/offers').replyOnce(StatusCodes.OK, []);
    renderRoute(AppRoute.Favorites);

    expect(await screen.findByText('Nothing yet saved.')).toBeInTheDocument();
    const footer = screen.getByRole('contentinfo');
    await visitor.click(within(footer).getByRole('link', { name: '6 cities logo' }));

    expect(await screen.findByRole('heading', { name: 'Cities' })).toBeInTheDocument();
    expect(window.location.pathname).toBe(AppRoute.Main);
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
    expect(screen.getByText(offer.description)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reviews · 0' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Your review' })).not.toBeInTheDocument();
  });

  it('shows a newly submitted review in the offer review list', async () => {
    const visitor = userEvent.setup();
    const nearbyOffer = { ...offerPreview, id: 'nearby', title: 'Nearby apartment' };
    store.dispatch(setAuthorization(user));
    mock.onGet('/favorite').replyOnce(StatusCodes.OK, []);
    mock.onGet(`/offers/${offer.id}`).replyOnce(StatusCodes.OK, offer);
    mock.onGet(`/offers/${offer.id}/nearby`).replyOnce(StatusCodes.OK, [nearbyOffer]);
    mock.onGet(`/comments/${offer.id}`).replyOnce(StatusCodes.OK, []);
    mock.onPost(`/comments/${offer.id}`).replyOnce(StatusCodes.CREATED, review);
    renderRoute(getOfferRoute(offer.id));

    const reviewInput = await screen.findByRole('textbox', { name: 'Your review' });
    expect(screen.getByRole('heading', { name: nearbyOffer.title })).toBeInTheDocument();
    await visitor.hover(screen.getByRole('article'));
    expect(screen.getByTestId('offer-map')).toHaveAttribute('data-active-offer-id', nearbyOffer.id);

    await visitor.type(reviewInput, review.comment);
    await visitor.click(screen.getByTitle('good'));
    await visitor.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText(review.comment)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reviews · 1' })).toBeInTheDocument();
  });

  it('shows an error when the offer server is unavailable', async () => {
    store.dispatch(setAuthorization(null));
    mock.onGet(`/offers/${offer.id}`).networkErrorOnce();
    mock.onGet(`/offers/${offer.id}/nearby`).replyOnce(StatusCodes.OK, []);
    mock.onGet(`/comments/${offer.id}`).replyOnce(StatusCodes.OK, []);
    renderRoute(getOfferRoute(offer.id));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this place');
    expect(window.location.pathname).toBe(getOfferRoute(offer.id));
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

  it('renders the 404 page for an unknown URL and lets the user return home', async () => {
    const visitor = userEvent.setup();
    store.dispatch(setAuthorization(null));
    mock.onGet('/offers').replyOnce(StatusCodes.OK, []);
    renderRoute('/unknown');

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    await visitor.click(screen.getByRole('link', { name: 'Перейти на главную' }));

    expect(await screen.findByRole('heading', { name: 'Cities' })).toBeInTheDocument();
    expect(window.location.pathname).toBe(AppRoute.Main);
  });
});
