import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './app';
import { offers } from './mocks/offers';
import { reviews } from './mocks/reviews';
import { store } from './store';
import { fillOffers } from './store/action';

store.dispatch(fillOffers(offers));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App reviews={reviews} />
    </Provider>
  </React.StrictMode>,
);
