import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoute } from '../../const';
import { setAuthorization } from '../../store/action';
import { user } from '../../test/fixtures';
import { createTestStore } from '../../test/test-store';
import PrivateRoute from './private-route';

function LoginDestination() {
  const navigate = useNavigate();
  return (
    <>
      <h1>Sign in</h1>
      <button type="button" onClick={() => navigate(-1)}>Go back</button>
    </>
  );
}

function renderPrivateRoute(store = createTestStore()) {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[AppRoute.Main, AppRoute.Favorites]}>
        <Routes>
          <Route path={AppRoute.Main} element={<h1>Home</h1>} />
          <Route path={AppRoute.Login} element={<LoginDestination />} />
          <Route
            path={AppRoute.Favorites}
            element={<PrivateRoute><h1>Saved offers</h1></PrivateRoute>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('PrivateRoute', () => {
  it('shows a loading status while authorization is unknown', () => {
    renderPrivateRoute();

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders the protected content for an authorized user', () => {
    const store = createTestStore();
    store.dispatch(setAuthorization(user));

    renderPrivateRoute(store);

    expect(screen.getByRole('heading', { name: 'Saved offers' })).toBeInTheDocument();
  });

  it('redirects a guest to sign-in and replaces the protected history entry', async () => {
    const store = createTestStore();
    store.dispatch(setAuthorization(null));
    const visitor = userEvent.setup();

    renderPrivateRoute(store);

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Saved offers' })).not.toBeInTheDocument();

    await visitor.click(screen.getByRole('button', { name: 'Go back' }));
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
});
