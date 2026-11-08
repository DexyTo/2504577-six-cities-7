import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import MainPage from './pages/main-page/main-page';
import LoginPage from './pages/login-page/login-page';
import FavoritesPage from './pages/favorites-page/favorites-page';
import OfferPage from './pages/offer-page/offer-page';
import NotFoundPage from './pages/not-found-page/not-found-page';
import PrivateRoute from './components/private-route/private-route';
import Spinner from './components/spinner/spinner';
import { AppRoute } from './const';
import { useAppSelector } from './hooks';
import {
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

export default function App(): JSX.Element {
  const offers = useAppSelector(getOffers);
  const offersStatus = useAppSelector(getOffersStatus);
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
        <Route element={offersOutlets[offersStatus]}>
          <Route path={AppRoute.Main} element={<MainPage />} />
        </Route>
        <Route
          element={<PrivateRoute>{offersOutlets[offersStatus]}</PrivateRoute>}
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
