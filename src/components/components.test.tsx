import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusCodes } from 'http-status-codes';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AMSTERDAM, PARIS } from '../cities';
import { AppRoute, getOfferRoute, SortType } from '../const';
import { dropToken, saveToken } from '../services/token';
import { setAuthorization } from '../store/action';
import { offerPreview, review, user } from '../test/fixtures';
import { createMockedTestStore, createTestStore } from '../test/test-store';
import BookmarkButton from './bookmark-button/bookmark-button';
import CitiesList from './cities-list/cities-list';
import CommentForm from './comment-form/comment-form';
import Header from './header/header';
import NoPlaces from './no-places/no-places';
import PlaceCard from './place-card/place-card';
import PlaceCardsList from './place-cards-list/place-cards-list';
import Review from './review/review';
import ReviewsList from './reviews-list/reviews-list';
import SortingOptions from './sorting-options/sorting-options';
import Spinner from './spinner/spinner';

function renderWithStore(component: ReactElement, store = createTestStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>,
  );
}

afterEach(dropToken);

describe('CitiesList', () => {
  it('renders the cities and marks the selected city', () => {
    render(<CitiesList cities={[PARIS, AMSTERDAM]} selectedCity={AMSTERDAM} onCityChange={vi.fn()} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Amsterdam' })).toHaveClass('tabs__item--active');
    expect(screen.getByRole('link', { name: 'Paris' })).not.toHaveClass('tabs__item--active');
  });

  it('passes the clicked city to the change handler', async () => {
    const onCityChange = vi.fn();
    const visitor = userEvent.setup();
    render(<CitiesList cities={[PARIS, AMSTERDAM]} selectedCity={PARIS} onCityChange={onCityChange} />);

    await visitor.click(screen.getByRole('link', { name: AMSTERDAM.name }));

    expect(onCityChange.mock.calls).toEqual([[AMSTERDAM]]);
  });
});

describe('NoPlaces', () => {
  it('names the city in the empty state', () => {
    render(<NoPlaces cityName={PARIS.name} />);

    expect(screen.getByText('No places to stay available')).toBeInTheDocument();
    expect(screen.getByText(/at the moment in Paris/)).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('renders an accessible loading status', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });
});

describe('Review', () => {
  it('renders the author, comment, and review date', () => {
    render(
      <ul>
        <Review review={review} />
      </ul>,
    );

    expect(screen.getByRole('img', { name: 'Anna avatar' })).toHaveAttribute('src', user.avatarUrl);
    expect(screen.getByText(user.name)).toBeInTheDocument();
    expect(screen.getByText(review.comment)).toBeInTheDocument();
    expect(screen.getByText('May 2024')).toHaveAttribute('datetime', review.date);
  });
});

describe('ReviewsList', () => {
  it('renders the count and each review', () => {
    const secondReview = { ...review, id: 'review-2', comment: 'Very quiet at night.' };

    render(<ReviewsList reviews={[review, secondReview]} />);

    expect(screen.getByRole('heading', { name: 'Reviews · 2' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText(review.comment)).toBeInTheDocument();
    expect(screen.getByText(secondReview.comment)).toBeInTheDocument();
  });

  it('shows the ten most recent reviews and counts every review', () => {
    const reviews = Array.from({ length: 12 }, (_, index) => ({
      ...review,
      id: `review-${index + 1}`,
      comment: `Review ${index + 1}`,
      date: new Date(Date.UTC(2024, 4, index + 1)).toISOString(),
    }));
    const shuffled = [...reviews.slice(6), ...reviews.slice(0, 6)];

    render(<ReviewsList reviews={shuffled} />);

    const renderedComments = screen.getAllByRole('listitem').map((item) =>
      within(item).getByText(/^Review \d+$/).textContent,
    );
    expect(screen.getByRole('heading', { name: 'Reviews · 12' })).toBeInTheDocument();
    expect(renderedComments).toEqual(reviews.slice(2).reverse().map(({ comment }) => comment));
  });
});

describe('PlaceCard', () => {
  it('renders the offer image, title, price, type, and premium label', () => {
    renderWithStore(<PlaceCard offerData={offerPreview} />);

    expect(screen.getByRole('img', { name: offerPreview.title })).toHaveAttribute('src', offerPreview.previewImage);
    expect(screen.getByRole('heading', { name: offerPreview.title })).toBeInTheDocument();
    expect(screen.getByText(`€${offerPreview.price}`)).toBeInTheDocument();
    expect(screen.getByText('Apartment')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it.each([[3.1, '60%'], [4.5, '100%']])('rounds a rating of %s to whole stars', (rating, width) => {
    const { container } = renderWithStore(<PlaceCard offerData={{ ...offerPreview, rating }} />);

    expect(container.querySelector('.place-card__stars > span')).toHaveStyle({ width });
  });

  it('opens the offer when the title is clicked', async () => {
    const visitor = userEvent.setup();
    renderWithStore(
      <Routes>
        <Route path={AppRoute.Main} element={<PlaceCard offerData={offerPreview} />} />
        <Route path={getOfferRoute(offerPreview.id)} element={<h1>Offer details</h1>} />
      </Routes>,
    );
    const card = screen.getByRole('article');
    const title = within(card).getByRole('heading', { name: offerPreview.title });
    const image = within(card).getByRole('img', { name: offerPreview.title });
    expect(image.closest('a')).toHaveAttribute('href', getOfferRoute(offerPreview.id));

    await visitor.click(within(title).getByRole('link'));

    expect(screen.getByRole('heading', { name: 'Offer details' })).toBeInTheDocument();
  });
});

describe('PlaceCardsList', () => {
  it('renders a card for each offer', () => {
    const secondOffer = { ...offerPreview, id: 'paris-studio', title: 'Studio in Montmartre' };

    renderWithStore(<PlaceCardsList offers={[offerPreview, secondOffer]} />);

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: offerPreview.title })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: secondOffer.title })).toBeInTheDocument();
  });

  it('reports the hovered offer ID and clears it when the pointer leaves', async () => {
    const visitor = userEvent.setup();
    const onCardHover = vi.fn();
    const secondOffer = { ...offerPreview, id: 'paris-studio' };
    renderWithStore(<PlaceCardsList offers={[offerPreview, secondOffer]} onCardHover={onCardHover} />);

    const [, secondCard] = screen.getAllByRole('article');
    await visitor.hover(secondCard);
    await visitor.unhover(secondCard);

    expect(onCardHover.mock.calls).toEqual([[secondOffer.id], [null]]);
  });
});

describe('BookmarkButton', () => {
  it('redirects a guest to sign-in without sending a favorite request', async () => {
    const { store, mock } = createMockedTestStore();
    store.dispatch(setAuthorization(null));
    const visitor = userEvent.setup();

    renderWithStore(
      <Routes>
        <Route
          path={AppRoute.Main}
          element={<BookmarkButton offerId={offerPreview.id} initialStatus={false} variant="place-card" />}
        />
        <Route path={AppRoute.Login} element={<h1>Sign in</h1>} />
      </Routes>,
      store,
    );

    await visitor.click(screen.getByRole('button', { name: 'Add to favorites' }));

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(mock.history.post).toHaveLength(0);
  });

  it('renders the remove label for a saved offer', () => {
    const store = createTestStore();
    store.dispatch(setAuthorization(user));

    renderWithStore(<BookmarkButton offerId={offerPreview.id} initialStatus variant="offer" />, store);

    expect(screen.getByRole('button', { name: 'Remove from favorites' })).toBeEnabled();
  });

  it('adds and removes a favorite when an authorized user clicks the bookmark', async () => {
    const { store, mock } = createMockedTestStore();
    const visitor = userEvent.setup();
    store.dispatch(setAuthorization(user));
    const favoriteUrl = `/favorite/${offerPreview.id}`;
    mock.onPost(`${favoriteUrl}/1`).replyOnce(StatusCodes.OK, { ...offerPreview, isFavorite: true });
    mock.onPost(`${favoriteUrl}/0`).replyOnce(StatusCodes.OK, offerPreview);

    renderWithStore(<BookmarkButton offerId={offerPreview.id} initialStatus={false} variant="place-card" />, store);

    await visitor.click(screen.getByRole('button', { name: 'Add to favorites' }));
    const removeButton = await screen.findByRole('button', { name: 'Remove from favorites' });
    expect(removeButton).toHaveClass('place-card__bookmark-button--active');

    await visitor.click(removeButton);
    expect(await screen.findByRole('button', { name: 'Add to favorites' })).toBeEnabled();
    expect(mock.history.post.map(({ url }) => url)).toEqual([`${favoriteUrl}/1`, `${favoriteUrl}/0`]);
  });
});

describe('Header', () => {
  it('renders the logo and sign-in link for a guest', () => {
    const store = createTestStore();
    store.dispatch(setAuthorization(null));
    renderWithStore(<Header />, store);

    expect(screen.getByRole('link', { name: '6 cities logo' })).toHaveAttribute('href', AppRoute.Main);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', AppRoute.Login);
  });

  it('renders the profile link and sign-out button for an authorized user', () => {
    const store = createTestStore();
    store.dispatch(setAuthorization(user));
    renderWithStore(<Header />, store);

    const profile = screen.getByRole('link', { name: `${user.email} 0` });
    expect(profile).toHaveAttribute('href', AppRoute.Favorites);
    expect(profile.querySelector('.header__avatar-wrapper')).toBeEmptyDOMElement();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeEnabled();
  });

  it('signs out and clears the saved token after clicking Sign out', async () => {
    const { store, mock } = createMockedTestStore();
    const visitor = userEvent.setup();
    store.dispatch(setAuthorization(user));
    saveToken('test-session-token');
    mock.onDelete('/logout').replyOnce(StatusCodes.NO_CONTENT);
    renderWithStore(<Header />, store);

    await visitor.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
    expect(mock.history.delete.map(({ url }) => url)).toEqual(['/logout']);
    expect(localStorage.getItem('six-cities-token')).toBeNull();
  });

  it('displays an error and keeps the user signed in when sign-out fails', async () => {
    const { store, mock } = createMockedTestStore();
    const visitor = userEvent.setup();
    store.dispatch(setAuthorization(user));
    mock.onDelete('/logout').networkErrorOnce();
    renderWithStore(<Header />, store);

    await visitor.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not sign out');
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeEnabled();
    expect(screen.getByRole('link', { name: `${user.email} 0` })).toBeInTheDocument();
  });
});

describe('CommentForm', () => {
  it('renders the empty review form with five rating options', () => {
    renderWithStore(<CommentForm offerId={offerPreview.id} onCommentPosted={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Your review' })).toHaveValue('');
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('submits the selected rating and trimmed review, then resets the form', async () => {
    const { store, mock } = createMockedTestStore();
    const visitor = userEvent.setup();
    const onCommentPosted = vi.fn();
    store.dispatch(setAuthorization(user));
    let finishRequest = () => {};
    mock.onPost(`/comments/${offerPreview.id}`).replyOnce(() => new Promise((resolve) => {
      finishRequest = () => resolve([StatusCodes.CREATED, review]);
    }));
    renderWithStore(<CommentForm offerId={offerPreview.id} onCommentPosted={onCommentPosted} />, store);
    const submit = screen.getByRole('button', { name: 'Submit' });
    const input = screen.getByRole('textbox', { name: 'Your review' });
    const rating = screen.getByTitle('good');

    await visitor.click(rating);
    expect(screen.getByRole('radio', { checked: true })).toHaveAttribute('value', String(review.rating));
    expect(submit).toBeDisabled();

    await visitor.type(input, `  ${review.comment}  `);
    expect(submit).toBeEnabled();
    await visitor.click(submit);

    expect(submit).toBeDisabled();
    expect(input).toBeDisabled();
    screen.getAllByRole('radio').forEach((star) => expect(star).toBeDisabled());
    finishRequest();

    await waitFor(() => expect(onCommentPosted).toHaveBeenCalledWith(review));
    expect(mock.history.post).toMatchObject([{
      data: JSON.stringify({ rating: review.rating, comment: review.comment }),
    }]);
    expect(input).toHaveValue('');
    expect(screen.queryByRole('radio', { checked: true })).not.toBeInTheDocument();
    expect(submit).toBeDisabled();
  });

  it('preserves the entered review after a failure and posts it on retry', async () => {
    const { store, mock } = createMockedTestStore();
    const visitor = userEvent.setup();
    const onCommentPosted = vi.fn();
    store.dispatch(setAuthorization(user));
    mock.onPost(`/comments/${offerPreview.id}`).networkErrorOnce();
    mock.onPost(`/comments/${offerPreview.id}`).replyOnce(StatusCodes.CREATED, review);
    renderWithStore(<CommentForm offerId={offerPreview.id} onCommentPosted={onCommentPosted} />, store);
    const input = screen.getByRole('textbox', { name: 'Your review' });
    const submit = screen.getByRole('button', { name: 'Submit' });

    await visitor.type(input, review.comment);
    await visitor.click(screen.getByTitle('good'));
    await visitor.click(submit);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not post your review');
    expect(input).toHaveValue(review.comment);
    expect(screen.getByRole('radio', { checked: true })).toHaveAttribute('value', String(review.rating));
    expect(submit).toBeEnabled();
    expect(onCommentPosted).not.toHaveBeenCalled();

    await visitor.click(submit);

    await waitFor(() => expect(onCommentPosted).toHaveBeenCalledWith(review));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('SortingOptions', () => {
  it('opens the list, marks the current option, and closes after a selection', async () => {
    const visitor = userEvent.setup();
    const onSortChange = vi.fn();
    render(<SortingOptions sortType={SortType.Popular} onSortChange={onSortChange} />);

    await visitor.click(screen.getByRole('button', { name: SortType.Popular }));
    const options = screen.getByRole('list');
    expect(options).toHaveClass('places__options--opened');
    expect(within(options).getByText(SortType.Popular)).toHaveClass('places__option--active');

    await visitor.click(within(options).getByText(SortType.PriceLowToHigh));
    expect(onSortChange).toHaveBeenCalledWith(SortType.PriceLowToHigh);
    expect(options).not.toHaveClass('places__options--opened');
  });

  it('closes with Escape or an outside click without changing the sort', async () => {
    const visitor = userEvent.setup();
    const onSortChange = vi.fn();
    render(<SortingOptions sortType={SortType.Popular} onSortChange={onSortChange} />);
    const toggle = screen.getByRole('button', { name: SortType.Popular });
    const options = screen.getByRole('list');

    await visitor.click(toggle);
    await visitor.keyboard('{Escape}');
    expect(options).not.toHaveClass('places__options--opened');

    await visitor.click(toggle);
    expect(options).toHaveClass('places__options--opened');
    await visitor.click(document.body);
    expect(options).not.toHaveClass('places__options--opened');
    expect(onSortChange).not.toHaveBeenCalled();
  });
});
