import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { cityReducer } from '../store/city-reducer';
import { favoritesReducer } from '../store/favorites-reducer';
import { offersReducer } from '../store/offers-reducer';
import { userReducer } from '../store/user-reducer';

export function createTestStore(api = axios.create()) {
  return configureStore({
    reducer: {
      city: cityReducer,
      favorites: favoritesReducer,
      offers: offersReducer,
      user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: api } }),
  });
}

export function createMockedTestStore() {
  const api = axios.create();
  const mock = new MockAdapter(api, { onNoMatch: 'throwException' });

  return { store: createTestStore(api), mock };
}
