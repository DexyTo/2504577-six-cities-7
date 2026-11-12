import { useEffect } from 'react';
import { BrowserRouter, Navigate, Routes, Route, Outlet } from 'react-router-dom';
import MainPage from './pages/main-page/main-page';
import LoginPage from './pages/login-page/login-page';
import FavoritesPage from './pages/favorites-page/favorites-page';
import OfferPage from './pages/offer-page/offer-page';
import NotFoundPage from './pages/not-found-page/not-found-page';
import Header from './components/header/header';
import PrivateRoute from './components/private-route/private-route';
import Spinner from './components/spinner/spinner';
import { AppRoute, AuthorizationStatus } from './const';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchFavorites, fetchOffers } from './store/api-action';
import {
  getAuthorizationStatus,
  getHasAuthCheckError,
  getOffersStatus,
} from './store/selectors';

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

  if (offersStatus === 'succeeded') {
    return <Outlet />;
  }

  return (
    <div className="page page--gray">
      <Header />
      {offersStatus === 'loading' ? (
        <Spinner />
      ) : (
        <p className="container" role="alert">
          Could not load places to stay. Please refresh the page to try again.
        </p>
      )}
    </div>
  );
}

export default function App(): JSX.Element {
  const dispatch = useAppDispatch();
  const authorizationStatus = useAppSelector(getAuthorizationStatus);
  const hasAuthCheckError = useAppSelector(getHasAuthCheckError);

  useEffect(() => {
    if (authorizationStatus === AuthorizationStatus.Auth) {
      void dispatch(fetchFavorites());
    }
  }, [authorizationStatus, dispatch]);

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
          path={AppRoute.Favorites}
          element={
            <PrivateRoute>
              <FavoritesPage />
            </PrivateRoute>
          }
        />
        <Route path={AppRoute.Login} element={<LoginPage />} />
        <Route path={AppRoute.Offer} element={<OfferPage />} />
        <Route path={AppRoute.NotFound} element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to={AppRoute.NotFound} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
