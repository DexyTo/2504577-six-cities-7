import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import MainPage from './pages/main-page/main-page';
import LoginPage from './pages/login-page/login-page';
import FavoritesPage from './pages/favorites-page/favorites-page';
import OfferPage from './pages/offer-page/offer-page';
import NotFoundPage from './pages/not-found-page/not-found-page';
import PrivateRoute from './components/private-route/private-route';
import Spinner from './components/spinner/spinner';
import { AppRoute, AuthorizationStatus } from './const';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchOffers } from './store/api-action';
import {
  getAuthorizationStatus,
  getHasAuthCheckError,
  getOffers,
  getOffersStatus,
} from './store/selectors';

const offersOutlets = {
  loading: <Spinner />,
  succeeded: <Outlet />,
  failed: (
    <p className="container" role="alert">
      Could not load places to stay. Please refresh the page to try again.
    </p>
  ),
};

function OffersLoader(): JSX.Element {
  const dispatch = useAppDispatch();
  const authorizationStatus = useAppSelector(getAuthorizationStatus);
  const offersStatus = useAppSelector(getOffersStatus);

  useEffect(() => {
    if (authorizationStatus === AuthorizationStatus.Unknown) {
      return;
    }

    const request = dispatch(fetchOffers());
    return () => request.abort();
  }, [authorizationStatus, dispatch]);

  return offersOutlets[offersStatus];
}

export default function App(): JSX.Element {
  const offers = useAppSelector(getOffers);
  const hasAuthCheckError = useAppSelector(getHasAuthCheckError);

  return (
    <BrowserRouter>
      {hasAuthCheckError ? (
        <p className="container" role="alert">
          Could not check your sign-in status. Please refresh the page to try
          again.
        </p>
      ) : null}
      <Routes>
        <Route element={<OffersLoader />}>
          <Route path={AppRoute.Main} element={<MainPage />} />
        </Route>
        <Route
          element={
            <PrivateRoute>
              <OffersLoader />
            </PrivateRoute>
          }
        >
          <Route
            path={AppRoute.Favorites}
            element={<FavoritesPage offers={offers} />}
          />
        </Route>
        <Route path={AppRoute.Login} element={<LoginPage />} />
        <Route path={AppRoute.Offer} element={<OfferPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
