import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app';

export type offer = {
  id: number;
  premium: boolean;
  name: string;
  img: string;
  price: number;
  priceText: string;
  inBookmarks: boolean;
  typeHousing: string;
  rating: number;
};

const offers: offer[] = [
  {
    id: 1,
    premium: true,
    name: 'Beautiful & luxurious apartment at great location',
    img: 'img/apartment-01.jpg',
    price: 120,
    priceText: 'night',
    inBookmarks: false,
    typeHousing: 'Apartment',
    rating: 4,
  },
  {
    id: 2,
    premium: false,
    name: 'Wood and stone place',
    img: 'img/room.jpg',
    price: 80,
    priceText: 'night',
    inBookmarks: true,
    typeHousing: 'Room',
    rating: 4,
  },
  {
    id: 3,
    premium: false,
    name: 'Canal View Prinsengracht',
    img: 'img/apartment-02.jpg',
    price: 132,
    priceText: 'night',
    inBookmarks: false,
    typeHousing: 'Apartment',
    rating: 4,
  },
  {
    id: 4,
    premium: true,
    name: 'Nice, cozy, warm big bed apartment',
    img: 'img/apartment-03.jpg',
    price: 180,
    priceText: 'night',
    inBookmarks: false,
    typeHousing: 'Apartment',
    rating: 5,
  },
  {
    id: 5,
    premium: false,
    name: 'Wood and stone place',
    img: 'img/room.jpg',
    price: 80,
    priceText: 'night',
    inBookmarks: true,
    typeHousing: 'Room',
    rating: 4,
  },
];

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <App offers={offers} />
  </React.StrictMode>,
);
