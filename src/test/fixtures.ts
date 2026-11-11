import { PARIS } from '../cities';
import type { AuthUser, Offer, OfferPreview, ReviewData } from '../const';

export const user: AuthUser = {
  name: 'Anna',
  email: 'anna@example.com',
  avatarUrl: '/img/avatar-angelina.jpg',
  isPro: false,
};

const place = {
  id: 'paris-loft',
  city: PARIS,
  location: PARIS.location,
  isPremium: true,
  title: 'Loft near the Seine',
  price: 120,
  isFavorite: false,
  type: 'apartment',
  rating: 4,
};

export const offerPreview: OfferPreview = {
  ...place,
  previewImage: '/img/apartment-01.jpg',
};

export const offer: Offer = {
  ...place,
  images: [offerPreview.previewImage],
  bedrooms: 1,
  maxAdults: 2,
  goods: ['Wi-Fi'],
  host: user,
  description: 'A quiet loft in central Paris.',
};

export const review: ReviewData = {
  id: 'review-1',
  user,
  rating: 4,
  comment: 'A comfortable stay close to the river and the city center.',
  date: '2024-05-15T12:00:00.000Z',
};
