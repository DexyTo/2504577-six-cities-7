import { configureStore } from '@reduxjs/toolkit';
import { createApi } from '../services/api';
import { cityReducer } from './city-reducer';
import { offersReducer } from './offers-reducer';
import { userReducer } from './user-reducer';

const api = createApi();

export const store = configureStore({
  reducer: {
    city: cityReducer,
    offers: offersReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: { extraArgument: api },
    }),
});

export type State = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
