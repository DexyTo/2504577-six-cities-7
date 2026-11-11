import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AMSTERDAM, PARIS } from '../cities';
import { AppRoute } from '../const';
import { setAuthorization } from '../store/action';
import { offerPreview, review, user } from '../test/fixtures';
import { createTestStore } from '../test/test-store';
import BookmarkButton from './bookmark-button/bookmark-button';
import CitiesList from './cities-list/cities-list';
import CommentForm from './comment-form/comment-form';
import Header from './header/header';
import NoPlaces from './no-places/no-places';
import PlaceCard from './place-card/place-card';
import PlaceCardsList from './place-cards-list/place-cards-list';
import Review from './review/review';
import ReviewsList from './reviews-list/reviews-list';
import Spinner from './spinner/spinner';

function renderWithStore(component: ReactElement, store = createTestStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>,
  );
}

describe('CitiesList', () => {
  it('renders the cities and marks the selected city', () => {
    render(<CitiesList cities={[PARIS, AMSTERDAM]} selectedCity={AMSTERDAM} onCityChange={vi.fn()} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Amsterdam' })).toHaveClass('tabs__item--active');
    expect(screen.getByRole('link', { name: 'Paris' })).not.toHaveClass('tabs__item--active');
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
});

describe('PlaceCard', () => {
  it('renders the offer image, title, price, type, and premium label', () => {
    renderWithStore(<PlaceCard offerData={offerPreview} />);

    expect(screen.getByRole('img', { name: offerPreview.title })).toHaveAttribute('src', offerPreview.previewImage);
    expect(screen.getByRole('heading', { name: offerPreview.title })).toBeInTheDocument();
    expect(screen.getByText(`€${offerPreview.price}`)).toBeInTheDocument();
    expect(screen.getByText(offerPreview.type)).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
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
});

describe('BookmarkButton', () => {
  it('renders an enabled add button for a guest', () => {
    const store = createTestStore();
    store.dispatch(setAuthorization(null));

    renderWithStore(<BookmarkButton offerId={offerPreview.id} initialStatus={false} variant="place-card" />, store);

    expect(screen.getByRole('button', { name: 'Add to favorites' })).toBeEnabled();
  });

  it('renders the remove label for a saved offer', () => {
    const store = createTestStore();
    store.dispatch(setAuthorization(user));

    renderWithStore(<BookmarkButton offerId={offerPreview.id} initialStatus variant="offer" />, store);

    expect(screen.getByRole('button', { name: 'Remove from favorites' })).toBeEnabled();
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

    expect(screen.getByRole('link', { name: user.email })).toHaveAttribute('href', AppRoute.Favorites);
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeEnabled();
  });
});

describe('CommentForm', () => {
  it('renders the empty review form with five rating options', () => {
    renderWithStore(<CommentForm offerId={offerPreview.id} onCommentPosted={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Your review' })).toHaveValue('');
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });
});
