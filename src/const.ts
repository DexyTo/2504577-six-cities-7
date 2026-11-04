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

export type Host = {
  name: string;
  avatarUrl: string;
  isPro: boolean;
};

export type ReviewData = {
  id: number;
  offerId: number;
  user: {
    name: string;
    avatarUrl: string;
  };
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

export type Offer = {
  id: number;
  city: City;
  location: Location;
  premium: boolean;
  name: string;
  img: string;
  images: string[];
  price: number;
  priceText: string;
  inBookmarks: boolean;
  typeHousing: string;
  rating: number;
  bedrooms: number;
  maxAdults: number;
  goods: string[];
  host: Host;
  description: string[];
};

export const getOfferRoute = (id: number) => `/offer/${id}`;
