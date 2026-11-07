export enum AppRoute {
  Main = '/',
  Login = '/login',
  Favorites = '/favorites',
  Offer = '/offer/:id',
}

export enum AuthorizationStatus {
  Auth = 'AUTH',
  NoAuth = 'NO_AUTH',
}

export enum SortType {
  Popular = 'Popular',
  PriceLowToHigh = 'Price: low to high',
  PriceHighToLow = 'Price: high to low',
  TopRatedFirst = 'Top rated first',
}

export type UserInfo = {
  name: string;
  avatarUrl: string;
  isPro: boolean;
};

export type ReviewData = {
  id: string;
  user: UserInfo;
  rating: number;
  comment: string;
  date: string;
};

export type Location = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export type City = {
  name: string;
  location: Location;
};

type OfferMinimum = {
  id: string;
  city: City;
  location: Location;
  isPremium: boolean;
  title: string;
  price: number;
  isFavorite: boolean;
  type: string;
  rating: number;
};

export type OfferPreview = OfferMinimum & {
  previewImage: string;
};

export type Offer = OfferMinimum & {
  images: string[];
  bedrooms: number;
  maxAdults: number;
  goods: string[];
  host: UserInfo;
  description: string;
};

export const getOfferRoute = (id: string) => `/offer/${id}`;
