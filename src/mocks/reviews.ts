import type { ReviewData } from '../const';

export const reviews: ReviewData[] = [
  {
    id: 1,
    offerId: 1,
    user: {
      name: 'Max',
      avatarUrl: 'img/avatar-max.jpg',
    },
    rating: 4,
    comment: 'A quiet cozy and picturesque that hides behind a river by the unique lightness of Amsterdam. The building is green and from 18th century.',
    date: '2019-04-24',
  },
  {
    id: 2,
    offerId: 1,
    user: {
      name: 'Angelina',
      avatarUrl: 'img/avatar-angelina.jpg',
    },
    rating: 5,
    comment: 'The apartment was clean and comfortable, with a lovely view of the canal. The host was welcoming and helped us settle in quickly.',
    date: '2019-05-12',
  },
  {
    id: 3,
    offerId: 2,
    user: {
      name: 'Max',
      avatarUrl: 'img/avatar-max.jpg',
    },
    rating: 4,
    comment: 'A comfortable room in a quiet neighbourhood. It was easy to reach the city centre, and the kitchen had everything we needed.',
    date: '2019-06-03',
  },
];
